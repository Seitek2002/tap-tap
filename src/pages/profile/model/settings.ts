export const SETTINGS_ACCOUNT = {
  name: "Албарсты",
  phone: "0997997997",
};

export const DEFAULT_AGE_RANGE: [number, number] = [18, 28];
export const DEFAULT_DISTANCE_KM = 80;

export const DEFAULT_SHOW_TO = "Мужчин";
export const SHOW_TO_OPTIONS = ["Мужчин", "Женщин", "Всех"];

// value — то же значение, что audience в /api/filters (см. pages/filters) —
// оба экрана редактируют одни и те же сохранённые фильтры поиска партнёра.
export const SHOW_TO_TO_AUDIENCE: Record<string, string> = {
  Всех: "all",
  Женщин: "women",
  Мужчин: "men",
};

export const AUDIENCE_TO_SHOW_TO: Record<string, string> = {
  all: "Всех",
  men: "Мужчин",
  women: "Женщин",
};

// code — то же значение, что candidate.goals на бэке (см. pages/filters) —
// нужен, чтобы сохранять/применять "Ты ищешь" через тот же /api/filters.
export const SEEKING_OPTIONS = [
  { code: "chat", emoji: "💬", label: "Просто общаться" },
  { code: "serious", emoji: "💕", label: "Серьезные отношения" },
  { code: "family", emoji: "💜", label: "Построить семью" },
] as const;

export const DEFAULT_SEEKING = SEEKING_OPTIONS[0].label;

export const DEFAULT_LANGUAGE = "Русский";
export const LANGUAGE_OPTIONS = ["Русский", "Кыргызский", "English"];

export const PREMIUM_SETTINGS_FEATURES = [
  { key: "car", label: "Указать машину" },
  { key: "credit", label: "Указать кредитную историю" },
];

export const CAR_OPTIONS = ["Toyota Prius", "BMW X7", "Lexus LX570"];

export const APP_VERSION = "7.56.0";
