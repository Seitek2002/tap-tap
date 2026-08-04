import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import type { FilterPreferences } from "../model/types";

export function useUpdateFiltersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: FilterPreferences) =>
      api.put<{ ok: true }>("/api/filters", prefs),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["filters"] });
      // Сохранённые фильтры сразу меняют то, что отдаёт GET /api/feed.
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
