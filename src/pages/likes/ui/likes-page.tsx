import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Heart, Lock, X } from "lucide-react";
import { motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useDislikeMutation,
  useLikeMutation,
  useLikedByMeQuery,
  useLikedMeQuery,
} from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import { useBounce } from "@/shared/lib/use-bounce";
import { cn } from "@/shared/lib/utils";
import { PullToRefresh } from "@/shared/ui/pull-to-refresh";
import { Skeleton } from "@/shared/ui/skeleton";

import {
  LIKED_YOU,
  type LikeProfile,
  UNLOCKED_LIKES_COUNT,
  YOUR_LIKES,
} from "../model/likes";
import { mapLikeUserToProfile } from "../model/map-like-user";
import { PremiumPaywallModal } from "./premium-paywall-modal";

const TABS = [
  { key: "likedYou", label: "Лайкнули тебя" },
  { key: "yourLikes", label: "Твои лайки" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ProfilePhoto = ({ profile }: { profile: LikeProfile }) => (
  <div className="relative aspect-[4/5] bg-[#E4E7EC]">
    <img
      src={profile.photo}
      alt=""
      className="absolute inset-0 size-full object-cover"
    />
    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-8">
      <span className="text-base font-medium text-white">
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
// блок без зазора между ними, с разделителем между кнопками. onLike/onDismiss
// не заданы в mock-режиме — сердечко просто подпрыгивает, крестик ничего не
// делает, как и было раньше.
const LikeActionCard = ({
  onDismiss,
  onLike,
  profile,
}: {
  onDismiss?: () => void;
  onLike?: () => void;
  profile: LikeProfile;
}) => {
  const navigate = useNavigate();
  const { bounce, scale } = useBounce();

  const handleLike = () => {
    bounce();
    onLike?.();
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white">
      <button
        type="button"
        onClick={() => navigate(`/likes/${profile.id}`)}
        className="block w-full text-left"
      >
        <ProfilePhoto profile={profile} />
      </button>
      <div className="flex border border-[#E4E7EC] rounded-bl-3xl rounded-br-3xl">
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-1 items-center justify-center py-2.75 text-[#1C1E24]"
          aria-label="Нравится"
        >
          <motion.span style={{ scale }} className="flex">
            <Heart className="size-6" />
          </motion.span>
        </button>
        <div className="w-px bg-[#E4E7EC] h-[25px] my-2.5"></div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex flex-1 items-center justify-center py-2.75 text-[#1C1E24]"
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
  // Карточки, по которым уже лайкнули/пропустили в этой сессии — сразу
  // убираем из "лайкнули тебя", не дожидаясь фонового рефетча списка.
  const [actedIds, setActedIds] = useState<Set<number>>(new Set());

  const likedMeQuery = useLikedMeQuery(!isMockMode());
  const likedByMeQuery = useLikedByMeQuery(!isMockMode());
  const likeMutation = useLikeMutation();
  const dislikeMutation = useDislikeMutation();

  const likedYou = isMockMode()
    ? LIKED_YOU
    : (likedMeQuery.data ?? [])
        .filter((u) => !actedIds.has(u.id))
        .map(mapLikeUserToProfile);
  const yourLikes = isMockMode()
    ? YOUR_LIKES
    : (likedByMeQuery.data ?? []).map(mapLikeUserToProfile);
  const isLoading =
    !isMockMode() &&
    (tab === "likedYou" ? likedMeQuery.isLoading : likedByMeQuery.isLoading);

  const handleLikeBack = async (profile: LikeProfile) => {
    try {
      const result = await likeMutation.mutateAsync(profile.id);
      setActedIds((prev) => new Set(prev).add(profile.id));
      if (result.match) {
        toast.success(`Это пара с ${profile.name}! Загляни в чат 💜`);
      }
    } catch {
      toast.error("Не получилось лайкнуть. Попробуй ещё раз");
    }
  };

  const handleDismiss = async (profile: LikeProfile) => {
    try {
      await dislikeMutation.mutateAsync(profile.id);
      setActedIds((prev) => new Set(prev).add(profile.id));
    } catch {
      toast.error("Не получилось. Попробуй ещё раз");
    }
  };

  const handleRefresh = async () => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      toast.success("Обновлено");
      return;
    }
    await Promise.all([likedMeQuery.refetch(), likedByMeQuery.refetch()]);
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
        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-4/5" />
            ))}
          </div>
        ) : tab === "likedYou" ? (
          <>
            <p className="mt-6 text-xs text-[#6B7280] text-center">
              Активируй Премиум чтобы посмотреть все лайки
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {likedYou.map((profile, index) =>
                index < UNLOCKED_LIKES_COUNT ? (
                  <LikeActionCard
                    key={profile.id}
                    profile={profile}
                    onDismiss={
                      isMockMode()
                        ? undefined
                        : () => void handleDismiss(profile)
                    }
                    onLike={
                      isMockMode()
                        ? undefined
                        : () => void handleLikeBack(profile)
                    }
                  />
                ) : (
                  <LockedCard key={profile.id} profile={profile} />
                ),
              )}
            </div>
          </>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {yourLikes.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </PullToRefresh>

      {/* Посмотреть все лайки — только для вкладки «Лайкнули тебя». Вне
          PullToRefresh: пока он тянется, на него накатывается transform
          (translateY), а это делает его containing block'ом для любых
          fixed-потомков — кнопка со своим bottom-20 внезапно съезжала
          относительно уже сдвинутого контейнера, а не вьюпорта. */}
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

      <BottomNav />

      <PremiumPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </div>
  );
};
