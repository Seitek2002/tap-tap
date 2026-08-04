import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type FeedCandidate, FeedCandidateSchema } from "../model/types";

// GET /api/profile/:id — тот же набор полей, что и у кандидата в ленте
// (см. комментарий у FeedCandidateSchema).
export function usePublicProfileQuery(userId: null | number) {
  return useQuery({
    enabled: userId !== null,
    queryFn: async () =>
      FeedCandidateSchema.parse(
        await api.get<FeedCandidate>(`/api/profile/${userId}`),
      ),
    queryKey: ["profile", userId],
  });
}
