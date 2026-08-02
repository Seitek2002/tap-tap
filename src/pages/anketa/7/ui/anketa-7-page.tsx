import { ChevronLeft, Mic } from "lucide-react";
import { useNavigate } from "react-router";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";
import { Pill } from "@/shared/ui/pill";

const QUESTIONS = [
  "💪 Ты занимаешься спортом?",
  "🍀 Какие у тебя хобби?",
  "🐆 Каких животных ты любишь?",
  "🧿 Какая у тебя религия?",
];

export const Anketa7Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();

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

        <h1 className="mt-5 text-2xl font-bold">Напиши немного о себе</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Что хочешь, чтобы другие знали заранее?
        </p>

        {/* Текст о себе */}
        <textarea
          rows={4}
          placeholder="Начинай писать, смелее"
          className="mt-6 w-full resize-none rounded-2xl border border-border-soft bg-white px-4 py-3.5 text-sm text-[#1C1E24] outline-none placeholder:text-[#6B7280]"
        />

        {/* Голосовое */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F2F1F3]">
              <Mic className="size-4 text-[#6B7280]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E24]">
                Расскажи о себе в голосовом
              </h3>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Ответь на несколько вопросов, это поможет другим лучше узнать
                тебя
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUESTIONS.map((question) => (
              <Pill key={question} className="text-xs">
                {question}
              </Pill>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95"
            >
              <Mic className="size-6" />
            </button>
          </div>
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
