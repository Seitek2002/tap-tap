import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type FieldSettings, FieldSettingsSchema } from "../model/types";

const EMPTY_SETTINGS: FieldSettings = {};

/**
 * Настройки вопросов анкеты (вкл/выкл, кому, каким виджетом) — пустой объект
 * как initialData, пока реальный ответ не пришёл: отсутствие записи о
 * поле в FieldSettings трактуется как "включено для всех, пилюли" (см.
 * use-field-visibility.ts), так что пустышка не прячет ничего заранее.
 */
export function useFieldSettingsQuery(enabled = true) {
  return useQuery({
    enabled,
    initialData: EMPTY_SETTINGS,
    // Без этого initialData считался бы "только что загруженным" и вместе
    // с staleTime мог бы вовсе не сходить за реальным ответом (см. тот же
    // фикс в get-options.ts).
    initialDataUpdatedAt: 0,
    queryFn: async () =>
      FieldSettingsSchema.parse(
        await api.get<FieldSettings>("/api/field-settings"),
      ),
    queryKey: ["field-settings"],
    staleTime: 10 * 60_000,
  });
}
