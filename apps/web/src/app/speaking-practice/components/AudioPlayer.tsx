"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Volume2, Pause } from "lucide-react";

interface AudioPlayerProps {
  audioBase64: string | null;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({ audioBase64, autoPlay = false, onPlayStateChange }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }
  }, [onPlayStateChange]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  }, [onPlayStateChange]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Update audio source when base64 changes
  useEffect(() => {
    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.onended = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };
      audioRef.current = audio;

      if (autoPlay) {
        audio.play().catch(console.error);
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBase64]);

  if (!audioBase64) return null;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
        isPlaying
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
      }`}
      aria-label={isPlaying ? "Tạm dừng" : "Phát audio"}
    >
      {isPlaying ? <Pause className="size-3" /> : <Volume2 className="size-3" />}
      {isPlaying ? "Đang phát" : "Nghe"}
    </button>
  );
}
