import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import {
  type FilterPreferences,
  FilterPreferencesSchema,
} from "../model/types";

// DELETE /api/filters — «Очистить»: сбрасывает сохранённые фильтры и
// возвращает анкетные дефолты (см. buildDefaultsFromProfile в
// bakai-server/src/routes/filters.js), а не один фиксированный набор для
// всех — поэтому возвращает тело ответа, а не просто { ok: true }.
export function useResetFiltersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      FilterPreferencesSchema.parse(
        await api.delete<Partial<FilterPreferences>>("/api/filters"),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["filters"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
