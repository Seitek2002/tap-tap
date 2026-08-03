import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Pill } from "@/shared/ui/pill";
import { Progress } from "@/shared/ui/progress";

const CHILDREN = [
  "Хочу когда-нибудь",
  "Пока не знаю",
  "Дети есть и хочу еще",
  "Дети есть, больше не хочу",
];

const LOVE_LANGUAGE = [
  "Жесты внимания",
  "Комплименты",
  "Забота",
  "Подарки",
  "Совместное время",
  "Прикосновения",
  "Интеллектуальная любовь",
  "Эмоции",
];

const ANIMALS = [
  "Собаки",
  "Кошки",
  "Рыбы",
  "Рептилии",
  "Птицы",
  "Черепахи",
  "Хомяки",
  "Кролики",
  "Всех",
  "У меня аллергия",
  "Другое",
];

const RELIGION = [
  "Ислам",
  "Атеизм",
  "Христианство",
  "Мормонизм",
  "Агностицизм",
  "Спиритуализм",
  "Протестантизм",
  "Иудаизм",
  "Буддизм",
  "Католичество",
  "Другое",
];

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

export const Anketa10Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [children, setChildren] = useState("");
  const [loveLanguage, setLoveLanguage] = useState("Совместное время");
  const [animals, setAnimals] = useState("У меня аллергия");
  const [religion, setReligion] = useState("Буддизм");

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
            onClick={goNext}
            className="text-sm text-[#1C1E24]"
          >
            Пропустить
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-3" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Еще больше о тебе</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Раскрой себя с лучшей стороны
        </p>

        <div className="mt-6 space-y-6">
          <PillGroup
            title="Как относишься к детям?"
            options={CHILDREN}
            value={children}
            onChange={setChildren}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Какой у тебя язык любви?"
            options={LOVE_LANGUAGE}
            value={loveLanguage}
            onChange={setLoveLanguage}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Каких животных ты любишь?"
            options={ANIMALS}
            value={animals}
            onChange={setAnimals}
          />
          <div className="border-t border-[#E4E7EC]" />
          <PillGroup
            title="Твоя религия"
            options={RELIGION}
            value={religion}
            onChange={setReligion}
          />
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
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
