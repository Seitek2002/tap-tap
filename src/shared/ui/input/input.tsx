import type { ComponentType, InputHTMLAttributes, Ref, SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type InputProps = {
  className?: string;
  error?: string;
  hint?: string;
  iconClassName?: string;
  IconLeft?: IconType;
  IconRight?: IconType;
  label?: string;
  labelClassName?: string;
  onIconRightClick?: () => void;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({
  className,
  error,
  hint,
  iconClassName,
  IconLeft,
  IconRight,
  label,
  labelClassName,
  onIconRightClick,
  ref,
  type = "text",
  ...props
}: InputProps) => {
  return (
    <label
      htmlFor={props.id}
      className={cn("flex flex-col gap-2 text-sm", labelClassName)}
    >
      {label && <span className="font-bold">{label}</span>}

      <div className="relative w-full">
        {IconLeft && (
          <IconLeft
            className={cn(
              "absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#6B7280]",
              iconClassName,
            )}
          />
        )}

        <input
          ref={ref}
          id={props.id}
          type={type}
          className={cn(
            "w-full rounded-full border border-[#E4E7EC] px-4 py-3.5 font-medium outline-none",
            IconLeft && "pl-11",
            IconRight && "pr-11",
            error && "border-[#EC778D]",
            className,
          )}
          {...props}
        />

        {IconRight && (
          <IconRight
            className={cn(
              "absolute top-1/2 right-4 size-5 -translate-y-1/2 cursor-pointer text-[#6B7280]",
              iconClassName,
            )}
            onClick={onIconRightClick}
          />
        )}
      </div>

      {error && <span className="text-xs text-[#DF1C41]">{error}</span>}
      {hint && <span className="text-xs text-[#6B7280]">{hint}</span>}
    </label>
  );
};
