import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type Wallet, WalletSchema } from "../model/types";

export function useWalletQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      WalletSchema.parse(await api.get<Wallet>("/api/wallet")),
    queryKey: ["wallet"],
  });
}
