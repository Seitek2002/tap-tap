import { useState } from "react";

import { TriangleAlert } from "lucide-react";

import { useAnketaDraftStore } from "@/entities/user";

import { useAnketaFlow } from "@/shared/lib/use-anketa-flow";
import { Dropdown } from "@/shared/ui/dropdown";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";

const MARITAL_OPTIONS = [
  { label: "Не в браке", value: "single" },
  { label: "В браке", value: "married" },
  { label: "В разводе", value: "divorced" },
  { label: "Вдовец / вдова", value: "widowed" },
  { label: "Всё сложно", value: "complicated" },
];

export const Anketa1Page = () => {
  const { goNext, progress } = useAnketaFlow();
  const setField = useAnketaDraftStore((state) => state.setField);
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  // Дата рождения пока свободный текст без парсинга — на бэке нет поля под
  // неё (там number age, не дата), только UI-заготовка под будущий пикер.
  const [birthDate, setBirthDate] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("married");
  const isMarried = maritalStatus === "married";

  const commitAndNext = () => {
    setField("name", name);
    setField("marital_status", maritalStatus);
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
            placeholder="24 февраля, 1991 года"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <Dropdown
            label="Семейное положение"
            placeholder="Выберите..."
            options={MARITAL_OPTIONS}
            value={maritalStatus}
            onChange={setMaritalStatus}
            className="bg-transparent"
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
