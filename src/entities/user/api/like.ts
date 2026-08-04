import { useMutation } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type LikeResult, LikeResultSchema } from "../model/types";

export function useLikeMutation() {
  return useMutation({
    mutationFn: async (userId: number) =>
      LikeResultSchema.parse(
        await api.post<LikeResult>(`/api/swipes/like/${userId}`),
      ),
  });
}
