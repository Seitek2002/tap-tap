import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Check, X } from "lucide-react";

import { useBuyPremiumMutation } from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import { Spinner } from "@/shared/ui/spinner";

import {
  FREE_PREMIUM_DAYS,
  PREMIUM_FEATURES,
  PREMIUM_ORIGINAL_PRICE_PER_DAY,
  PREMIUM_PRICE_PER_DAY,
} from "../model/premium";

// Единая точка входа для всех "жёлтых карточек" Premium по приложению (см.
// profile-page.tsx и settings-page.tsx) — раньше одна из них вообще никуда
// не вела. Настоящей оплаты ещё нет, поэтому кнопка ниже сразу включает
// подписку всем подряд (см. buy-premium в bakai-server).
export const PremiumPage = () => {
  const navigate = useNavigate();
  const buyPremiumMutation = useBuyPremiumMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetPremium = async () => {
    if (isSubmitting) return;

    if (isMockMode()) {
      toast.success("Premium активирован!");
      navigate(-1);
      return;
    }

    setIsSubmitting(true);
    try {
      await buyPremiumMutation.mutateAsync(FREE_PREMIUM_DAYS);
      toast.success("Premium активирован!");
      navigate(-1);
    } catch {
      toast.error("Не получилось активировать Premium");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex h-dvh flex-col text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #3D1671 0%, #1B0E3A 20%, #0B0417 45%, #05020A 100%)",
      }}
    >
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="size-9" />
        <h1 className="text-lg font-bold">TapTap</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Закрыть"
          className="flex size-9 items-center justify-center rounded-full bg-white/10"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-12 pb-4">
        <div className="rounded-3xl border border-[#F4B740]/70 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            Попробовать <span className="text-[#F4B740]">PREMIUM</span>
            <span className="text-2xl leading-none">👑</span>
          </h2>

          <ul className="mt-4 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="size-4 shrink-0 text-white/80" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10">
          <div className="rounded-3xl bg-linear-to-br from-[#F5A623] to-[#8B5CF6] p-px">
            <div className="flex flex-col items-center rounded-[calc(1.5rem-1px)] bg-[#160B2C] pt-7 pb-6">
              <p className="text-sm text-white/50 line-through">
                {PREMIUM_ORIGINAL_PRICE_PER_DAY} сом
              </p>
              <p className="text-4xl font-extrabold">
                {PREMIUM_PRICE_PER_DAY}{" "}
                <span className="text-2xl font-extrabold">сом</span>
              </p>
            </div>
          </div>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Ежедневно
          </span>
        </div>
      </div>

      <div className="px-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleGetPremium()}
          className="w-full rounded-full bg-[#F5A623] py-4 font-bold text-[#1C1E24] transition-transform active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? (
            <Spinner className="mx-auto size-5" />
          ) : (
            "Получить Premium"
          )}
        </button>
      </div>
    </div>
  );
};
