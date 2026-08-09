import { useRef, useState } from "react";

import { Pause, Play } from "lucide-react";

import { formatDuration } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type VoicePlayerProps = {
  className?: string;
  src: string;
};

/** Плеер для голосовых записей (голосовая визитка в анкете, голосовые
 * сообщения в чате) — play/pause + прошедшее время. */
export const VoicePlayer = ({ className, src }: VoicePlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else void audio.play();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setCurrentSec(0)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentSec(event.currentTarget.currentTime)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Пауза" : "Слушать"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <span className="text-xs text-[#6B7280]">
        {formatDuration(currentSec)}
      </span>
    </div>
  );
};
