import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";
import { Slider } from "@/shared/ui/slider";

export const Anketa3Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [height, setHeight] = useState(170);
  const [skip, setSkip] = useState(false);

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

        <h1 className="mt-5 text-2xl font-bold">Какой у тебя рост?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Больше информации для твоих собеседников
        </p>

        {/* Рост */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold">Какого ты роста?</h2>
          <div className="flex items-center gap-4 rounded-full border border-border-soft px-5 py-3">
            <span className="shrink-0 text-sm text-foreground">
              {height} см
            </span>
            <Slider
              className="flex-1"
              disabled={skip}
              min={100}
              max={240}
              value={height}
              onChange={setHeight}
            />
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-[#6B7280]">
            <input
              type="checkbox"
              checked={skip}
              onChange={(event) => setSkip(event.target.checked)}
              className="size-5 rounded accent-primary"
            />
            <span>Предпочту не отвечать</span>
          </label>
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
