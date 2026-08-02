import { useNavigate } from "react-router";

import { Flame } from "lucide-react";

import { ROUTES } from "@/shared/config";

export function WelcomePage() {
  const navigate = useNavigate();

  // Обе кнопки ведут в поток авторизации по номеру (auth → OTP → анкеты).
  // Позже регистрация и вход могут разойтись на разные экраны.
  const goRegister = () => void navigate(ROUTES.auth);
  const goLogin = () => void navigate(ROUTES.auth);

  return (
    <div className="flex h-dvh flex-col bg-white px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] dark:bg-[#6B7280]">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-rose-500 text-white">
          <Flame className="size-12" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#6B7280] dark:text-[#6B7280]">
            Tap-Tap
          </h1>
          <p className="max-w-xs text-base text-[#6B7280] dark:text-[#6B7280]">
            Знакомься с людьми рядом. Свайп вправо — если понравился.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={goRegister}
          className="w-full rounded-full bg-rose-500 py-4 text-base font-semibold text-white transition-transform active:scale-[0.98]"
        >
          Создать аккаунт
        </button>
        <button
          type="button"
          onClick={goLogin}
          className="w-full rounded-full border border-[#6B7280] py-4 text-base font-semibold text-[#6B7280] transition-transform active:scale-[0.98] dark:border-[#6B7280] dark:text-[#6B7280]"
        >
          Войти
        </button>
        <p className="mt-2 px-4 text-center text-xs text-[#6B7280]">
          Продолжая, ты принимаешь условия использования и политику
          конфиденциальности.
        </p>
      </div>
    </div>
  );
}
