import type { LikeUser } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

import type { LikeProfile } from "./likes";

// Пока у пользователя нет ни одного загруженного фото — тот же плейсхолдер,
// что и в остальных списках моков.
const FALLBACK_PHOTO = personZalkar;

export function mapLikeUserToProfile(user: LikeUser): LikeProfile {
  return {
    age: user.age,
    id: user.id,
    name: user.name,
    photo: user.photos[0] ? resolveUploadUrl(user.photos[0]) : FALLBACK_PHOTO,
  };
}
