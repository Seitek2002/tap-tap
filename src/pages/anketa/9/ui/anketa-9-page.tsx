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

// Дефолты — на случай, пока реальный ответ /api/options ещё не пришёл.
const OPTIONS_FALLBACK = {
  alcohol: [
    "Я не пью",
    "Категорически против",
    "Пью редко",
    "По особым случаям",
    "Пью за компанию",
    "Иногда",
    "Люблю выпить",
    "По выходным",
  ],
  smoking: [
    "Я не курю",
    "Категорически против",
    "Редко курю",
    "Бросаю",
    "Активно курю",
    "Курю за компанию",
    "Курю, когда выпью",
  ],
  sport: ["Каждый день", "Иногда", "Очень редко"],
};

export const Anketa9Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const { data: options } = useOptionsQuery(OPTIONS_FALLBACK);
  const setField = useAnketaDraftStore((state) => state.setField);
  const [alcohol, setAlcohol] = useState("Пью редко");
  const [smoking, setSmoking] = useState("Активно курю");
  const [sport, setSport] = useState("Иногда");

  const meQuery = useMeQuery(!isMockMode());
  const { getType, isVisible } = useFieldVisibility(meQuery.data?.gender);
  const showAlcohol = isVisible("alcohol");
  const showSmoking = isVisible("smoking");
  const showSport = isVisible("sport");
  useSkipEmptyAnketaStep(
    isMockMode() || Boolean(meQuery.data),
    !showAlcohol && !showSmoking && !showSport,
    goNext,
  );

  const commitAndNext = () => {
    if (showAlcohol) setField("alcohol", alcohol);
    if (showSmoking) setField("smoking", smoking);
    if (showSport) setField("sport", sport);
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

        <h1 className="mt-5 text-2xl font-bold">Какие у тебя привычки?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Мелочи многое расскажут</p>

        <div className="mt-6 space-y-6">
          {showAlcohol && (
            <ConfigurableField
              title="Какое у тебя отношение к алкоголю?"
              type={getType("alcohol")}
              options={options.alcohol}
              value={alcohol}
              onChange={setAlcohol}
            />
          )}
          {showAlcohol && (showSmoking || showSport) && (
            <div className="border-t border-[#E4E7EC]" />
          )}
          {showSmoking && (
            <ConfigurableField
              title="Какое у тебя отношение к курению?"
              type={getType("smoking")}
              options={options.smoking}
              value={smoking}
              onChange={setSmoking}
            />
          )}
          {showSmoking && showSport && (
            <div className="border-t border-[#E4E7EC]" />
          )}
          {showSport && (
            <ConfigurableField
              title="Ты занимаешься спортом?"
              type={getType("sport")}
              options={options.sport}
              value={sport}
              onChange={setSport}
            />
          )}
        </div>
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
