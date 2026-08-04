import { api } from "@/shared/api";

import { useSessionStore } from "../model/store";

// Бэк best-effort инвалидирует токен (bump token_version) — но локальную
// сессию сбрасываем в любом случае, даже если запрос не прошёл (нет сети и
// т.п.), чтобы пользователь не застревал залогиненным на своём устройстве.
export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    useSessionStore.getState().clear();
  }
}
