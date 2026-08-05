import type { FeedCandidate } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";

import type { ChatProfile } from "./chat-profiles";

// Пока у собеседника нет ни одного загруженного фото.
const FALLBACK_PHOTOS = [person1];

const MARITAL_LABELS: Record<string, string> = {
  complicated: "Всё сложно",
  divorced: "В разводе",
  married: "В браке",
  single: "Не в браке",
  widowed: "Вдовец / вдова",
};

const GOALS_LABELS: Record<string, string> = {
  chat: "Просто общаться",
  family: "Построить семью",
  serious: "Серьёзные отношения",
};

const compact = (items: (false | string | undefined)[]) =>
  items.filter((item): item is string => Boolean(item));

/** GET /api/profile/:id → детальная карточка на странице профиля в чате. */
export function mapFeedCandidateToChatProfile(
  candidate: FeedCandidate,
): ChatProfile {
  return {
    age: candidate.age,
    bio: candidate.bio,
    distanceKm: candidate.distanceKm,
    habits: compact([
      candidate.alcohol && `🍷 ${candidate.alcohol}`,
      candidate.smoking && `🚬 ${candidate.smoking}`,
      candidate.sport && `🏃 ${candidate.sport}`,
    ]),
    important: compact([
      candidate.height && `📏 ${candidate.height} см`,
      candidate.city && `📍 ${candidate.city}`,
      candidate.religion && `🙏 ${candidate.religion}`,
    ]),
    interests: candidate.interests,
    marital: MARITAL_LABELS[candidate.marital_status] ?? "Не указано",
    online: candidate.online === 1,
    photos:
      candidate.photos.length > 0
        ? candidate.photos.map(resolveUploadUrl)
        : FALLBACK_PHOTOS,
    premium: [
      ...(candidate.credit_ok
        ? [{ label: "💳 Хорошая кредитная история", tone: "green" as const }]
        : []),
      ...(candidate.has_car && candidate.show_car
        ? [
            {
              label: candidate.car_model
                ? `🚗 ${candidate.car_model}`
                : "🚗 Есть автомобиль",
              tone: "gold" as const,
            },
          ]
        : []),
    ],
    seeking: GOALS_LABELS[candidate.goals] ?? "Не указано",
    study: compact([candidate.education && `🎓 ${candidate.education}`]),
    work: compact([
      candidate.workplace && `💼 ${candidate.workplace}`,
      candidate.company && `🏢 ${candidate.company}`,
    ]),
    zodiac: candidate.zodiac || "Не указано",
  };
}
