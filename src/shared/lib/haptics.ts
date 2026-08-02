import { Haptics, ImpactStyle } from "@capacitor/haptics";

// В нативной Capacitor-сборке дёргает Taptic Engine (iOS) / вибромотор
// (Android) через @capacitor/haptics. В обычном вебе плагин сам подставляет
// свою web-реализацию поверх navigator.vibrate — код один и тот же что здесь,
// что после упаковки в Capacitor.
// Важно: navigator.vibrate в принципе не поддерживается в iOS Safari/WKWebView
// без Capacitor — это ограничение платформы, а не баг, и обойти веб-способом
// его нельзя (см. MDN: Vibration API browser compatibility).
export const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
  Haptics.impact({ style }).catch(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  });
};

export { ImpactStyle };
