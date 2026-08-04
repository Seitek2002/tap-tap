import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaDraftStore } from "@/entities/user";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Checkbox } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { Slider } from "@/shared/ui/slider";

const HEIGHT_MIN = 100;
const HEIGHT_MAX = 240;

export const Anketa3Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [height, setHeight] = useState(170);
  const [skip, setSkip] = useState(false);

  const commitAndNext = () => {
    setField("height", skip ? "" : String(height));
    goNext();
  };

  // Докручивать слайдер до точного значения не всегда удобно — по тапу на
  // цифры даём ввести рост с клавиатуры напрямую.
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const heightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingHeight) heightInputRef.current?.select();
  }, [isEditingHeight]);

  const commitHeight = (rawValue: string) => {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) {
      setHeight(Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, Math.round(parsed))));
    }
    setIsEditingHeight(false);
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

        <h1 className="mt-5 text-2xl font-bold">Какой у тебя рост?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Больше информации для твоих собеседников
        </p>

        {/* Рост */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold">Какого ты роста?</h2>
          <div className="flex items-center gap-4 rounded-full border border-border-soft px-5 py-3">
            {isEditingHeight ? (
              <input
                ref={heightInputRef}
                type="number"
                inputMode="numeric"
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                defaultValue={height}
                disabled={skip}
                onBlur={(event) => commitHeight(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") setIsEditingHeight(false);
                }}
                className="w-14 shrink-0 bg-transparent text-sm text-foreground outline-none"
              />
            ) : (
              <button
                type="button"
                disabled={skip}
                onClick={() => setIsEditingHeight(true)}
                className="shrink-0 text-sm text-foreground disabled:cursor-not-allowed"
              >
                {height} см
              </button>
            )}
            <Slider
              className="flex-1"
              disabled={skip}
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              value={height}
              onChange={setHeight}
            />
          </div>

          <Checkbox
            className="mt-4"
            checked={skip}
            onChange={(event) => setSkip(event.target.checked)}
            label="Предпочту не отвечать"
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
