import type { User } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";

import type { ProfileOptionFieldKey } from "./profile";

// Пока у пользователя нет ни одного загруженного фото.
const FALLBACK_PHOTO = person1;

// pets/loveLanguage допускают до 2 значений — на бэке это одна строка,
// склеенная через ", "; остальные опции всегда одно значение.
function splitMulti(value: string): string[] {
  return value ? value.split(", ").filter(Boolean) : [];
}

export function joinMulti(values: string[]): string {
  return values.join(", ");
}

export type OwnProfileView = {
  age: number;
  bio: string;
  // Клиентская эвристика — на бэке такого поля нет, считаем локально по тем
  // же полям, что редактируются на этой странице.
  completion: number;
  height: number;
  heightHidden: boolean;
  interests: string[];
  jobCompany: string;
  jobTitle: string;
  location: string;
  name: string;
  optionValues: Record<ProfileOptionFieldKey, string[]>;
  photo: string;
  // Все фото (уже резолвнутые URL) — для управления в модалке "Добавь
  // больше фото", не только первое (см. `photo` выше, только для шапки).
  photos: string[];
  study: string;
};

const COMPLETION_FIELD_COUNT = 14;

export function mapUserToOwnProfile(user: User): OwnProfileView {
  const filledCount =
    [
      user.bio,
      user.height,
      user.workplace,
      user.education_place,
      user.goals,
      user.marital_status,
      user.religion,
      user.love_language,
      user.pets,
      user.children,
      user.alcohol,
      user.sport,
    ].filter(Boolean).length +
    (user.interests.length > 0 ? 1 : 0) +
    (user.photos.length > 0 ? 1 : 0);

  return {
    age: user.age,
    bio: user.bio,
    completion: Math.round((filledCount / COMPLETION_FIELD_COUNT) * 100),
    height: user.height ? Number(user.height) : 170,
    heightHidden: user.height === "",
    interests: user.interests,
    jobCompany: user.company,
    jobTitle: user.workplace,
    location: [user.city, user.citizenship].filter(Boolean).join(", "),
    name: user.name,
    optionValues: {
      alcohol: user.alcohol ? [user.alcohol] : [],
      children: user.children ? [user.children] : [],
      loveLanguage: splitMulti(user.love_language),
      pets: splitMulti(user.pets),
      religion: user.religion ? [user.religion] : [],
      sport: user.sport ? [user.sport] : [],
    },
    photo: user.photos[0] ? resolveUploadUrl(user.photos[0]) : FALLBACK_PHOTO,
    photos: user.photos.map(resolveUploadUrl),
    study: user.education_place,
  };
}
