import { cn } from "@/shared/lib/utils";

type SkeletonProps = {
  className?: string;
};

// Карточки данных (список чатов, фото, профили) — пульсирующая заглушка
// формы контента, пока не пришли реальные данные. Для мелких действий
// (отправка, сохранение) вместо этого — Spinner.
export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse rounded-2xl bg-[#E4E7EC]", className)} />
);
