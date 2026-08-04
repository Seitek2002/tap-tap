import { useMutation } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type UndoResult, UndoResultSchema } from "../model/types";

export function useUndoMutation() {
  return useMutation({
    mutationFn: async () =>
      UndoResultSchema.parse(await api.delete<UndoResult>("/api/swipes/undo")),
  });
}
