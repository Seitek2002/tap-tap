import { cn } from "@/shared/lib/utils";
import { ZODIAC_ICONS } from "@/shared/lib/zodiac";

type ZodiacBadgeProps = {
  className?: string;
  sign: string;
};

export const ZodiacBadge = ({ className, sign }: ZodiacBadgeProps) => {
  const Icon = ZODIAC_ICONS[sign];

  return (
    <span className={cn("flex items-center gap-1", className)}>
      {Icon && <Icon className="size-3.5" />}
      {sign}
    </span>
  );
};
