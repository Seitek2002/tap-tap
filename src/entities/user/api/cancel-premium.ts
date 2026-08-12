import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import {
  type CancelPremiumResult,
  CancelPremiumResultSchema,
} from "../model/types";

export function useCancelPremiumMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      CancelPremiumResultSchema.parse(
        await api.post<CancelPremiumResult>("/api/wallet/cancel-premium"),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
