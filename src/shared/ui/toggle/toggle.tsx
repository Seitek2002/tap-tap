import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Переключатель on/off (iOS-style свитч).
 * group-has-checked, а не peer-checked: кружок вложен внутрь трека (не прямой
 * сосед input), а has-checked видит :checked на любой глубине потомков.
 */
export const Toggle = ({ className, ...props }: ToggleProps) => (
  <label
    className={cn("group inline-flex cursor-pointer items-center", className)}
  >
    <input type="checkbox" className="sr-only" {...props} />
    <span className="relative h-7 w-12 rounded-full bg-[#E4E7EC] transition-colors group-has-checked:bg-primary">
      <span className="absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform group-has-checked:translate-x-5" />
    </span>
  </label>
);
