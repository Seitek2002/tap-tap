import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { ROUTES } from "@/shared/config";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export const NumberVerificationPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  // Автофокус на первую ячейку при заходе на страницу.
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Когда все 4 цифры введены — переходим к анкете.
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      navigate(ROUTES.anketa1);
    }
  }, [otp, navigate]);

  // Обратный отсчёт до повторной отправки кода.
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1); // последняя введённая цифра
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    // авто-переход к следующей ячейке
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // backspace на пустой ячейке — возврат к предыдущей
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#7C3AED] text-white">
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-3xl font-bold text-white">
          👋 Добро пожаловать в <span className="text-[#F4B740]">TapTap</span>{" "}
          знакомства
        </h1>

        {/* Ввод OTP-кода */}
        <div className="mt-10">
          <span className="text-xs font-medium text-white/60 uppercase">
            Введи код отр. отправленный на номер
          </span>

          <div className="mt-3 flex gap-0.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={`h-17.5 w-21 bg-[#C4A7ED] flex-1 rounded-2xl text-center text-3xl font-bold text-white outline-none ${
                  digit ? "border-2 border-white/70" : ""
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-white/60">
            {seconds > 0 ? (
              `Отправить заново через ${seconds} с`
            ) : (
              <button
                type="button"
                onClick={() => setSeconds(RESEND_SECONDS)}
                className="font-semibold text-white underline"
              >
                Отправить заново
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
};
