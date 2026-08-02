import { type ChangeEvent } from "react";

import { cn } from "@/shared/lib/utils";

import { THUMB } from "./thumb";

type RangeSliderProps = {
  className?: string;
  max: number;
  min: number;
  onChange: (value: [number, number]) => void;
  step?: number;
  value: [number, number];
};

/** Двухползунковый слайдер диапазона. Полностью контролируемый — стейт у родителя. */
export const RangeSlider = ({
  className,
  max,
  min,
  onChange,
  step = 1,
  value,
}: RangeSliderProps) => {
  const [minVal, maxVal] = value;

  const getPercent = (val: number) =>
    Math.round(((val - min) / (max - min)) * 100);

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(event.target.value), maxVal - step);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(event.target.value), minVal + step);
    onChange([minVal, val]);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-full border border-border-soft px-5 py-3",
        className,
      )}
    >
      <span className="shrink-0 text-sm text-foreground">{minVal}</span>

      <div className="relative flex h-5 flex-1 items-center">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border-soft" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: `${getPercent(minVal)}%`,
            width: `${getPercent(maxVal) - getPercent(minVal)}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 z-20 h-5 w-full -translate-y-1/2 appearance-none bg-transparent",
            THUMB,
          )}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 z-20 h-5 w-full -translate-y-1/2 appearance-none bg-transparent",
            THUMB,
          )}
        />
      </div>

      <span className="shrink-0 text-sm text-foreground">{maxVal}</span>
    </div>
  );
};
