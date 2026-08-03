import { type InputHTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

type CheckboxSize = "large" | "small";

type CheckboxProps = {
  indeterminate?: boolean;
  label?: string;
  size?: CheckboxSize;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Checkbox = ({
  className,
  indeterminate,
  label,
  size = "small",
  ...props
}: CheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    large: "size-5",
    small: "size-4",
  };

  const visualBase = cn(
    "relative flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
    "border-border-soft bg-white",
    "peer-checked:bg-primary peer-checked:border-primary",
    "peer-indeterminate:bg-primary peer-indeterminate:border-primary",
    "peer-focus-visible:shadow-[0_0_0.5px_2px_rgba(124,58,237,0.2)] peer-focus-visible:border-primary",
    "peer-checked:[&>.check]:opacity-100 peer-checked:[&>.check]:scale-100",
    "peer-indeterminate:[&>.minus]:opacity-100 peer-indeterminate:[&>.minus]:scale-100",
    sizeClasses[size],
  );

  const iconStyles = "text-white shrink-0 size-3";

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-2.5",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          className="peer sr-only"
          disabled={props.disabled}
          {...props}
        />

        <div className={visualBase}>
          <div className="check absolute inset-0 flex scale-50 items-center justify-center opacity-0 transition-all duration-200">
            <svg viewBox="0 0 12 12" fill="none" className={iconStyles}>
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="minus absolute inset-0 flex scale-50 items-center justify-center opacity-0 transition-all duration-200">
            <svg viewBox="0 0 12 12" fill="none" className={iconStyles}>
              <path
                d="M2.5 6H9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-overlay">{label}</span>
      )}
    </label>
  );
};
