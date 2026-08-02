import { RouterProvider } from "react-router";

import { SplashScreen } from "@capacitor/splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import { useHapticTaps } from "@/shared/lib/use-haptic-taps";
import { queryClient } from "@/shared/config";

import { router } from "./router";

const PRELOADER_FADE_MS = 300;

export function App() {
  useHapticTaps();

  // Прелоадер в index.html показывался, пока грузился бандл. Как только
  // React смонтировался и отрисовал первый роут — плавно убираем его.
  useEffect(() => {
    // В нативной Capacitor-сборке (launchAutoHide: false, см.
    // capacitor.config.ts) нативный сплэш держится поверх WebView, пока мы
    // явно его не скроем — ровно к этому моменту наш HTML-прелоадер уже
    // отрисован под ним, и скрытие сплэша просто открывает его. В обычном
    // вебе SplashScreen — no-op заглушка.
    SplashScreen.hide().catch(() => {});

    const preloader = document.getElementById("app-preloader");
    if (!preloader) return;

    preloader.classList.add("app-preloader--hidden");
    const timeout = setTimeout(
      () => preloader.remove(),
      PRELOADER_FADE_MS,
    );

    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster containerStyle={{ top: 12 }} position="top-center" />
    </QueryClientProvider>
  );
}
