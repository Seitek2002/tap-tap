import { type ChangeEvent, useRef, useState } from "react";

import { Pause, Play } from "lucide-react";

import { formatDuration } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type VoiceMessagePlayerProps = {
  className?: string;
  // Известна сразу после записи (см. useAudioRecorder) — показывается до
  // того, как <audio> успеет подгрузить метаданные, дальше перезатирается
  // настоящей duration из самого файла (может на доли секунды отличаться).
  initialDurationSec?: number;
  src: string;
  // primary — на светлой подложке (входящее сообщение, превью перед
  // отправкой); white — на цветном фоне исходящего пузыря, где primary-
  // окрашенные элементы слились бы с фоном.
  tone?: "primary" | "white";
};

const TONE = {
  primary: {
    button: "bg-primary text-white",
    fill: "bg-primary",
    thumb:
      "[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary",
    time: "text-[#6B7280]",
    track: "bg-border-soft",
  },
  white: {
    button: "bg-white text-primary",
    fill: "bg-white",
    thumb: "[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:bg-white",
    time: "text-white/80",
    track: "bg-white/30",
  },
};

const THUMB_BASE =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

/** Голосовое сообщение — play/pause + перемотка (в начало/середину/конец,
 * не только play-до-конца), переиспользуется и для превью перед отправкой,
 * и для уже отправленных сообщений в чате. */
export const VoiceMessagePlayer = ({
  className,
  initialDurationSec,
  src,
  tone = "primary",
}: VoiceMessagePlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(initialDurationSec ?? 0);
  const colors = TONE[tone];

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else void audio.play();
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setCurrentSec(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const maxSec = durationSec || 1;
  const percent = Math.min(100, Math.round((currentSec / maxSec) * 100));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onEnded={() => setCurrentSec(0)}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          if (Number.isFinite(audio.duration)) {
            setDurationSec(audio.duration);
            return;
          }
          // Известный баг Chrome: webm от MediaRecorder не пишет duration в
          // контейнер (стриминговый формат), audio.duration навсегда
          // остаётся Infinity, пока браузер не просканирует файл целиком —
          // это провоцируется сиком в заведомо большое время, после чего
          // duration становится настоящим числом (см. timeupdate ниже).
          audio.currentTime = 1e101;
          audio.ontimeupdate = () => {
            audio.ontimeupdate = null;
            audio.currentTime = 0;
            if (Number.isFinite(audio.duration)) setDurationSec(audio.duration);
          };
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentSec(event.currentTarget.currentTime)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Пауза" : "Слушать"}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          colors.button,
        )}
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </button>
      <div className="relative flex h-3 flex-1 items-center">
        <div
          className={cn(
            "absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full",
            colors.track,
          )}
        />
        <div
          className={cn(
            "absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full",
            colors.fill,
          )}
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={0}
          max={maxSec}
          step={0.1}
          value={Math.min(currentSec, maxSec)}
          onChange={seek}
          aria-label="Перемотка"
          className={cn(
            "absolute inset-x-0 top-1/2 h-3 w-full -translate-y-1/2 appearance-none bg-transparent",
            THUMB_BASE,
            colors.thumb,
          )}
        />
      </div>
      <span className={cn("w-9 shrink-0 text-right text-xs", colors.time)}>
        {formatDuration(currentSec || durationSec)}
      </span>
    </div>
  );
};
