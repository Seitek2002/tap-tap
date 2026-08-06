import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type UndoResult, UndoResultSchema } from "../model/types";

export function useUndoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      UndoResultSchema.parse(await api.delete<UndoResult>("/api/swipes/undo")),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
