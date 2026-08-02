import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";
import { Pill } from "@/shared/ui/pill";

const ALCOHOL = [
  "Я не пью",
  "Категорически против",
  "Пью редко",
  "По особым случаям",
  "Пью за компанию",
  "Иногда",
  "Люблю выпить",
  "По выходным",
];

const SMOKING = [
  "Я не курю",
  "Категорически против",
  "Редко курю",
  "Бросаю",
  "Активно курю",
  "Курю за компанию",
  "Курю, когда выпью",
];

const SPORT = ["Каждый день", "Иногда", "Очень редко"];

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
  const [alcohol, setAlcohol] = useState("Пью редко");
  const [smoking, setSmoking] = useState("Активно курю");
  const [sport, setSport] = useState("Иногда");

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхняя прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
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
            onClick={goNext}
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
            options={ALCOHOL}
            value={alcohol}
            onChange={setAlcohol}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Какое у тебя отношение к курению?"
            options={SMOKING}
            value={smoking}
            onChange={setSmoking}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Ты занимаешься спортом?"
            options={SPORT}
            value={sport}
            onChange={setSport}
          />
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="px-4 pt-4 pb-8">
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
        >
          Далее
        </button>
      </div>
    </div>
  );
};
