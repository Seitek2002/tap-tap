import { useEffect } from "react";

import { triggerHaptic } from "./haptics";

// Кнопки/дропдауны/чекбоксы/навлинки/тогглы у нас почти везде — это либо
// <button>, либо <label> (Toggle/Checkbox оборачивают input именно так), либо
// input[type=checkbox|radio] напрямую. Один делегирующий слушатель на
// document вместо ручной вставки хука в каждый файл — иначе пришлось бы
// трогать десятки страниц.
const INTERACTIVE_SELECTOR =
  'button, a, label, [role="button"], input[type="checkbox"], input[type="radio"]';

/** Лёгкий вибро-тик по нажатию на кнопки/дропдауны/чекбоксы/навлинки/тогглы. */
export const useHapticTaps = () => {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return;
      if ((interactive as HTMLButtonElement).disabled) return;

      triggerHaptic();
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, []);
};
