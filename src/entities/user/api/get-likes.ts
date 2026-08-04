import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type LikeUser, LikeUserSchema } from "../model/types";

const LikeUserListSchema = z.array(LikeUserSchema);

// GET /api/likes/me — кого я лайкнул.
export function useLikedByMeQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      LikeUserListSchema.parse(await api.get<LikeUser[]>("/api/likes/me")),
    queryKey: ["likes", "me"],
  });
}

// GET /api/likes/them — кто лайкнул меня.
export function useLikedMeQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      LikeUserListSchema.parse(await api.get<LikeUser[]>("/api/likes/them")),
    queryKey: ["likes", "them"],
  });
}
