import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Check, Crown, X } from "lucide-react";

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
          "radial-gradient(circle at 50% 0%, #3D1671 0%, #150A2E 55%, #0B0417 100%)",
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

      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-4">
        <div className="rounded-3xl border border-[#F4B740]/40 p-5">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            Попробовать <span className="text-[#F4B740]">PREMIUM</span>
            <Crown className="size-5 text-[#F4B740]" />
          </h2>

          <ul className="mt-4 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="size-4 shrink-0 text-[#F4B740]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 py-6">
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
            Ежедневно
          </span>
          <p className="mt-3 text-sm text-white/50 line-through">
            {PREMIUM_ORIGINAL_PRICE_PER_DAY} сом
          </p>
          <p className="text-4xl font-extrabold">
            {PREMIUM_PRICE_PER_DAY}{" "}
            <span className="text-lg font-medium">сом</span>
          </p>
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
