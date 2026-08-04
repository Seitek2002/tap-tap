import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type BuyPremiumResult, BuyPremiumResultSchema } from "../model/types";

export function useBuyPremiumMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (days: number) =>
      BuyPremiumResultSchema.parse(
        await api.post<BuyPremiumResult>("/api/wallet/buy-premium", { days }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
