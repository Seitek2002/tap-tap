import { QueryClient } from "@tanstack/react-query";

/**
 * Единый QueryClient приложения.
 * Дефолты подобраны под мобильный клиент в Capacitor WebView:
 * данные считаются свежими 1 минуту, ретраи ограничены (плохая мобильная сеть
 * не должна крутить бесконечные повторы).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 60_000,
    },
  },
});
