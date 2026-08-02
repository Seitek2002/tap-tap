import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Progress } from "@/shared/ui/progress";
import { Pill } from "@/shared/ui/pill";

const INTERESTS = [
  "🎳 Боулинг",
  "🧘 Йога",
  "⛰️ Горы",
  "🍷 Вино",
  "🌱 Вегетерианство",
  "🎾 Теннис",
  "💃 Танцы",
  "🐱 Кошки",
  "🐶 Собаки",
  "🎪 Фестивали",
  "🎤 Пение",
  "🎬 Кино",
  "🎵 Музыка",
  "🧁 Выпечка",
  "🧩 Паззлы",
  "✈️ Путешествия",
  "🎮 Игры",
  "👗 Мода",
  "⚽ Спорт",
  "🎧 RnB",
  "💻 Технологии",
  "🎲 Настолки",
  "🌲 Природа",
  "🎉 Вечеринки",
  "🏳️‍🌈 ЛГБТК+",
  "👻 Ужасы",
  "🎫 Концерты",
  "🎙️ Подкасты",
  "📚 Книги",
  "🕹️ Онлайн-игры",
  "🍺 Бары",
  "🍳 Готовка",
  "🏍️ Мотоциклы",
];

export const Anketa8Page = () => {
  const navigate = useNavigate();
  const { goNext, progress } = useAnketaFlow();
  const [selected, setSelected] = useState<string[]>([
    "🌱 Вегетерианство",
    "🧩 Паззлы",
    "🌲 Природа",
    "🎉 Вечеринки",
  ]);

  const toggle = (value: string) =>
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

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

        <h1 className="mt-5 text-2xl font-bold">Чем интересуешься?</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Совместные хобби сближают</p>

        {/* Интересы — мультивыбор контурными пилюлями */}
        <div className="mt-6 flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <Pill
              key={item}
              variant="outline"
              selected={selected.includes(item)}
              onClick={() => toggle(item)}
            >
              {item}
            </Pill>
          ))}
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
