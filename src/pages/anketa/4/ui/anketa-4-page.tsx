import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { useAnketaDraftStore } from "@/entities/user";

import goalChat from "@/shared/assets/images/goal-chat.png";
import goalFamily from "@/shared/assets/images/goal-family.png";
import goalSerious from "@/shared/assets/images/goal-serious.png";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { cn } from "@/shared/lib/utils";
import { Radio } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";

const GOALS = [
  { icon: goalChat, label: "Просто общаться", value: "chat" },
  { icon: goalSerious, label: "Серьёзные отношения", value: "serious" },
  { icon: goalFamily, label: "Построить семью", value: "family" },
];

export const Anketa4Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [goal, setGoal] = useState("");

  const commitAndNext = () => {
    setField("goals", goal);
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
                <img src={item.icon} alt="" className="w-7.5 shrink-0" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <div className="pointer-events-none">
                  <Radio size="large" checked={selected} readOnly />
                </div>
              </div>
            );
          })}
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
