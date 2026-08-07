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
  children: [
    "Хочу когда-нибудь",
    "Пока не знаю",
    "Дети есть и хочу еще",
    "Дети есть, больше не хочу",
  ],
  love_language: [
    "Жесты внимания",
    "Комплименты",
    "Забота",
    "Подарки",
    "Совместное время",
    "Прикосновения",
    "Интеллектуальная любовь",
    "Эмоции",
  ],
  pets: [
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
  ],
  religion: [
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
  ],
};

export const Anketa10Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const { data: options } = useOptionsQuery(OPTIONS_FALLBACK);
  const setField = useAnketaDraftStore((state) => state.setField);
  const [children, setChildren] = useState("");
  const [loveLanguage, setLoveLanguage] = useState("Совместное время");
  const [animals, setAnimals] = useState("У меня аллергия");
  const [religion, setReligion] = useState("Буддизм");

  const meQuery = useMeQuery(!isMockMode());
  const { getType, isVisible } = useFieldVisibility(meQuery.data?.gender);
  const showChildren = isVisible("children");
  const showLoveLanguage = isVisible("love_language");
  const showPets = isVisible("pets");
  const showReligion = isVisible("religion");
  useSkipEmptyAnketaStep(
    isMockMode() || Boolean(meQuery.data),
    !showChildren && !showLoveLanguage && !showPets && !showReligion,
    goNext,
  );

  const commitAndNext = () => {
    if (showChildren) setField("children", children);
    if (showLoveLanguage) setField("love_language", loveLanguage);
    if (showPets) setField("pets", animals);
    if (showReligion) setField("religion", religion);
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

        <h1 className="mt-5 text-2xl font-bold">Еще больше о тебе</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Раскрой себя с лучшей стороны
        </p>

        <div className="mt-6 space-y-6">
          {showChildren && (
            <ConfigurableField
              title="Как относишься к детям?"
              type={getType("children")}
              options={options.children}
              value={children}
              onChange={setChildren}
            />
          )}
          {showChildren && (showLoveLanguage || showPets || showReligion) && (
            <div className="border-t border-[#E4E7EC]" />
          )}
          {showLoveLanguage && (
            <ConfigurableField
              title="Какой у тебя язык любви?"
              type={getType("love_language")}
              options={options.love_language}
              value={loveLanguage}
              onChange={setLoveLanguage}
            />
          )}
          {showLoveLanguage && (showPets || showReligion) && (
            <div className="border-t border-[#E4E7EC]" />
          )}
          {showPets && (
            <ConfigurableField
              title="Каких животных ты любишь?"
              type={getType("pets")}
              options={options.pets}
              value={animals}
              onChange={setAnimals}
            />
          )}
          {showPets && showReligion && (
            <div className="border-t border-[#E4E7EC]" />
          )}
          {showReligion && (
            <ConfigurableField
              title="Твоя религия"
              type={getType("religion")}
              options={options.religion}
              value={religion}
              onChange={setReligion}
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
