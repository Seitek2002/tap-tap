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
  // Конкретная модель машины (боттомшит "Указать машину" в настройках) — не
  // путать с has_car, тот участвует в подборе кандидатов через фильтры
  // партнёра, а не в отображении своей машины.
  car_model: z.string(),
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
  hide_last_seen: z.number(),
  hide_online_status: z.number(),
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
  // Показывать ли car_model другим (боттомшит "Указать машину") — не влияет
  // на has_car, который остаётся источником истины для фильтров партнёра.
  show_car: z.number(),
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
    | "car_model"
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
    | "hide_last_seen"
    | "hide_online_status"
    | "interests"
    | "latitude"
    | "longitude"
    | "love_language"
    | "name"
    | "pets"
    | "religion"
    | "show_car"
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
  car_model: z.string(),
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
  show_car: z.number(),
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
  attachment_url: z.string().nullable().optional(),
  chat_id: z.number(),
  created_at: z.string(),
  file_name: z.string().nullable().optional(),
  id: z.number(),
  kind: z.enum(["text", "image", "file"]).optional().default("text"),
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

// chat_removed — партнёр разорвал пару/заблокировал (или отменил свайп), пока
// этот чат был открыт: чата на бэке больше нет, дальнейшие sendMessage в него
// молча проваливались бы в никуда.
export const ChatRemovedEventSchema = z.object({
  chatId: z.number(),
});

export type ChatRemovedEvent = z.infer<typeof ChatRemovedEventSchema>;

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

// DELETE /api/swipes/unmatch/:userId
export const UnmatchResultSchema = z.object({
  hadChat: z.boolean().optional(),
  ok: z.boolean(),
});

export type UnmatchResult = z.infer<typeof UnmatchResultSchema>;

// POST /api/blocks/:userId
export const BlockResultSchema = z.object({ ok: z.boolean() });

export type BlockResult = z.infer<typeof BlockResultSchema>;

// POST /api/reports  { reportedId, reason }
export const ReportResultSchema = z.object({
  alreadyReported: z.boolean().optional(),
  ok: z.boolean(),
  reportCount: z.number().optional(),
});

export type ReportResult = z.infer<typeof ReportResultSchema>;

// GET/PUT /api/filters — настройки поиска партнёра (страница "Фильтры").
// Хранится на бэке одним JSON-блобом, поэтому пустой ответ ({}) — это
// нормальный случай для того, кто ещё ни разу не сохранял фильтры. Дефолты
// для полей из "Больше фильтров" — пустая строка/массив (= критерий не
// участвует в отборе, см. matchesPreferences в bakai-server/routes/feed.js).
// Раньше тут были конкретные значения "для примера" (например zodiac:
// "Рак"), из-за чего у любого, кто ни разу не открывал фильтры, GET
// /api/filters незаметно возвращал жёсткий набор ограничений — лента могла
// оказаться пустой без каких-либо действий самого пользователя.
export const FilterPreferencesSchema = z.object({
  ageMax: z.number().default(28),
  ageMin: z.number().default(18),
  alcohol: z.string().default(""),
  audience: z.string().default("men"),
  children: z.string().default(""),
  education: z.string().default(""),
  hasBio: z.boolean().default(false),
  // hasCar/hasCredit/hasJob — premium-критерии из "Больше фильтров", не
  // должны молча резать ленту до первого явного включения (см. комментарий
  // у TOGGLES в filters-page.tsx).
  hasCar: z.boolean().default(false),
  hasCredit: z.boolean().default(false),
  hasJob: z.boolean().default(false),
  hasPhoto: z.boolean().default(true),
  interests: z.array(z.string()).default([]),
  loveLanguage: z.array(z.string()).default([]),
  maxDistance: z.number().default(80),
  // 140 — нижняя граница слайдера роста на странице фильтров, то есть
  // фактическое "без ограничения" (см. комментарий у filters-page.tsx).
  minHeight: z.number().default(140),
  pets: z.array(z.string()).default([]),
  religion: z.string().default(""),
  seeking: z.string().default(""),
  smoking: z.string().default(""),
  sport: z.string().default(""),
  zodiac: z.string().default(""),
});

export type FilterPreferences = z.infer<typeof FilterPreferencesSchema>;

// GET /api/blocks — единый список для "Скрыться от знакомых": id > 0 —
// уже зарегистрированный пользователь, id < 0 — номер, который заблокировали
// заранее и ещё не зарегистрирован (см. POST /api/blocks/by-phone).
export const BlockedContactSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
});

export type BlockedContact = z.infer<typeof BlockedContactSchema>;

// GET/PUT /api/notifications/preferences — тот же паттерн, что filters и
// blocked-контакты: JSON-блоб целиком на совести фронта. Реальной доставки
// пушей/писем пока нет (нужны отдельно service worker/VAPID и почтовый
// провайдер) — здесь только хранение настроек на будущее.
export const NotificationPreferencesSchema = z.object({
  email: z.string().default(""),
  emailNewMatches: z.boolean().default(false),
  emailNewMessages: z.boolean().default(false),
  emailNewsletters: z.boolean().default(false),
  emailPromos: z.boolean().default(false),
  messages: z.boolean().default(true),
  newMatches: z.boolean().default(true),
  promos: z.boolean().default(true),
  superLikes: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>;
