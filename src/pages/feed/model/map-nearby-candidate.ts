import type { FeedCandidate } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";

import type { NearbyProfile } from "./nearby";

// Пока у пользователя нет ни одного загруженного фото.
const FALLBACK_PHOTO = person1;

/** GET /api/feed → карточка в сетке «Люди рядом» (тот же пул, что и в фиде). */
export function mapFeedCandidateToNearbyProfile(
  candidate: FeedCandidate,
): NearbyProfile {
  return {
    age: candidate.age,
    id: candidate.id,
    interests: candidate.interests,
    name: candidate.name,
    photo: candidate.photos[0]
      ? resolveUploadUrl(candidate.photos[0])
      : FALLBACK_PHOTO,
  };
}
