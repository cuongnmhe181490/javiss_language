import { NextRequest, NextResponse } from "next/server";
import { getAIClient, getAIConfig, getOpenAIClient, hasOpenAIFeatures } from "@/lib/ai-provider";
import { scenarios } from "./scenarios";

export const runtime = "nodejs";
export const maxDuration = 60;

interface SpeakingResponse {
  transcript: string;
  aiResponse: string;
  audioBase64: string | null;
  feedback: {
    pronunciation: Array<{ type: "good" | "warning"; text: string; detail: string }>;
    grammar: Array<{ type: "good" | "warning"; text: string; detail: string }>;
    suggestion: string;
  };
  /** Tells client whether server-side TTS/STT is available */
  capabilities: {
    serverSTT: boolean;
    serverTTS: boolean;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const textInput = formData.get("text") as string | null;
    const scenarioId = formData.get("scenarioId") as string | null;
    const historyRaw = formData.get("history") as string | null;

    if (!scenarioId) {
      return NextResponse.json({ error: "No scenarioId provided" }, { status: 400 });
    }

    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Invalid scenarioId" }, { status: 400 });
    }

    // Determine transcript: either from server-side Whisper or client-side Web Speech API
    let transcript: string;

    if (textInput) {
      // Client already transcribed via Web Speech API
      transcript = textInput.trim();
    } else if (audioFile && hasOpenAIFeatures()) {
      // Server-side transcription with Whisper
      const openai = getOpenAIClient()!;
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "text",
      });
      transcript =
        typeof transcription === "string"
          ? transcription.trim()
          : (transcription as unknown as { text: string }).text.trim();
    } else if (audioFile) {
      // No OpenAI key — client should use Web Speech API and send text instead
      return NextResponse.json(
        {
          error: "Server STT unavailable. Use client-side speech recognition and send text field.",
        },
        { status: 422 },
      );
    } else {
      return NextResponse.json({ error: "No audio or text input provided" }, { status: 400 });
    }

    // Build conversation history
    const history: Array<{ role: "user" | "assistant"; content: string }> = [];
    if (historyRaw) {
      try {
        const parsed = JSON.parse(historyRaw) as Array<{ role: string; content: string }>;
        for (const msg of parsed) {
          if (msg.role === "user" || msg.role === "assistant") {
            history.push({ role: msg.role, content: msg.content });
          }
        }
      } catch {
        // ignore malformed history
      }
    }

    // Chat completion via configured provider (9router or OpenAI)
    const aiClient = getAIClient();
    const config = getAIConfig();

    const chatCompletion = await aiClient.chat.completions.create({
      model: config.chatModel,
      messages: [
        {
          role: "system",
          content: `${scenario.systemPrompt}

Additionally, after your in-character response, provide feedback on the learner's English in the following JSON format on a new line starting with "FEEDBACK_JSON:":
FEEDBACK_JSON:{"pronunciation":[{"type":"good"|"warning","text":"...","detail":"..."}],"grammar":[{"type":"good"|"warning","text":"...","detail":"..."}],"suggestion":"..."}

Rules for feedback:
- pronunciation: comment on specific words/phrases (good pronunciation or needs improvement)
- grammar: note any grammar issues or praise correct usage
- suggestion: one brief tip for improvement
- Keep feedback concise and encouraging
- If the learner's English is perfect, still give at least one "good" item`,
        },
        ...history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const fullResponse = chatCompletion.choices[0]?.message?.content ?? "";

    // Parse AI response and feedback
    let feedback: SpeakingResponse["feedback"] = {
      pronunciation: [],
      grammar: [],
      suggestion: "",
    };

    const feedbackSplit = fullResponse.split("FEEDBACK_JSON:");
    const aiResponse = feedbackSplit[0]?.trim() ?? fullResponse;

    if (feedbackSplit[1]) {
      try {
        const feedbackJson = feedbackSplit[1].trim();
        const jsonMatch = feedbackJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedback = JSON.parse(jsonMatch[0]) as SpeakingResponse["feedback"];
        }
      } catch {
        // Use default empty feedback if parsing fails
      }
    }

    // TTS: generate audio if OpenAI is available, otherwise client uses SpeechSynthesis
    let audioBase64: string | null = null;

    if (hasOpenAIFeatures()) {
      const openai = getOpenAIClient()!;
      const ttsResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: aiResponse,
        response_format: "mp3",
      });
      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      audioBase64 = audioBuffer.toString("base64");
    }

    const response: SpeakingResponse = {
      transcript,
      aiResponse,
      audioBase64,
      feedback,
      capabilities: {
        serverSTT: hasOpenAIFeatures(),
        serverTTS: hasOpenAIFeatures(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Speaking API error:", error);

    if (error instanceof Error && error.message.includes("No AI provider configured")) {
      return NextResponse.json(
        { error: "No AI provider configured. Check server environment variables." },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Failed to process speaking request" }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    scenarios: scenarios.map((s) => ({
      id: s.id,
      title: s.title,
      titleVi: s.titleVi,
      description: s.description,
      descriptionVi: s.descriptionVi,
      level: s.level,
    })),
    capabilities: {
      serverSTT: hasOpenAIFeatures(),
      serverTTS: hasOpenAIFeatures(),
    },
  });
}
