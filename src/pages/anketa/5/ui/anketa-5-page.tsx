import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";
import { Input } from "@/shared/ui/input";

export const Anketa5Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();

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

        <h1 className="mt-5 text-2xl font-bold">Кем ты работаешь?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Людям будет проще понять твои намерения
        </p>

        {/* Поля */}
        <div className="mt-6 space-y-5">
          <Input label="Кем работаешь?" placeholder="Профессия" />
          <Input label="Где работаешь?" placeholder="Компания" />
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
