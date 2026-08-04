import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type Options, OptionsSchema } from "../model/types";

/**
 * Справочники для боттомшитов. `fallback` — те же значения, что раньше были
 * захардкожены во фронте: используются как initialData, чтобы страница не
 * дёргалась пустым состоянием, пока грузится реальный ответ с сервера.
 */
export function useOptionsQuery(fallback: Options, enabled = true) {
  return useQuery({
    enabled,
    initialData: fallback,
    queryFn: async () =>
      OptionsSchema.parse(await api.get<Options>("/api/options")),
    queryKey: ["options"],
    staleTime: 10 * 60_000,
  });
}
