import { API_BASE_URL } from "./config";

// Бэк отдаёт загруженные файлы относительным путём (/uploads/...). Без
// префикса это резолвилось бы к origin фронта, а не бэка — картинки/файлы
// не грузились бы вовсе. Уже абсолютные URL (например, pravatar.cc в
// seed.js) пропускаем как есть.
export function resolveUploadUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}
