import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { ANKETA_STEPS, ROUTES } from "@/shared/config";

/**
 * Навигация и прогресс по потоку анкеты.
 * - goNext: следующий шаг из ANKETA_STEPS, после последнего — в ленту.
 * - progress: процент заполнения (шаг / всего), 0 если текущий путь не анкета.
 * Добавление новой anketa-страницы в ANKETA_STEPS автоматически учитывается.
 */
export function useAnketaFlow() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const index = (ANKETA_STEPS as readonly string[]).indexOf(pathname);
  const total = ANKETA_STEPS.length;
  const step = index + 1;
  const progress = index === -1 ? 0 : Math.round((step / total) * 100);

  const goNext = () => {
    if (index === -1) return;
    const next = ANKETA_STEPS[index + 1];
    void navigate(next ?? ROUTES.feed);
  };

  return { goNext, progress, step, total };
}

/**
 * Пропускает текущий шаг анкеты (goNext), если все его вопросы скрыты
 * настройками /admin/options для этого пользователя. `ready` — известен ли
 * уже реальный пол пользователя: до этого isEmpty может быть ложно true
 * (гендерный вопрос сравнивается с ещё не загруженным полем), пропускать
 * шаг по этому значению нельзя.
 */
export function useSkipEmptyAnketaStep(
  ready: boolean,
  isEmpty: boolean,
  goNext: () => void,
) {
  useEffect(() => {
    if (ready && isEmpty) goNext();
  }, [ready, isEmpty, goNext]);
}
