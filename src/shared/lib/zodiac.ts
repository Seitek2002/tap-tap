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
