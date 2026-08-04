import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import {
  type FilterPreferences,
  FilterPreferencesSchema,
} from "../model/types";

export function useFiltersQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      FilterPreferencesSchema.parse(
        await api.get<Partial<FilterPreferences>>("/api/filters"),
      ),
    queryKey: ["filters"],
  });
}
