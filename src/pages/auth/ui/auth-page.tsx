import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { CheckCircle2 } from "lucide-react";

import { registerOrLogin, useSessionStore } from "@/entities/session";

import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { cn } from "@/shared/lib/utils";

const PHONE_LENGTH = 9;

// Пока приложение не встроено в хост (МБанк/БакайБанк и т.п.), который уже
// знает пол пользователя и передавал бы его сам при входе — спрашиваем его
// здесь же, на экране ввода номера, как временную замену этому.
const GENDER_OPTIONS = [
  { label: "Мужчина", value: "men" },
  { label: "Женщина", value: "women" },
] as const;

export const AuthPage = () => {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на номер, как только страница смонтирована.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value
      .replace(/\D/g, "") // только цифры
      .replace(/^0+/, ""); // нельзя начинать с 0
    setPhone(digits.slice(0, PHONE_LENGTH)); // максимум 9 цифр после +996
  };

  const canContinue = phone.length >= PHONE_LENGTH && gender !== null;

  const handleContinue = async () => {
    if (phone.length < PHONE_LENGTH || gender === null || isSubmitting) {
      return;
    }

    if (isMockMode()) {
      navigate(ROUTES.numberVerification, { state: { isNewUser: true } });
      return;
    }

    setIsSubmitting(true);
    try {
      const { isNewUser, token, userId } = await registerOrLogin(phone, gender);
      setSession({ token, userId });
      navigate(ROUTES.numberVerification, { state: { isNewUser } });
    } catch {
      toast.error("Не получилось войти. Попробуй ещё раз");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#7C3AED] text-white">
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
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

        {/* Пол — временно спрашиваем здесь же (см. комментарий у GENDER_OPTIONS) */}
        <div className="mt-8">
          <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
            Твой пол
          </span>
          <div className="mt-3 flex gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                className={cn(
                  "flex-1 rounded-full py-2.5 text-sm font-medium transition-colors",
                  gender === option.value
                    ? "bg-white text-[#1C1E24]"
                    : "border border-white/40 text-white",
                )}
              >
                {option.label}
              </button>
            ))}
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
          disabled={!canContinue || isSubmitting}
          onClick={() => void handleContinue()}
          className="mt-4 w-full rounded-full bg-[#1C1C1E] py-3 text-sm font-semibold text-white active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? "Входим..." : "Продолжить"}
        </button>
      </div>
    </div>
  );
};
