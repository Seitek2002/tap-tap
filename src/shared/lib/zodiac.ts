import {
  type LucideIcon,
  ZodiacAquarius,
  ZodiacAries,
  ZodiacCancer,
  ZodiacCapricorn,
  ZodiacGemini,
  ZodiacLeo,
  ZodiacLibra,
  ZodiacPisces,
  ZodiacSagittarius,
  ZodiacScorpio,
  ZodiacTaurus,
  ZodiacVirgo,
} from "lucide-react";

// Список для пикера — тот же порядок, что раньше был в ZODIAC_SIGNS
// (с астрологическими символами вместо иконок).
export const ZODIAC_SIGNS = [
  "Овен",
  "Телец",
  "Близнецы",
  "Рак",
  "Лев",
  "Дева",
  "Весы",
  "Скорпион",
  "Стрелец",
  "Козерог",
  "Водолей",
  "Рыбы",
];

// Дата начала каждого знака (кроме Козерога — он охватывает границу года,
// 22 декабря — 19 января, поэтому обрабатывается как значение по умолчанию).
const ZODIAC_STARTS: { day: number; month: number; sign: string }[] = [
  { day: 20, month: 1, sign: "Водолей" },
  { day: 19, month: 2, sign: "Рыбы" },
  { day: 21, month: 3, sign: "Овен" },
  { day: 20, month: 4, sign: "Телец" },
  { day: 21, month: 5, sign: "Близнецы" },
  { day: 21, month: 6, sign: "Рак" },
  { day: 23, month: 7, sign: "Лев" },
  { day: 23, month: 8, sign: "Дева" },
  { day: 23, month: 9, sign: "Весы" },
  { day: 23, month: 10, sign: "Скорпион" },
  { day: 22, month: 11, sign: "Стрелец" },
  { day: 22, month: 12, sign: "Козерог" },
];

/** Знак зодиака по дню/месяцу рождения (month: 1-12). */
export function getZodiacSign(day: number, month: number): string {
  const key = month * 100 + day;
  for (let i = ZODIAC_STARTS.length - 1; i >= 0; i--) {
    const start = ZODIAC_STARTS[i];
    if (key >= start.month * 100 + start.day) return start.sign;
  }
  // До 20 января — Козерог, перешедший через Новый год.
  return "Козерог";
}

export const ZODIAC_ICONS: Record<string, LucideIcon> = {
  Близнецы: ZodiacGemini,
  Весы: ZodiacLibra,
  Водолей: ZodiacAquarius,
  Дева: ZodiacVirgo,
  Козерог: ZodiacCapricorn,
  Лев: ZodiacLeo,
  Овен: ZodiacAries,
  Рак: ZodiacCancer,
  Рыбы: ZodiacPisces,
  Скорпион: ZodiacScorpio,
  Стрелец: ZodiacSagittarius,
  Телец: ZodiacTaurus,
};
