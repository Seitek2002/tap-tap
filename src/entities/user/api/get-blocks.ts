import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type BlockedContact, BlockedContactSchema } from "../model/types";

const BlockedContactListSchema = z.array(BlockedContactSchema);

export function useBlockedContactsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      BlockedContactListSchema.parse(
        await api.get<BlockedContact[]>("/api/blocks"),
      ),
    queryKey: ["blocks"],
  });
}
