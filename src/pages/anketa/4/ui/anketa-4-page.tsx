import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { cn } from "@/shared/lib/utils";
import { Radio } from "@/shared/ui/input";
import { Pill } from "@/shared/ui/pill";
import { Progress } from "@/shared/ui/progress";

const GOALS = [
  { emoji: "💬", label: "Просто общаться", value: "chat" },
  { emoji: "💕", label: "Серьёзные отношения", value: "serious" },
  { emoji: "💜", label: "Построить семью", value: "family" },
];

const AUDIENCE = [
  { label: "Женщин", value: "women" },
  { label: "Мужчин", value: "men" },
  { label: "Всех", value: "all" },
];

export const Anketa4Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("women");

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

        <h1 className="mt-5 text-2xl font-bold">Что тут ищешь?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Людям будет проще понять твои намерения
        </p>

        {/* Цель — одиночный выбор (инлайн-радио) */}
        <div className="mt-6 space-y-3">
          {GOALS.map((item) => {
            const selected = goal === item.value;
            return (
              <div
                key={item.value}
                onClick={() => setGoal(item.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-full border bg-white px-5 py-3.5 transition-colors",
                  selected ? "border-primary" : "border-border-soft",
                )}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <div className="pointer-events-none">
                  <Radio size="large" checked={selected} readOnly />
                </div>
              </div>
            );
          })}
        </div>

        {/* Аудитория — сегмент-селектор (тоже одиночный выбор) */}
        <div className="mt-8">
          <h2 className="text-center text-sm font-bold">
            Кого тебе показывать?
          </h2>
          <p className="mt-1 text-center text-sm text-[#6B7280]">
            Можно изменить в любой момент
          </p>

          <div className="mt-3 space-y-2">
            {AUDIENCE.map((item) => (
              <Pill
                key={item.value}
                selected={audience === item.value}
                onClick={() => setAudience(item.value)}
                className="w-full py-3"
              >
                {item.label}
              </Pill>
            ))}
          </div>
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
