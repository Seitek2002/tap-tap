import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { CheckCircle2 } from "lucide-react";

import { ROUTES } from "@/shared/config";

export const AuthPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на номер, как только страница смонтирована.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value
      .replace(/\D/g, "") // только цифры
      .replace(/^0+/, ""); // нельзя начинать с 0
    setPhone(digits.slice(0, 9)); // максимум 9 цифр после +996
  };

  return (
    <div className="flex h-dvh flex-col bg-[#7C3AED] text-white">
      <div className="px-4 pt-4">
        <h1 className="text-3xl font-bold text-white">
          👋 Добро пожаловать в <span className="text-[#F4B740]">TapTap</span>{" "}
          знакомства
        </h1>

        {/* Поле номера телефона */}
        <div className="mt-10">
          <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
            Номер телефона
          </span>
          <div className="mt-3 flex items-center gap-3 border-b border-white/40 pb-2 text-base">
            <span className="font-semibold">+996</span>
            <span className="text-white/30">|</span>
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handleChange}
              placeholder="Номер"
              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
            />
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Карточка согласия */}
      <div className="mx-4 mb-8 rounded-3xl bg-[#FFFFFF3D] p-5">
        <p className="font-medium text-sm">
          Нажимая «Продолжить»
          <br />
          вы соглашаетесь с условиями:
        </p>
        <div className="mt-3 space-y-2 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Политика банка</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Соглашение пользовательского договора</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.numberVerification)}
          className="mt-4 w-full rounded-full bg-[#1C1C1E] py-3 text-sm font-semibold text-white active:scale-[0.99]"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};
