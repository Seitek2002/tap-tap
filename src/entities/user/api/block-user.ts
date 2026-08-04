import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type BlockResult, BlockResultSchema } from "../model/types";

export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) =>
      BlockResultSchema.parse(
        await api.post<BlockResult>(`/api/blocks/${userId}`),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chats"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
