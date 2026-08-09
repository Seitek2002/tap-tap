import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { onboardingSeen } from "@/shared/lib/seen-flags";
import { cn } from "@/shared/lib/utils";

import { ONBOARDING_SLIDES } from "../model/slides";

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  // Показывается только один раз на устройстве — дальше сразу на регистрацию/
  // вход (см. AuthPage, он сам решает, новый это номер или уже существующий).
  if (!isMockMode() && onboardingSeen.get()) {
    return <Navigate to={ROUTES.auth} replace />;
  }

  const isLast = index === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[index];

  const handleNext = () => {
    if (isLast) {
      onboardingSeen.set();
      navigate(ROUTES.auth, { replace: true });
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-black text-white">
      <img
        src={slide.image}
        alt=""
        className="absolute inset-0 size-full object-cover object-top"
      />

      {/* Точки-пагинация — залитые (пройденные + текущий шаг) фиолетовые,
          оставшиеся полупрозрачные белые. */}
      <div className="relative z-10 flex justify-center gap-2 pt-[max(1rem,env(safe-area-inset-top))]">
        {ONBOARDING_SLIDES.map((_, dotIndex) => (
          <span
            key={dotIndex}
            className={cn(
              "h-1 w-6 rounded-full transition-colors",
              dotIndex <= index ? "bg-primary" : "bg-white/25",
            )}
          />
        ))}
      </div>

      <div className="flex-1" />

      {/* Затемнение поверх нижней части иллюстрации — под текстом она и так
          темнеет сама (см. onboarding-*.png), градиент только гарантирует
          читаемость независимо от конкретной картинки. */}
      <div className="relative z-10 bg-gradient-to-t from-black via-black/85 to-transparent px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="leading-tight">
          {slide.heading.map((line, lineIndex) => (
            <span
              key={lineIndex}
              className={cn(
                "block font-extrabold",
                line.size === "hero" ? "text-6xl" : "text-2xl",
                line.emphasis ? "text-primary" : "text-white",
              )}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <div className="mt-4 space-y-3 text-sm text-white/60">
          <p>{slide.paragraphs[0]}</p>
          <div className="h-px w-6 bg-white/15" />
          <p>{slide.paragraphs[1]}</p>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="mt-6 w-full rounded-full bg-primary py-4 text-base font-semibold text-white transition-transform active:scale-[0.98]"
        >
          Далее
        </button>
      </div>
    </div>
  );
};
