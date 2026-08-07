import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Settings2 } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useBlockUserMutation,
  useDislikeMutation,
  useFeedQuery,
  useLikeMutation,
  useMeQuery,
  useReportUserMutation,
  useUndoMutation,
  useWalletQuery,
} from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import boostIcon from "@/shared/assets/icons/boost.svg";
import { ROUTES } from "@/shared/config";
import {
  NotificationType,
  triggerNotificationHaptic,
} from "@/shared/lib/haptics";
import { isMockMode } from "@/shared/lib/mock-mode";
import { guideSeen } from "@/shared/lib/seen-flags";

import { mapFeedCandidateToProfile } from "../model/map-feed-candidate";
import { GUIDE_PROFILE, PROFILES, type Profile } from "../model/profiles";
import { LikeLimitOverlay } from "./like-limit-overlay";
import { MatchOverlay } from "./match-overlay";
import { showNewMatchToast } from "./new-match-toast";
import { SwipeCard } from "./swipe-card";
import { SwipeCardSkeleton } from "./swipe-card-skeleton";

// Локальный предохранитель — то же значение, что и дефолт бэка
// (FREE_DAILY_LIKES в swipes.js), чтобы блокировать до сетевого запроса.
// Источник истины всё равно бэк: если он ответит limitReached, override.
const LIKE_LIMIT = 4;

// Демо-режим (без бэка): раньше матч был на N-ном по счёту лайке — для
// mock-режима эта имитация возвращается, чтобы было что показать.
const MOCK_MATCH_ON_LIKE_NUMBER = 2;
const MOCK_TOAST_MATCH_ON_LIKE_NUMBER = 3;

