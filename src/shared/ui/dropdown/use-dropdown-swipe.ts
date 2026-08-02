import { type TouchEvent, useRef } from "react";

/** Свайп bottom-sheet вниз для закрытия (мобильный дропдаун). */
export const useDropdownSwipe = (onClose: () => void) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ time: 0, y: 0 });

  const onTouchStart = (event: TouchEvent) => {
    touchStart.current = { time: Date.now(), y: event.touches[0].clientY };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = event.touches[0].clientY - touchStart.current.y;

    if (scrollRef.current?.contains(event.target as Node)) {
      if (scrollRef.current.scrollTop > 0 || deltaY < 0) return;
    }

    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    const timeElapsed = Date.now() - touchStart.current.time;
    const velocity = deltaY / timeElapsed;

    sheetRef.current.style.transition =
      "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";
    sheetRef.current.style.transform = "";

    if (deltaY > 150 || velocity > 0.5) onClose();
  };

  return {
    handlers: { onTouchEnd, onTouchMove, onTouchStart },
    scrollRef,
    sheetRef,
  };
};
