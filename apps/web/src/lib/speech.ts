/**
 * Browser text-to-speech helpers built on the Web Speech API (SpeechSynthesis).
 * Used to give listening exercises real spoken audio without requiring any
 * server-side TTS or media files.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak a sequence of transcript lines in order. Different speakers alternate
 * pitch slightly so a two-person dialogue is easier to follow. Calls `onEnd`
 * (or `onError`) when the whole sequence finishes or fails.
 */
export function speakDialogue(
  lines: string[],
  options: { onEnd?: () => void; onError?: () => void } = {},
): void {
  if (!isSpeechSupported()) {
    options.onError?.();
    return;
  }

  window.speechSynthesis.cancel();

  const voice = pickEnglishVoice();
  const speakerPitch = new Map<string, number>();
  let nextPitch = 1.05;

  const utterances = lines.map((line) => {
    const colonIndex = line.indexOf(":");
    const speaker = colonIndex > -1 ? line.slice(0, colonIndex).trim() : "";
    const text = colonIndex > -1 ? line.slice(colonIndex + 1).trim() : line;

    let pitch = 1;
    if (speaker) {
      if (!speakerPitch.has(speaker)) {
        speakerPitch.set(speaker, nextPitch);
        nextPitch = nextPitch > 1 ? 0.9 : 1.05;
      }
      pitch = speakerPitch.get(speaker) ?? 1;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = pitch;
    if (voice) utterance.voice = voice;
    return utterance;
  });

  if (utterances.length === 0) {
    options.onEnd?.();
    return;
  }

  const last = utterances[utterances.length - 1];
  if (last) {
    last.onend = () => options.onEnd?.();
    last.onerror = () => options.onError?.();
  }

  for (const utterance of utterances) {
    window.speechSynthesis.speak(utterance);
  }
}
