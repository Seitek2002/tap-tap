import { api } from "@/shared/api";

import type { ProfileUpdate } from "../model/types";

/**
 * Финальный шаг анкеты: сохраняет накопленные поля профиля, затем
 * последовательно заливает фото (multipart, тот же эндпоинт, что и
 * редактирование профиля). Последовательно, а не Promise.all — бэк
 * пишет фото по одному в JSON-массив в той же строке, параллельные
 * записи рискуют затирать друг друга.
 */
export async function submitAnketa(
  fields: Partial<ProfileUpdate>,
  photos: File[],
): Promise<void> {
  if (Object.keys(fields).length > 0) {
    await api.put<{ ok: true }>("/api/profile", fields);
  }

  for (const file of photos) {
    const formData = new FormData();
    formData.append("photo", file);
    await api.post<{ photos: string[]; url: string }>(
      "/api/profile/photos",
      formData,
    );
  }
}
