import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaDraftStore } from "@/entities/user";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Input } from "@/shared/ui/input";
import { Pill } from "@/shared/ui/pill";
import { Progress } from "@/shared/ui/progress";

const DEGREES = [
  "Бакалавриат",
  "Средне-специальное",
  "Техникум",
  "Доктора наук",
  "Аспирантура",
  "Магистратура",
  "9 классов",
  "11 классов",
];

export const Anketa6Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [degree, setDegree] = useState("Магистратура");
  const [educationPlace, setEducationPlace] = useState("");

  const commitAndNext = () => {
    setField("education", degree);
    setField("education_place", educationPlace);
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

        <h1 className="mt-5 text-2xl font-bold">Расскажи об образовании</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Людям будет проще понять твои намерения
        </p>

        {/* Степень — одиночный выбор пилюлями */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold">Степень</h2>
          <div className="flex flex-wrap gap-2">
            {DEGREES.map((item) => (
              <Pill
                key={item}
                selected={degree === item}
                onClick={() => setDegree(item)}
              >
                {item}
              </Pill>
            ))}
          </div>
        </div>

        {/* Учебное заведение */}
        <div className="mt-8">
          <Input
            label="Где учишься(-лся)?"
            placeholder="Учебное заведение"
            value={educationPlace}
            onChange={(event) => setEducationPlace(event.target.value)}
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
