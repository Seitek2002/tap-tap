import { z } from "zod";

// GET /api/profile — полный профиль текущего пользователя.
export const UserSchema = z.object({
  age: z.number(),
  age_range_max: z.number(),
  age_range_min: z.number(),
  alcohol: z.string(),
  balance: z.number(),
  banned: z.number(),
  bio: z.string(),
  // Колонка в БД объявлена INTEGER (дефолт 0), но анкета пишет туда
  // текстовую категорию ("Хочу когда-нибудь" и т.п.) — SQLite это спокойно
  // хранит благодаря динамической типизации. Коэрсим к строке, чтобы не
  // падать на ещё не заполненных профилях (там реально придёт число 0).
  children: z.coerce.string(),
  citizenship: z.string(),
  city: z.string(),
  company: z.string(),
  created_at: z.string(),
  credit_ok: z.number(),
  education: z.string(),
  education_place: z.string(),
  gender: z.string(),
  goals: z.string(),
  has_car: z.number(),
  has_realty: z.number(),
  height: z.string(),
  id: z.number(),
  interests: z.array(z.string()),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  love_language: z.string(),
  marital_status: z.string(),
  name: z.string(),
  online: z.number(),
  pets: z.string(),
  phone: z.string(),
  photos: z.array(z.string()),
  premium_until: z.number().nullable(),
  religion: z.string(),
  show_gender_preference: z.string(),
  smoking: z.string(),
  sport: z.string(),
  workplace: z.string(),
  zodiac: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Поля, которые реально можно менять через PUT /api/profile
// (см. UPDATABLE_FIELDS в bakai-server/src/routes/profile.js).
export type ProfileUpdate = Partial<
  Pick<
    User,
    | "age_range_max"
    | "age_range_min"
    | "age"
    | "alcohol"
    | "bio"
    | "children"
    | "citizenship"
    | "city"
    | "company"
    | "education_place"
    | "education"
    | "gender"
    | "goals"
    | "has_car"
    | "has_realty"
    | "height"
    | "interests"
    | "latitude"
    | "longitude"
    | "love_language"
    | "marital_status"
    | "name"
    | "pets"
    | "religion"
    | "show_gender_preference"
    | "smoking"
    | "sport"
    | "workplace"
    | "zodiac"
  >
>;

// GET /api/auth/me — короткая сводка для проверки сессии.
export const MeSchema = z.object({
  age: z.number(),
  banned: z.number(),
  gender: z.string(),
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  photos: z.array(z.string()),
  premium: z.boolean(),
});

export type Me = z.infer<typeof MeSchema>;

// GET /api/profile/:id — публичный профиль другого пользователя.
export const PublicProfileSchema = z.object({
  age: z.number(),
  bio: z.string(),
  city: z.string(),
  gender: z.string(),
  height: z.string(),
  id: z.number(),
  interests: z.array(z.string()),
  name: z.string(),
  online: z.number(),
  photos: z.array(z.string()),
  workplace: z.string(),
});

export type PublicProfile = z.infer<typeof PublicProfileSchema>;
