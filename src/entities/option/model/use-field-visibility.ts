import { isMockMode } from "@/shared/lib/mock-mode";

import { useFieldSettingsQuery } from "../api/get-field-settings";
import type { FieldType } from "./types";

/**
 * Видимость и виджет вопроса анкеты/профиля, управляемые из /admin/options
 * (см. GET /api/field-settings). `gender` — пол ТЕКУЩЕГО пользователя (тот,
 * кому мы решаем, показывать вопрос или нет), а не пол собеседника.
 * Принимается параметром, а не берётся отсюда через useMeQuery — entities/
 * option не должен тянуть entities/user, вызывающая страница уже знает свой
 * гендер (обычно из той же анкеты/профиля).
 *
 * Мок-режим: реального бэка нет, поэтому все вопросы всегда видимы как
 * pill — тот же принцип, что и у остальных isMockMode()-гейтов в проекте.
 */
export function useFieldVisibility(gender: string | undefined) {
  const settingsQuery = useFieldSettingsQuery(!isMockMode());
  const settings = settingsQuery.data;

  const isVisible = (fieldKey: string): boolean => {
    if (isMockMode()) return true;
    const config = settings[fieldKey];
    // Поле, для которого админ ещё не сохранял настройки — включено всем
    // (тот же принцип, что у options: отсутствие настройки не должно молча
    // скрывать вопрос, который никто явно не выключал).
    if (!config) return true;
    if (!config.enabled) return false;
    return config.gender === "all" || config.gender === gender;
  };

  const getType = (fieldKey: string): FieldType =>
    settings[fieldKey]?.type ?? "pill";

  return { getType, isVisible };
}
