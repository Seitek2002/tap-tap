export const SETTINGS_ACCOUNT = {
  name: "Албарсты",
  phone: "0997997997",
};

export const DEFAULT_AGE_RANGE: [number, number] = [18, 28];
export const DEFAULT_DISTANCE_KM = 80;

export const DEFAULT_SHOW_TO = "Мужчин";
export const SHOW_TO_OPTIONS = ["Мужчин", "Женщин", "Всех"];

// Тот же список, что в pages/filters (SEEKING_OPTIONS) — независимый мок.
export const SEEKING_OPTIONS = [
  { emoji: "💬", label: "Просто общаться" },
  { emoji: "💕", label: "Серьезные отношения" },
  { emoji: "💜", label: "Построить семью" },
];

export const DEFAULT_SEEKING = SEEKING_OPTIONS[0].label;

export const DEFAULT_LANGUAGE = "Русский";
export const LANGUAGE_OPTIONS = ["Русский", "Кыргызский", "English"];

export const PREMIUM_SETTINGS_FEATURES = [
  { key: "car", label: "Указать машину" },
  { key: "credit", label: "Указать кредитную историю" },
];

export const APP_VERSION = "7.56.0";
