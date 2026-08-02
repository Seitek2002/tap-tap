import { cn } from "@/shared/lib/utils";

type ProgressProps = {
  className?: string;
  value: number;
};

/** Прогресс-бар с подписью процента. value — заполнение 0–100. */
export const Progress = ({ className, value }: ProgressProps) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="h-0.75 flex-1 rounded-full bg-[#E4E7EC]">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-sm text-[#6B7280]">{value} %</span>
  </div>
);
