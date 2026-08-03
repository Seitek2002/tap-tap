import { useNavigate } from "react-router";

import { ChevronLeft, Eye, ShieldCheck, Sparkles } from "lucide-react";

import carPremium from "@/shared/assets/images/car-premium.png";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";

export const Anketa11Page = () => {
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

        <h1 className="mt-5 text-2xl font-bold">
          Хочешь указать, что у тебя есть машина?
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Дополнительный плюс в профиле
        </p>

        {/* Авто + бейдж-переключатель */}
        <div className="relative mt-6">
          <img src={carPremium} alt="" className="w-full" />
        </div>

        {/* Преимущества */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Больше внимания</h3>
              <p className="text-sm text-[#6B7280]">
                Ваш профиль станет заметнее среди других
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Надежность</h3>
              <p className="text-sm text-[#6B7280]">
                Подтвержденная информация вызывает больше доверия
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя панель — Premium */}
      <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={goNext}
          className="relative flex w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#F5A623] py-3 text-white transition-transform active:scale-[0.99]"
        >
          <span className="text-center">
            <span className="block font-semibold">Получить Premium</span>
            <span className="block text-xs text-white/90">9 сом в день</span>
          </span>
          <Sparkles className="absolute right-6 size-6" />
        </button>
      </div>
    </div>
  );
};
