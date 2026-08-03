import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import { Input } from "@/shared/ui/input";

export const AddContactManuallyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
        </header>

        <div className="px-4">
          <h1 className="text-2xl font-bold">
            Укажи имя и номер того, кого хочешь заблокировать в ТапТап
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Мы не будем показывать твой профиль указанному контакту
          </p>
        </div>

        <div className="mt-5 rounded-3xl bg-white p-4">
          <Input
            label="Введи имя"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Имя"
          />

          <div className="mt-5 flex flex-col gap-2 text-sm">
            <span className="font-bold">Укажи номер телефона</span>
            <div className="flex items-center gap-2 rounded-full border border-[#E4E7EC] px-4 py-3.5">
              <span className="shrink-0 font-medium text-[#6B7280]">+996</span>
              <span className="h-4 w-px shrink-0 bg-[#E4E7EC]" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Номер"
                inputMode="numeric"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#6B7280]"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!name.trim() || !phone.trim()}
          onClick={() => navigate(-1)}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white disabled:bg-[#D1D5DB] disabled:text-white/70"
        >
          Готово
        </button>
      </div>

      <BottomNav />
    </div>
  );
};
