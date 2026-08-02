import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type PillVariant = "filled" | "outline";

type PillProps = {
  selected?: boolean;
  variant?: PillVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Стили по варианту и состоянию выбора.
const STYLES: Record<PillVariant, { off: string; on: string }> = {
  filled: {
    off: "bg-[#F2F1F3] text-[#1C1E24]",
    on: "bg-[#1C1E24] text-white",
  },
  outline: {
    off: "border border-[#E4E7EC] bg-white text-[#1C1E24]",
    on: "border border-primary bg-primary/5 text-[#1C1E24]",
  },
};

/**
 * Пилюля-чип с состоянием выбора. variant: "filled" (тёмная заливка) или
 * "outline" (контур, фиолетовый при выборе). Ширину/паддинги/раскладку задаёт
 * потребитель через className и родительский контейнер.
 */
export const Pill = ({
  className,
  selected = false,
  variant = "filled",
  ...props
}: PillProps) => (
  <button
    type="button"
    className={cn(
      "rounded-full px-3 py-2 text-xs font-medium transition-colors",
      STYLES[variant][selected ? "on" : "off"],
      className,
    )}
    {...props}
  />
);
