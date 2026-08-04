import type { FeedCandidate } from "@/entities/user";

import type { LikeProfileDetails } from "./like-profile-details";

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

/** GET /api/profile/:id → детальная карточка на странице лайка. */
export function mapFeedCandidateToLikeDetails(
  candidate: FeedCandidate,
): LikeProfileDetails {
  return {
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
    premium: [
      ...(candidate.credit_ok
        ? [{ label: "💳 Хорошая кредитная история", tone: "green" as const }]
        : []),
      ...(candidate.has_car
        ? [{ label: "🚗 Есть автомобиль", tone: "gold" as const }]
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
