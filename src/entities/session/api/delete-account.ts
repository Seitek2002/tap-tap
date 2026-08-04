import { api } from "@/shared/api";

import { useSessionStore } from "../model/store";

// В отличие от logout(), локальная сессия чистится только при успехе — если
// запрос не прошёл, аккаунт мог не удалиться, и человека нельзя оставлять
// думать, что удаление точно случилось.
export async function deleteAccount(): Promise<void> {
  await api.delete("/api/auth/me");
  useSessionStore.getState().clear();
}
