import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type FeedCandidate, FeedCandidateSchema } from "../model/types";

const FeedResponseSchema = z.array(FeedCandidateSchema);

export function useFeedQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      FeedResponseSchema.parse(await api.get<FeedCandidate[]>("/api/feed")),
    // Лента меняется от каждого свайпа других людей — не кэшируем надолго.
    queryKey: ["feed"],
    staleTime: 0,
  });
}
