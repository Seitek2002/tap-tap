import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Check, ChevronLeft, X } from "lucide-react";

import { useCancelPremiumMutation, useWalletQuery } from "@/entities/user";

import premiumCrown from "@/shared/assets/images/premium-crown.png";
import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { Modal } from "@/shared/ui/modal";
import { Spinner } from "@/shared/ui/spinner";

import { PREMIUM_FEATURES, PREMIUM_PRICE_PER_DAY } from "../model/premium";

// Управление уже активной подпиской — отдельный экран от pages/premium
// (тот — оформление подписки впервые, "Попробовать PREMIUM"). Сюда ведёт
// синяя карточка "TAPTAP PREMIUM" в настройках.
export const PremiumManagePage = () => {
  const navigate = useNavigate();
  const walletQuery = useWalletQuery(!isMockMode());
  const isPremium = isMockMode() || (walletQuery.data?.isPremium ?? false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelPremiumMutation = useCancelPremiumMutation();

  const handleConfirmCancel = async () => {
    if (isCancelling) return;

    if (isMockMode()) {
      toast.success("Подписка отменена");
      setIsCancelOpen(false);
      navigate(ROUTES.premium, { replace: true });
      return;
    }

    setIsCancelling(true);
    try {
      await cancelPremiumMutation.mutateAsync();
      toast.success("Подписка отменена");
      setIsCancelOpen(false);
      navigate(ROUTES.premium, { replace: true });
    } catch {
      toast.error("Не получилось отменить подписку");
    } finally {
      setIsCancelling(false);
    }
  };

  // Страница управления подпиской без активной подписки не имеет смысла —
  // уводим туда, где её можно оформить (та же кнопка, что в настройках,
  // вела раньше).
  if (!isMockMode() && walletQuery.isSuccess && !isPremium) {
    navigate(ROUTES.premium, { replace: true });
    return null;
  }

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-xl font-extrabold">TapTap Premium</h1>
        </div>

        <div className="mt-5 flex items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-br from-[#EDE9FE] to-[#F5F3FF] p-4">
          <div className="flex-1">
            <h2 className="font-extrabold">Premium активен</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Доступ ко всем возможностям каждый день
            </p>
          </div>
          <img src={premiumCrown} alt="" className="h-14 w-auto shrink-0" />
        </div>

        <p className="mt-3 text-center text-sm text-[#6B7280]">
          Списываем {PREMIUM_PRICE_PER_DAY} сом в день, пока подписка активна
        </p>

        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#F4B740] to-[#FDDA60] p-4">
          <h3 className="border-b border-black/10 pb-3 font-bold">
            Что вам доступно
          </h3>
          <ul className="mt-3 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="size-4 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setIsCancelOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E4E7EC] py-4 text-sm font-semibold"
        >
          <X className="size-4" />
          Отменить подписку
        </button>
      </div>

      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)}>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EDE9FE]">
          <div className="flex size-9 items-center justify-center rounded-full border-2 border-primary/40">
            <X className="text-primary size-4" />
          </div>
        </div>

        <h2 className="mt-3 text-center text-lg font-bold">
          Отменить подписку?
        </h2>
        <p className="mt-1 text-center text-sm text-[#6B7280]">
          Ты больше не можешь пользоваться преимуществами Premium. Списание
          прекратится сразу после отмены
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FBEBCE] p-3 text-sm text-[#1C1E24]">
          <span className="shrink-0 text-lg">👑</span>
          Ты потеряешь доступ ко всем Premium-функциям
        </div>

        <button
          type="button"
          disabled={isCancelling}
          onClick={() => void handleConfirmCancel()}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-[#1C1E24] py-4 font-bold text-white disabled:opacity-60"
        >
          {isCancelling ? <Spinner className="size-5" /> : "Отменить подписку"}
        </button>
      </Modal>
    </div>
  );
};
