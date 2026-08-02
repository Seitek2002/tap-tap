import type { CapacitorConfig } from "@capacitor/cli";

// Нативных android/ios проектов в репозитории пока нет (npx cap add ...
// ещё не запускали) — SplashScreen-плагину физически нечего показывать без
// собственных ассетов (android/app/.../splash.png, ios/.../Assets.xcassets).
// Этот конфиг готовит именно логику показа/скрытия, чтобы когда платформы
// добавят — оставалось только сгенерировать картинки, а не переписывать код.
const config: CapacitorConfig = {
  appId: "com.taptap.app",
  appName: "TapTap",
  plugins: {
    SplashScreen: {
      // Скрываем сами через SplashScreen.hide() (см. src/app/app.tsx) —
      // ровно в тот момент, когда убираем свой HTML-прелоадер из index.html,
      // чтобы нативный сплэш и веб-прелоадер не мигали друг поверх друга.
      androidScaleType: "CENTER_CROP",
      backgroundColor: "#7c3aed",
      launchAutoHide: false,
      launchShowDuration: 0,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  webDir: "dist",
};

export default config;
