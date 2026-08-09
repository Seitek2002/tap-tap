import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import {
  ConfigurableField,
  useFieldVisibility,
  useOptionsQuery,
} from "@/entities/option";
import { useAnketaDraftStore, useMeQuery } from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import {
  useAnketaFlow,
  useSkipEmptyAnketaStep,
} from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";

// Дефолты — на случай, пока реальный ответ /api/options ещё не пришёл (тот
// же список, редактируемый из /admin/options — эмодзи прямо в строке
// значения, тем же паттерном, что и интересы).
const OPTIONS_FALLBACK = {
  goals: ["💬 Просто общаться", "💕 Серьёзные отношения", "💜 Построить семью"],
};

export const Anketa4Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const { data: options } = useOptionsQuery(OPTIONS_FALLBACK);
  const setField = useAnketaDraftStore((state) => state.setField);
  const [goal, setGoal] = useState("");

  const meQuery = useMeQuery(!isMockMode());
  const { getType, isVisible } = useFieldVisibility(meQuery.data?.gender);
  const showGoals = isVisible("goals");
  useSkipEmptyAnketaStep(
    isMockMode() || Boolean(meQuery.data),
    !showGoals,
    goNext,
  );

  const commitAndNext = () => {
    if (showGoals) setField("goals", goal);
    goNext();
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхняя прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={commitAndNext}
            className="text-sm text-[#1C1E24]"
          >
            Пропустить
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-3" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Что тут ищешь?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Людям будет проще понять твои намерения
        </p>

        {/* Цель */}
        {showGoals && (
          <div className="mt-6">
            <ConfigurableField
              title="Цель"
              type={getType("goals")}
              options={options.goals}
              value={goal}
              onChange={setGoal}
            />
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={commitAndNext}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
        >
          Далее
        </button>
      </div>
    </div>
  );
};
