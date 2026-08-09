import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type BoostStatus, BoostStatusSchema } from "../model/types";

export function useBoostQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      BoostStatusSchema.parse(await api.get<BoostStatus>("/api/boost")),
    queryKey: ["boost"],
  });
}
