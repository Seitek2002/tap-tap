import { useState } from "react";

import { Heart, Lock, X } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { BottomNav } from "@/widgets/bottom-nav";

import { useBounce } from "@/shared/lib/use-bounce";
import { cn } from "@/shared/lib/utils";
import { PullToRefresh } from "@/shared/ui/pull-to-refresh";

import {
  LIKED_YOU,
  type LikeProfile,
  UNLOCKED_LIKES_COUNT,
  YOUR_LIKES,
} from "../model/likes";
import { PremiumPaywallModal } from "./premium-paywall-modal";

const TABS = [
  { key: "likedYou", label: "Лайкнули тебя" },
  { key: "yourLikes", label: "Твои лайки" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ProfilePhoto = ({ profile }: { profile: LikeProfile }) => (
  <div className="relative aspect-[3/4] bg-[#E4E7EC]">
    <img
      src={profile.photo}
      alt=""
      className="absolute inset-0 size-full object-cover"
    />
    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-8">
      <span className="text-base font-bold text-white">
        {profile.name}, {profile.age}
      </span>
    </div>
  </div>
);

const ProfileCard = ({ profile }: { profile: LikeProfile }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/likes/${profile.id}`)}
      className="overflow-hidden rounded-3xl text-left"
    >
      <ProfilePhoto profile={profile} />
    </button>
  );
};

// Открытая карточка «Лайкнули тебя»: фото и панель ♥/✕ — единый скруглённый
// блок без зазора между ними, с разделителем между кнопками.
const LikeActionCard = ({ profile }: { profile: LikeProfile }) => {
  const navigate = useNavigate();
  const { bounce, scale } = useBounce();

  return (
    <div className="overflow-hidden rounded-3xl bg-white">
      <button
        type="button"
        onClick={() => navigate(`/likes/${profile.id}`)}
        className="block w-full text-left"
      >
        <ProfilePhoto profile={profile} />
      </button>
      <div className="flex divide-x divide-[#E4E7EC]">
        <button
          type="button"
          onClick={bounce}
          className="flex flex-1 items-center justify-center py-3.5 text-[#1C1E24]"
          aria-label="Нравится"
        >
          <motion.span style={{ scale }} className="flex">
            <Heart className="size-6" />
          </motion.span>
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center py-3.5 text-[#1C1E24]"
          aria-label="Пропустить"
        >
          <X className="size-6" />
        </button>
      </div>
    </div>
  );
};

const LockedCard = ({ profile }: { profile: LikeProfile }) => (
  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[#E4E7EC]">
    <img
      src={profile.photo}
      alt=""
      className="absolute inset-0 size-full scale-110 object-cover blur-md"
    />
    <div className="absolute inset-0 bg-black/25" />
    <div className="absolute inset-0 flex items-center justify-center">
      <Lock className="size-6 text-white" />
    </div>
  </div>
);

export const LikesPage = () => {
  const [tab, setTab] = useState<TabKey>("likedYou");
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Бэкенда нет — просто имитируем сетевой запрос под спиннером.
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Обновлено");
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="px-2.5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex">
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                data-haptic="medium"
                onClick={() => setTab(item.key)}
                className="flex justify-center h-12.5 w-1/2 pt-4"
              >
                <span className="flex flex-col gap-2.5">
                  <span
                    className={cn(
                      "text-base font-semibold whitespace-nowrap",
                      active ? "text-[#1C1E24]" : "text-[#6B7280]",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "pt-0.5 rounded-full w-full",
                      active ? "bg-[#F5A623]" : "bg-transparent",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-px bg-[#E4E7EC]" />
      </div>

      {/* Прокручиваемая часть */}
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1 overflow-y-auto px-4 pb-24"
      >
        {tab === "likedYou" ? (
          <>
            <p className="mt-6 text-xs text-[#6B7280] text-center">
              Активируй Премиум чтобы посмотреть все лайки
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {LIKED_YOU.map((profile, index) =>
                index < UNLOCKED_LIKES_COUNT ? (
                  <LikeActionCard key={profile.id} profile={profile} />
                ) : (
                  <LockedCard key={profile.id} profile={profile} />
                ),
              )}
            </div>
          </>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {YOUR_LIKES.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
        {/* Посмотреть все лайки — только для вкладки «Лайкнули тебя» */}
        {tab === "likedYou" && (
          <div className="px-4 pb-4 fixed bottom-20 w-full left-0">
            <button
              type="button"
              onClick={() => setIsPaywallOpen(true)}
              className="w-full rounded-full bg-primary py-3 text-base font-semibold text-white transition-transform active:scale-[0.99]"
            >
              Посмотреть все лайки
            </button>
          </div>
        )}
      </PullToRefresh>

      <BottomNav />

      <PremiumPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </div>
  );
};
