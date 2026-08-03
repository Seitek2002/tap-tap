import { type InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

type RadioSize = "large" | "small";

type RadioProps = {
  label?: string;
  size?: RadioSize;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Radio = ({
  className,
  label,
  size = "small",
  ...props
}: RadioProps) => {
  const sizeClasses = {
    large: "size-5",
    small: "size-4",
  };

  const radioVisualBase = cn(
    "rounded-full border-2 transition-all duration-200",
    "border-[#6B7280] bg-white",
    "peer-checked:border-primary",
    "peer-focus-visible:shadow-[0_0_0.5px_2px_rgba(124,58,237,0.2)] peer-focus-visible:border-primary",
    sizeClasses[size],
  );

  // Точка — отдельный сиблинг инпута (не потомок radioVisualBase): у Tailwind
  // peer-checked работает через общий комбинатор `~`, который не достаёт до
  // потомков соседа. Из-за вложенности точка не реагировала на чек, менялась
  // только обводка кольца.
  const dotClasses = cn(
    "absolute inset-0 m-auto rounded-full bg-primary opacity-0 scale-0 transition-all duration-200 peer-checked:opacity-100 peer-checked:scale-100",
    size === "small" ? "size-2" : "size-2.5",
  );

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-2.5",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <input type="radio" className="peer sr-only" {...props} />

        <div className={radioVisualBase} />
        <div className={dotClasses} />
      </div>

      {label && (
        <span className="text-sm font-medium text-overlay">{label}</span>
      )}
    </label>
  );
};
