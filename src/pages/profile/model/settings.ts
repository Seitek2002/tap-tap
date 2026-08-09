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

// Тот же список (и то же значение candidate.goals на бэке, см.
// pages/filters), что и на анкете-4 — редактируется из /admin/options.
export const SEEKING_FALLBACK = [
  "💬 Просто общаться",
  "💕 Серьёзные отношения",
  "💜 Построить семью",
];

export const DEFAULT_SEEKING = SEEKING_FALLBACK[0];

export const DEFAULT_LANGUAGE = "Русский";
export const LANGUAGE_OPTIONS = ["Русский", "Кыргызский", "English"];

export const PREMIUM_SETTINGS_FEATURES = [
  { key: "car", label: "Указать машину" },
  { key: "credit", label: "Указать кредитную историю" },
];

export const CAR_OPTIONS = ["Toyota Prius", "BMW X7", "Lexus LX570"];

export const APP_VERSION = "7.56.0";
