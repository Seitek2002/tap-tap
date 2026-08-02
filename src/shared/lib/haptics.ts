import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// В нативной Capacitor-сборке дёргает Taptic Engine (iOS) / вибромотор
// (Android) через @capacitor/haptics. В обычном вебе плагин сам подставляет
// свою web-реализацию поверх navigator.vibrate — код один и тот же что здесь,
// что после упаковки в Capacitor.
// Важно: navigator.vibrate в принципе не поддерживается в iOS Safari/WKWebView
// без Capacitor — это ограничение платформы, а не баг, и обойти веб-способом
// его нельзя (см. MDN: Vibration API browser compatibility).
const vibrateFallback = (durationMs: number) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(durationMs);
  }
};

export const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
  Haptics.impact({ style }).catch(() => vibrateFallback(10));
};

// Для более значимых событий (совпадение, подтверждение удаления/блокировки,
// ошибка) — отдельный вид вибро-паттерна вместо обычного «тычка».
export const triggerNotificationHaptic = (type: NotificationType) => {
  Haptics.notification({ type }).catch(() => vibrateFallback(25));
};

export { ImpactStyle, NotificationType };
