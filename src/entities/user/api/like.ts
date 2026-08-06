import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type LikeResult, LikeResultSchema } from "../model/types";

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) =>
      LikeResultSchema.parse(
        await api.post<LikeResult>(`/api/swipes/like/${userId}`),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
