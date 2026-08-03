import { useEffect } from "react";

import { ImpactStyle, triggerHaptic } from "./haptics";

// Кнопки/дропдауны/чекбоксы/навлинки/тогглы у нас почти везде — это либо
// <button>, либо <label> (Toggle/Checkbox оборачивают input именно так), либо
// input[type=checkbox|radio] напрямую. Один делегирующий слушатель на
// document вместо ручной вставки хука в каждый файл — иначе пришлось бы
// трогать десятки страниц.
const INTERACTIVE_SELECTOR =
  'button, a, label, [role="button"], input[type="checkbox"], input[type="radio"]';

// Элемент может переопределить силу вибро-тика через data-haptic="medium|heavy",
// либо отключить автоматический тик через data-haptic="none" — когда за вибрацию
// уже отвечает конкретный обработчик (например у события есть выбор между
// обычным Impact и Notification, который делегирование не умеет выбирать само).
const HAPTIC_OVERRIDE_STYLES: Record<string, ImpactStyle> = {
  heavy: ImpactStyle.Heavy,
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
};

/** Вибро-тик по нажатию на кнопки/дропдауны/чекбоксы/навлинки/тогглы. */
export const useHapticTaps = () => {
  useEffect(() => {
    // click, а не pointerdown: pointerdown стреляет в момент касания экрана —
    // ровно так же, как в начале скролла, если палец опустился на строку-
    // кнопку (например в списке чатов). click браузер сам не генерирует,
    // если между touchstart и touchend палец увёл за порог — то есть при
    // скролле/свайпе click не сработает, а при обычном тапе сработает сразу
    // на отпускании, без заметной задержки.
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) return;
      if ((interactive as HTMLButtonElement).disabled) return;

      const override = interactive.getAttribute("data-haptic");
      if (override === "none") return;

      triggerHaptic(override ? HAPTIC_OVERRIDE_STYLES[override] : undefined);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
};
