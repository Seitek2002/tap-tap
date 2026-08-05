import { useState } from "react";

import { TriangleAlert } from "lucide-react";

import { useAnketaDraftStore, useProfileQuery } from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { getZodiacSign } from "@/shared/lib/zodiac";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";

// Только цифры, точки расставляются сами: 21022002 -> 21.02.2002.
const formatBirthDate = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
};

// Парсит "ДД.ММ.ГГГГ" в возраст + день/месяц для знака зодиака. null — если
// строка не полная или дата нереальная (32.13.2000, будущее и т.п.).
const parseBirthDate = (
  value: string,
): { age: number; day: number; month: number } | null => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const now = new Date();
  const hadBirthdayThisYear =
    now.getMonth() > month - 1 ||
    (now.getMonth() === month - 1 && now.getDate() >= day);
  const age = now.getFullYear() - year - (hadBirthdayThisYear ? 0 : 1);
  if (age < 0 || age > 120) return null;

  return { age, day, month };
};

export const Anketa1Page = () => {
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Семейное положение больше не спрашиваем на этом экране — бек сам
  // разыгрывает один из двух вариантов при регистрации (временная замена
  // данным, которые в будущем придёт от хост-приложения, см. auth.js).
  // Здесь только показываем предупреждение, если бек назначил "в браке".
  const profileQuery = useProfileQuery(!isMockMode());
  const isMarried = profileQuery.data?.marital_status === "married";

  const commitAndNext = () => {
    setField("name", name);

    const parsed = parseBirthDate(birthDate);
    if (parsed) {
      setField("birth_date", birthDate);
      setField("age", parsed.age);
      setField("zodiac", getZodiacSign(parsed.day, parsed.month));
    }

    goNext();
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхняя прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={commitAndNext}
            className="text-sm text-[#1C1E24]"
          >
            Пропустить
          </button>
        </div>

        {/* Прогресс */}
        <Progress className="mt-2" value={progress} />

        <h1 className="mt-5 text-2xl font-bold">Давай знакомиться!</h1>
        <p className="mt-1 text-[#6B7280] text-sm">
          Подтверди свои персональные данные
        </p>

        {/* Поля анкеты */}
        <div className="mt-6 space-y-5">
          <Input
            label="ФИО"
            placeholder="Асанов Асан Асанович"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Дата рождения"
            placeholder="21.02.2002"
            inputMode="numeric"
            maxLength={10}
            value={birthDate}
            onChange={(event) =>
              setBirthDate(formatBirthDate(event.target.value))
            }
          />
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="space-y-3 px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Предупреждение и согласие — только когда статус «В браке» */}
        {isMarried && (
          <>
            <div className="rounded-2xl bg-[#F5A623] p-4 text-white">
              <div className="flex items-center gap-2 font-bold">
                <TriangleAlert className="size-5 shrink-0" />
                <span>Ты состоишь в браке</span>
              </div>
              <p className="mt-1 text-sm text-white/90">
                Твой семейный статус будет отображаться в анкете и будет виден
                другим пользователям
              </p>
            </div>

            <label className="flex items-start gap-2 text-xs text-[#6B7280]">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-0.5 size-4 shrink-0"
              />
              <span>
                Я ознакомился и принимаю, что мой семейный статус будет виден
                другим пользователям
              </span>
            </label>
          </>
        )}

        <button
          type="button"
          disabled={isMarried && !accepted}
          onClick={commitAndNext}
          className="w-full rounded-full bg-primary py-4 font-semibold text-white transition-colors active:scale-[0.99] disabled:bg-[#C9C7D0]"
        >
          Подтвердить
        </button>
      </div>
    </div>
  );
};
