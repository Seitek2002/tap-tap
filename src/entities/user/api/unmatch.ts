import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type UnmatchResult, UnmatchResultSchema } from "../model/types";

export function useUnmatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) =>
      UnmatchResultSchema.parse(
        await api.delete<UnmatchResult>(`/api/swipes/unmatch/${userId}`),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chats"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
