import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useOptionsQuery } from "@/entities/option";
import { useAnketaDraftStore } from "@/entities/user";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Pill } from "@/shared/ui/pill";
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

type PillGroupProps = {
  onChange: (value: string) => void;
  options: string[];
  title: string;
  value: string;
};

const PillGroup = ({ onChange, options, title, value }: PillGroupProps) => (
  <div>
    <h2 className="text-sm font-bold">{title}</h2>
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => (
        <Pill
          key={option}
          selected={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </Pill>
      ))}
    </div>
  </div>
);

export const Anketa9Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const { data: options } = useOptionsQuery(OPTIONS_FALLBACK);
  const setField = useAnketaDraftStore((state) => state.setField);
  const [alcohol, setAlcohol] = useState("Пью редко");
  const [smoking, setSmoking] = useState("Активно курю");
  const [sport, setSport] = useState("Иногда");

  const commitAndNext = () => {
    setField("alcohol", alcohol);
    setField("smoking", smoking);
    setField("sport", sport);
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
          <PillGroup
            title="Какое у тебя отношение к алкоголю?"
            options={options.alcohol}
            value={alcohol}
            onChange={setAlcohol}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Какое у тебя отношение к курению?"
            options={options.smoking}
            value={smoking}
            onChange={setSmoking}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Ты занимаешься спортом?"
            options={options.sport}
            value={sport}
            onChange={setSport}
          />
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
