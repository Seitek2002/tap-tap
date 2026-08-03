import type { ButtonHTMLAttributes, ComponentType, SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Variant = "default" | "outline" | "text";
type Sizes = "lg" | "md" | "sm" | "xs";

type ButtonProps = {
  IconLeft?: IconType;
  IconRight?: IconType;
  loading?: boolean;
  size?: Sizes;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  className,
  IconLeft,
  IconRight,
  loading,
  size = "xs",
  variant = "default",
  ...props
}: ButtonProps) => {
  const sizes: Record<Sizes, string> = {
    lg: "h-[52px] text-base px-8",
    md: "h-12 text-sm md:text-base px-6",
    sm: "h-10 text-sm px-5 relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    xs: "h-8 text-xs px-4 relative after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
  };

  const baseStyles =
    "font-medium flex items-center justify-center gap-2 cursor-pointer transition-all rounded-full outline-none disabled:opacity-50 disabled:pointer-events-none shrink-0 " +
    sizes[size];

  const variants: Record<Variant, string> = {
    default:
      "bg-primary text-white active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(124,58,237,0.3)]",
    outline:
      "border border-border active:bg-border-soft hover:shadow-[0_0_1px_3px_rgba(242,243,245,0.8),0_0_0_1px_#E5E6E8] hover:bg-transparent",
    text: "text-foreground active:bg-border-soft hover:bg-background",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
      disabled={props.disabled || loading}
    >
      {IconLeft && <IconLeft className="size-5" />}
      <span>{children}</span>
      {IconRight && <IconRight className="size-5" />}
    </button>
  );
};
