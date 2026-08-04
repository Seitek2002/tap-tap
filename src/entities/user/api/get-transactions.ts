import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type Transaction, TransactionSchema } from "../model/types";

const TransactionListSchema = z.array(TransactionSchema);

export function useTransactionsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      TransactionListSchema.parse(
        await api.get<Transaction[]>("/api/wallet/transactions"),
      ),
    queryKey: ["wallet", "transactions"],
  });
}
