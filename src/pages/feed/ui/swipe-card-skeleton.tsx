import { Skeleton } from "@/shared/ui/skeleton";

// Место карточки в стеке, пока ещё не пришёл первый ответ GET /api/feed —
// без неё после гайд-карточки на миг мелькало бы "Пока никого рядом", хотя
// люди на самом деле ещё грузятся, а не отсутствуют.
export const SwipeCardSkeleton = () => (
  <Skeleton className="absolute inset-0 rounded-3xl" />
);
