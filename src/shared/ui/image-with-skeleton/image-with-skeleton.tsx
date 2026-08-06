import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

type ImageWithSkeletonProps = {
  alt: string;
  className?: string;
  // "lazy" везде, кроме видимой сразу без скролла карточки (см. SwipeCard) —
  // там eager, чтобы не откладывать самое важное, что видит пользователь.
  loading?: "eager" | "lazy";
  src: string;
};

// className достаётся ОБЁРТКЕ (тот же размер/скругление/позиционирование,
// что раньше было на самом <img>) — картинка и скелетон внутри всегда просто
// заполняют её целиком, поэтому скелетон точно совпадает по форме с фото,
// которое он временно подменяет.
export const ImageWithSkeleton = ({
  alt,
  className,
  loading = "lazy",
  src,
}: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Картинка могла отрисоваться из кэша ещё до того, как React успел
  // подписаться на onLoad — .complete проверяет это на каждую смену src.
  useEffect(() => {
    setIsLoaded(imgRef.current?.complete ?? false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
};
