import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { ChevronLeft, Sparkles } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useBuyPremiumMutation,
  useTopUpMutation,
  useTransactionsQuery,
  useWalletQuery,
} from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

import {
  PREMIUM_DURATION_PRESETS,
  PREMIUM_PRICE_PER_DAY,
  TOP_UP_PRESETS,
} from "../model/wallet";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const formatExpiry = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
};

export const WalletPage = () => {
  const navigate = useNavigate();

  // Mock-режим без бэка — тот же баланс/премиум локально, без сети.
  // isPremium — отдельный флаг, а не сравнение mockPremiumUntil с Date.now()
  // прямо в рендере (импюрный вызов рендер-функции недопустим).
  const [mockBalance, setMockBalance] = useState(250);
  const [mockPremiumUntil, setMockPremiumUntil] = useState<null | number>(null);
  const [mockIsPremium, setMockIsPremium] = useState(false);

  const walletQuery = useWalletQuery(!isMockMode());
  const transactionsQuery = useTransactionsQuery(!isMockMode());
  const topUpMutation = useTopUpMutation();
  const buyPremiumMutation = useBuyPremiumMutation();

  const balance = isMockMode() ? mockBalance : (walletQuery.data?.balance ?? 0);
  const premiumUntil = isMockMode()
    ? mockPremiumUntil
    : (walletQuery.data?.premiumUntil ?? null);
  const isPremium = isMockMode()
    ? mockIsPremium
    : (walletQuery.data?.isPremium ?? false);

  const [customAmount, setCustomAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [buyingDays, setBuyingDays] = useState<null | number>(null);

  const handleTopUp = async (amount: number) => {
    if (!amount || amount <= 0 || isToppingUp) return;

    if (isMockMode()) {
      setMockBalance((prev) => prev + amount);
      toast.success(`Баланс пополнен на ${amount} сом`);
      setCustomAmount("");
      return;
    }

    setIsToppingUp(true);
    try {
      await topUpMutation.mutateAsync(amount);
      toast.success(`Баланс пополнен на ${amount} сом`);
      setCustomAmount("");
    } catch {
      toast.error("Не получилось пополнить баланс");
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleBuyPremium = async (days: number) => {
    if (buyingDays !== null) return;

    const cost = days * PREMIUM_PRICE_PER_DAY;
    if (balance < cost) {
      toast.error(
        `Недостаточно средств: нужно ${cost} сом, на балансе ${balance} сом`,
      );
      return;
    }

    if (isMockMode()) {
      setMockBalance((prev) => prev - cost);
      const now = Date.now();
      const base =
        mockPremiumUntil && mockPremiumUntil > now ? mockPremiumUntil : now;
      setMockPremiumUntil(base + days * 24 * 60 * 60 * 1000);
      setMockIsPremium(true);
      toast.success("Premium активирован!");
      return;
    }

    setBuyingDays(days);
    try {
      await buyPremiumMutation.mutateAsync(days);
      toast.success("Premium активирован!");
    } catch {
      toast.error("Не получилось купить Premium");
    } finally {
      setBuyingDays(null);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-extrabold">Кошелёк</h1>
        </header>

        <div className="px-4">
          {/* Баланс */}
          <div className="rounded-3xl bg-[#1C1E24] p-5 text-white">
            <p className="text-sm text-white/60">Баланс</p>
            <p className="mt-1 text-4xl font-extrabold">
              {balance}{" "}
              <span className="text-lg font-medium text-white/70">сом</span>
            </p>
            {isPremium && premiumUntil !== null && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-primary to-[#F5A623] px-3 py-1.5 text-xs font-bold">
                <Sparkles className="size-3.5" />
                Premium до {formatExpiry(premiumUntil)}
              </p>
            )}
          </div>

          {/* Пополнение */}
          <h2 className="mt-5 mb-2 text-sm font-bold text-[#6B7280]">
            Пополнить баланс
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {TOP_UP_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isToppingUp}
                onClick={() => void handleTopUp(amount)}
                className="rounded-2xl bg-white py-3 text-sm font-semibold disabled:opacity-50"
              >
                {amount}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={customAmount}
              onChange={(event) =>
                setCustomAmount(event.target.value.replace(/\D/g, ""))
              }
              placeholder="Своя сумма"
              inputMode="numeric"
              className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm outline-none placeholder:text-[#9CA3AF]"
            />
            <button
              type="button"
              disabled={!customAmount || isToppingUp}
              onClick={() => void handleTopUp(Number(customAmount))}
              className="flex h-11 shrink-0 items-center justify-center rounded-full bg-[#1C1E24] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isToppingUp ? <Spinner className="size-4" /> : "Пополнить"}
            </button>
          </div>

          {/* Premium */}
          <h2 className="mt-6 mb-2 text-sm font-bold text-[#6B7280]">
            TapTap Premium
          </h2>
          <div
            className="rounded-3xl p-[0.5px]"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #F4B740 100%)",
            }}
          >
            <div className="rounded-3xl bg-white p-4">
              <p className="text-sm text-[#6B7280]">Всего</p>
              <p className="text-2xl font-bold">
                {PREMIUM_PRICE_PER_DAY} сом{" "}
                <span className="text-sm font-medium text-[#6B7280]">
                  / день
                </span>
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PREMIUM_DURATION_PRESETS.map(({ days, label }) => (
                  <button
                    key={days}
                    type="button"
                    disabled={buyingDays !== null}
                    onClick={() => void handleBuyPremium(days)}
                    className="rounded-2xl bg-[#F2F1F3] py-3 text-center disabled:opacity-50"
                  >
                    <span className="block text-sm font-semibold">
                      {buyingDays === days ? (
                        <Spinner className="mx-auto size-4" />
                      ) : (
                        label
                      )}
                    </span>
                    <span className="block text-xs text-[#6B7280]">
                      {days * PREMIUM_PRICE_PER_DAY} сом
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* История */}
          {!isMockMode() && (
            <>
              <h2 className="mt-6 mb-2 text-sm font-bold text-[#6B7280]">
                История
              </h2>
              {transactionsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : transactionsQuery.data &&
                transactionsQuery.data.length > 0 ? (
                <div className="divide-y divide-[#E4E7EC] overflow-hidden rounded-2xl bg-white">
                  {transactionsQuery.data.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {transaction.created_at}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold",
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-[#1C1E24]",
                        )}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount} сом
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-[#6B7280]">Пока пусто</p>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
