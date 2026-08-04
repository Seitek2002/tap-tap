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
  // Строка "ДД.ММ.ГГГГ", как её вводят на anketa-1 — не дата/timestamp.
  birth_date: z.string(),
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
  interests: z.array(z.coerce.string()),
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
    | "birth_date"
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

// GET /api/feed и GET /api/profile/:id отдают одинаковый набор полей — один
// и тот же публичный профиль, что в ленте свайпов, что при просмотре
// конкретного человека (например, из лайков). distanceKm null, если у одной
// из сторон нет ни координат, ни известного города — считается на бэке,
// точные lat/lng чужих анкет клиенту не отдаются.
export const FeedCandidateSchema = z.object({
  age: z.number(),
  alcohol: z.string(),
  bio: z.string(),
  city: z.string(),
  company: z.string(),
  credit_ok: z.number(),
  distanceKm: z.number().nullable(),
  education: z.string(),
  gender: z.string(),
  goals: z.string(),
  has_car: z.number(),
  has_realty: z.number(),
  height: z.string(),
  id: z.number(),
  interests: z.array(z.coerce.string()),
  marital_status: z.string(),
  name: z.string(),
  online: z.number(),
  photos: z.array(z.string()),
  religion: z.string(),
  smoking: z.string(),
  sport: z.string(),
  workplace: z.string(),
  zodiac: z.string(),
});

export type FeedCandidate = z.infer<typeof FeedCandidateSchema>;

// POST /api/swipes/like/:id — { ok:true, match, chatId } при обычном
// исходе, { ok:false, limitReached:true, limit } при исчерпанном лимите.
export const LikeResultSchema = z.object({
  chatId: z.number().nullable().optional(),
  limit: z.number().optional(),
  limitReached: z.boolean().optional(),
  match: z.boolean().optional(),
  ok: z.boolean(),
});

export type LikeResult = z.infer<typeof LikeResultSchema>;

// DELETE /api/swipes/undo
export const UndoResultSchema = z.object({
  message: z.string().optional(),
  ok: z.boolean(),
  undoneUserId: z.number().optional(),
});

export type UndoResult = z.infer<typeof UndoResultSchema>;

// GET /api/likes/me и /api/likes/them — облегчённая карточка для списков
// (полный профиль подгружается отдельно, через GET /api/profile/:id, только
// когда открывают конкретную анкету).
export const LikeUserSchema = z.object({
  age: z.number(),
  id: z.number(),
  name: z.string(),
  photos: z.array(z.string()),
});

export type LikeUser = z.infer<typeof LikeUserSchema>;

const ChatPartnerSchema = z.object({
  id: z.number(),
  lastSeenAt: z.number().nullable(),
  name: z.string(),
  online: z.number(),
  photo: z.nullable(z.string()),
});

// GET /api/chats — список чатов текущего пользователя.
export const ChatListItemSchema = z.object({
  id: z.number(),
  lastMsg: z.string(),
  lastTime: z.string(),
  partner: ChatPartnerSchema,
  unread: z.number(),
  yourTurn: z.boolean(),
});

export type ChatListItem = z.infer<typeof ChatListItemSchema>;

// GET /api/chats/:id — данные для шапки конкретного чата.
export const ChatDetailSchema = z.object({
  id: z.number(),
  partner: ChatPartnerSchema,
});

export type ChatDetail = z.infer<typeof ChatDetailSchema>;

// GET /api/chats/:id/messages и событие сокета new_message — одна и та же
// форма строки из таблицы messages.
export const ChatMessageSchema = z.object({
  chat_id: z.number(),
  created_at: z.string(),
  id: z.number(),
  read: z.number(),
  sender_id: z.number(),
  text: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Событие сокета user_status — обновление статуса партнёра в реальном времени.
export const UserStatusEventSchema = z.object({
  lastSeenAt: z.number().nullable().optional(),
  online: z.boolean(),
  userId: z.number(),
});

export type UserStatusEvent = z.infer<typeof UserStatusEventSchema>;

// typing / stop_typing
export const TypingEventSchema = z.object({
  chatId: z.number(),
  userId: z.number(),
});

export type TypingEvent = z.infer<typeof TypingEventSchema>;

// GET /api/wallet
export const WalletSchema = z.object({
  balance: z.number(),
  gender: z.string(),
  isPremium: z.boolean(),
  premiumUntil: z.number().nullable(),
});

export type Wallet = z.infer<typeof WalletSchema>;

// GET /api/wallet/transactions
export const TransactionSchema = z.object({
  amount: z.number(),
  created_at: z.string(),
  description: z.string(),
  id: z.number(),
  type: z.enum(["topup", "purchase"]),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// POST /api/wallet/topup
export const TopUpResultSchema = z.object({
  balance: z.number(),
  ok: z.boolean(),
});

export type TopUpResult = z.infer<typeof TopUpResultSchema>;

// POST /api/wallet/buy-premium — {error, needed, balance} при нехватке
// средств (обрабатывается через ApiError по статусу 400, не эту схему).
export const BuyPremiumResultSchema = z.object({
  balance: z.number(),
  isPremium: z.boolean(),
  ok: z.boolean(),
  premiumUntil: z.number(),
});

export type BuyPremiumResult = z.infer<typeof BuyPremiumResultSchema>;