export const FeedPage = () => {
  const navigate = useNavigate();
  const feedQuery = useFeedQuery(!isMockMode());
  const walletQuery = useWalletQuery(!isMockMode());
  const meQuery = useMeQuery(!isMockMode());
  const myPhoto = meQuery.data?.photos[0]
    ? resolveUploadUrl(meQuery.data.photos[0])
    : null;
  const likeMutation = useLikeMutation();
  const dislikeMutation = useDislikeMutation();
  const undoMutation = useUndoMutation();
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportUserMutation();
  const isPremium = !isMockMode() && (walletQuery.data?.isPremium ?? false);

  const showGuide = !guideSeen.get();
  const [stack, setStack] = useState<Profile[]>(() => {
    const guide = showGuide ? [GUIDE_PROFILE] : [];
    return isMockMode() ? [...guide, ...PROFILES] : guide;
  });
  // Свайпнутые в этой сессии — чтобы фоновый рефетч ленты (см. useFeedQuery,
  // staleTime: 0) не вернул в стек карточку, которую только что убрали
  // локально, пока бэк ещё не успел это отразить в ответе.
  const swipedIdsRef = useRef<Set<number>>(new Set());

  // Каждый раз, когда приходят свежие данные ленты (первая загрузка,
  // фоновый рефетч, инвалидация после лайка/дизлайка/андо в другом месте) —
  // подмешиваем в стек новых кандидатов и убираем тех, кого бэк больше не
  // отдаёт (лайкнули/дизлайкнули/заблокировали), не трогая порядок уже
  // показанных карточек и не возвращая то, что свайпнули только что.
  useEffect(() => {
    if (!feedQuery.data) return;
    const fresh = feedQuery.data
      .map(mapFeedCandidateToProfile)
      .filter((profile) => !swipedIdsRef.current.has(profile.id));
    const freshIds = new Set(fresh.map((profile) => profile.id));
    setStack((prev) => {
      const prevIds = new Set(prev.map((profile) => profile.id));
      const kept = prev.filter(
        (profile) => profile.isGuide || freshIds.has(profile.id),
      );
      const added = fresh.filter((profile) => !prevIds.has(profile.id));
      return [...kept, ...added];
    });
  }, [feedQuery.data]);

  const [history, setHistory] = useState<
    { direction: "left" | "right"; profile: Profile }[]
  >([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [matched, setMatched] = useState<{
    chatId: null | number;
    profile: Profile;
  } | null>(null);
  // Карточка, которую только что вернули (для анимации влёта).
  const [returning, setReturning] = useState<{
    from: "left" | "right";
    id: number;
  } | null>(null);
  const likesLocked = !isPremium && likeCount >= LIKE_LIMIT;

  const handleSwipe = async (direction: "left" | "right", id: number) => {
    const swiped = stack.find((profile) => profile.id === id);
    setStack((prev) => prev.filter((profile) => profile.id !== id));
    if (swiped) setHistory((prev) => [...prev, { direction, profile: swiped }]);

    // Гайд-карточка не реальный человек — на бэке для неё ничего не свайпаем.
    if (id === GUIDE_PROFILE.id) {
      guideSeen.set();
      return;
    }
    swipedIdsRef.current.add(id);

    if (isMockMode()) {
      if (direction === "right") {
        const nextCount = likeCount + 1;
        setLikeCount(nextCount);
        if (nextCount >= LIKE_LIMIT) setIsLimitReached(true);
        if (nextCount === MOCK_MATCH_ON_LIKE_NUMBER && swiped) {
          triggerNotificationHaptic(NotificationType.Success);
          // Настоящего чата нет — используем id профиля, чтобы кнопка
          // "написать" вела хоть куда-то предсказуемое в тех же моках.
          setMatched({ chatId: swiped.id, profile: swiped });
        }
        if (nextCount === MOCK_TOAST_MATCH_ON_LIKE_NUMBER && swiped) {
          // Настоящего чата нет — тот же приём, что и у MatchOverlay выше:
          // id профиля вместо chatId, чтобы клик по тосту вёл хоть куда-то
          // предсказуемое в мок-режиме.
          showNewMatchToast(swiped, () => navigate(`/chat/${swiped.id}`));
        }
      }
      return;
    }

    if (direction === "left") {
      dislikeMutation.mutate(id);
      return;
    }

    try {
      const result = await likeMutation.mutateAsync(id);
      if (result.limitReached) {
        setIsLimitReached(true);
        return;
      }
      setLikeCount((count) => count + 1);
      if (result.match && swiped) {
        triggerNotificationHaptic(NotificationType.Success);
        setMatched({ chatId: result.chatId ?? null, profile: swiped });
      }
    } catch {
      toast.error("Не получилось лайкнуть. Попробуй ещё раз");
    }
  };

  // Вернуть последнюю свайпнутую карточку.
  const handleRewind = async () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];

    if (!isMockMode() && last.profile.id !== GUIDE_PROFILE.id) {
      try {
        await undoMutation.mutateAsync();
      } catch {
        toast.error("Не получилось отменить свайп");
        return;
      }
    }

    swipedIdsRef.current.delete(last.profile.id);
    setHistory((prev) => prev.slice(0, -1));
    setStack((prev) => [last.profile, ...prev]);
    setReturning({ from: last.direction, id: last.profile.id });
    // Откатываем лайк, если возвращаем лайкнутую карточку.
    if (last.direction === "right" && last.profile.id !== GUIDE_PROFILE.id) {
      setLikeCount((count) => Math.max(0, count - 1));
    }
  };

  const handleBlock = async (id: number) => {
    if (isMockMode()) {
      setStack((prev) => prev.filter((profile) => profile.id !== id));
      toast.success("Пользователь заблокирован");
      return;
    }
    try {
      await blockMutation.mutateAsync(id);
      setStack((prev) => prev.filter((profile) => profile.id !== id));
      toast.success("Пользователь заблокирован");
    } catch {
      toast.error("Не получилось заблокировать. Попробуй ещё раз");
    }
  };

  const handleReport = async (id: number, reason: string) => {
    if (isMockMode()) {
      toast.success("Жалоба отправлена");
      return;
    }
    try {
      await reportMutation.mutateAsync({ reason, reportedId: id });
      toast.success("Жалоба отправлена");
    } catch {
      toast.error("Не получилось отправить жалобу");
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхний бар */}
      <header className="flex items-center justify-between px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5">
        <h1 className="text-2xl font-extrabold">TapTap</h1>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center rounded-full bg-[#1C1E24] px-2.5 py-1 text-xs font-semibold text-white"
          >
            <img src={boostIcon} alt="" />
            Boost
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.filters)}
            className="flex size-9 items-center justify-center text-[#1C1E24]"
          >
            <Settings2 className="size-6" />
          </button>
        </div>
      </header>

      {/* Стек карточек */}
      <div className="min-h-0 flex-1 px-4 pb-3">
        <div className="relative size-full overflow-hidden">
          {stack.length === 0 ? (
            !isMockMode() && feedQuery.isLoading ? (
              <SwipeCardSkeleton />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-[#6B7280]">
                Пока никого рядом. Загляни позже 👀
              </div>
            )
          ) : (
            stack
              .slice(0, 2)
              .map((profile, index) => ({ index, profile }))
              .reverse()
              .map(({ index, profile }) => (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isTop={index === 0}
                  enterFrom={
                    returning?.id === profile.id ? returning.from : undefined
                  }
                  likesLocked={likesLocked}
                  onBlock={(id) => void handleBlock(id)}
                  onLikeBlocked={() => setIsLimitReached(true)}
                  onReport={(id, reason) => void handleReport(id, reason)}
                  onRewind={() => void handleRewind()}
                  onSwipe={(direction, id) => void handleSwipe(direction, id)}
                />
              ))
          )}

          <LikeLimitOverlay
            isOpen={isLimitReached}
            onRemoveLimit={() => navigate(ROUTES.premium)}
            onWait={() => setIsLimitReached(false)}
          />
        </div>
      </div>

      <BottomNav />

      <MatchOverlay
        chatId={matched?.chatId ?? null}
        myPhoto={myPhoto}
        profile={matched?.profile ?? null}
        onClose={() => setMatched(null)}
      />
    </div>
  );
};
