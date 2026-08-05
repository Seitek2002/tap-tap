import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type Options, OptionsSchema } from "../model/types";

/**
 * Справочники для боттомшитов. `fallback` — те же значения, что раньше были
 * захардкожены во фронте: используются как initialData, чтобы страница не
 * дёргалась пустым состоянием, пока грузится реальный ответ с сервера.
 */
export function useOptionsQuery(fallback: Options, enabled = true) {
  const query = useQuery({
    enabled,
    initialData: fallback,
    queryFn: async () =>
      OptionsSchema.parse(await api.get<Options>("/api/options")),
    queryKey: ["options"],
    staleTime: 10 * 60_000,
  });

  // Все страницы делят один и тот же queryKey ["options"], но передают
  // РАЗНЫЕ частичные fallback (каждой странице свои поля). Чей вызов
  // смонтировался первым, тот и задаёт initialData в кэше — остальные
  // страницы, смонтированные позже (до того как реальный ответ пришёл),
  // получат чужой fallback без нужных им полей. Подмешиваем свой fallback
  // под уже закэшированные данные, чтобы не упасть на data.someField.map.
  return { ...query, data: { ...fallback, ...query.data } };
}
