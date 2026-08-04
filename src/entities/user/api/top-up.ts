import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type TopUpResult, TopUpResultSchema } from "../model/types";

export function useTopUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) =>
      TopUpResultSchema.parse(
        await api.post<TopUpResult>("/api/wallet/topup", { amount }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
