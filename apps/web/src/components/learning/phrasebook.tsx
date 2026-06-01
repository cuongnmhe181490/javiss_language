"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

import { cancelSpeech, isSpeechSupported, speakPhrase } from "@/lib/speech";
import type { LanguageCode, PhraseTopic } from "@/lib/content/phrasebook-data";

/**
 * Interactive phrasebook for a target language. Each phrase has a play button
 * that speaks it in the correct locale via the browser Web Speech API.
 */
export function Phrasebook({ lang, topics }: { lang: LanguageCode; topics: PhraseTopic[] }) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [noVoiceNotice, setNoVoiceNotice] = useState(false);

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  function play(key: string, text: string) {
    if (!isSpeechSupported()) {
      setNoVoiceNotice(true);
      return;
    }
    if (playingKey === key) {
      cancelSpeech();
      setPlayingKey(null);
      return;
    }
    setPlayingKey(key);
    const hasVoice = speakPhrase(text, lang, {
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
    if (!hasVoice) {
      // Locale voice not installed on this device; still attempts default voice.
      setNoVoiceNotice(true);
    }
  }

  return (
    <div className="space-y-8">
      {noVoiceNotice && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          Thiết bị của bạn có thể chưa cài giọng đọc cho ngôn ngữ này. Phát âm có thể không chuẩn —
          hãy dựa vào phiên âm bên dưới.
        </p>
      )}

      {topics.map((topic) => (
        <section key={topic.id}>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">{topic.title}</h2>
          <ul className="space-y-2">
            {topic.phrases.map((phrase, index) => {
              const key = `${topic.id}-${index}`;
              const isPlaying = playingKey === key;
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4"
                >
                  <button
                    onClick={() => play(key, phrase.text)}
                    aria-label={`Nghe: ${phrase.text}`}
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition ${
                      isPlaying
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300"
                    }`}
                  >
                    <Volume2 className={`size-4 ${isPlaying ? "animate-pulse" : ""}`} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-base font-medium text-slate-100">{phrase.text}</p>
                    {phrase.reading && (
                      <p className="text-sm text-emerald-300/80">{phrase.reading}</p>
                    )}
                    <p className="mt-0.5 text-sm text-slate-400">{phrase.vi}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
