import { type ChangeEvent } from "react";

import { cn } from "@/shared/lib/utils";

import { THUMB } from "./thumb";

type SliderProps = {
  className?: string;
  disabled?: boolean;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
};

/** Одиночный слайдер (track + один ползунок). Обёртку/подпись задаёт потребитель. */
export const Slider = ({
  className,
  disabled = false,
  max,
  min = 0,
  onChange,
  step = 1,
  value,
}: SliderProps) => {
  const percent = Math.round(((value - min) / (max - min)) * 100);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div
      className={cn(
        "relative flex h-5 items-center",
        disabled && "opacity-40",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full bg-border-soft" />
      <div
        className="absolute top-1/2 left-0 h-px -translate-y-1/2 rounded-full bg-primary"
        style={{ width: `${percent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          "absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent disabled:cursor-not-allowed",
          THUMB,
        )}
      />
    </div>
  );
};
