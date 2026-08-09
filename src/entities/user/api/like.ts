import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type LikeResult, LikeResultSchema } from "../model/types";

export function useLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // photoIndex — какое фото смотрели в карточке в момент лайка (см.
    // photoIndex в swipe-card.tsx); по умолчанию 0 там, где листания фото
    // нет (likes-page, nearby-page).
    mutationFn: async ({
      photoIndex = 0,
      userId,
    }: {
      photoIndex?: number;
      userId: number;
    }) =>
      LikeResultSchema.parse(
        await api.post<LikeResult>(`/api/swipes/like/${userId}`, {
          photoIndex,
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
