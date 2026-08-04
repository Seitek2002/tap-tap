import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type Me, MeSchema } from "../model/types";

export function useMeQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => MeSchema.parse(await api.get<Me>("/api/auth/me")),
    queryKey: ["me"],
  });
}
