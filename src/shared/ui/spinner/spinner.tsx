import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type SpinnerProps = {
  className?: string;
};

// Мелкие действия (отправка, сохранение) — вращающийся индикатор без текста,
// а не полноэкранный лоадер. Для карточек данных вместо этого — Skeleton.
export const Spinner = ({ className }: SpinnerProps) => (
  <Loader2 className={cn("size-4 animate-spin", className)} />
);
