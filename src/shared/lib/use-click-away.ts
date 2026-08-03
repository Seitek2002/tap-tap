import { type RefObject, useEffect } from "react";

/** Вызывает onAway при клике/тапе вне элемента ref (замена react-use). */
export function useClickAway(
  ref: RefObject<HTMLElement | null>,
  onAway: () => void,
) {
  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) {
        onAway();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onAway]);
}
