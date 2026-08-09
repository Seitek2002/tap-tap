import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type BoostResult, BoostResultSchema } from "../model/types";

export function useBoostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      BoostResultSchema.parse(await api.post<BoostResult>("/api/boost")),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["boost"] });
    },
  });
}
