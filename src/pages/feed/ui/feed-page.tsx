import { useState } from "react";

import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router";

import boostIcon from "@/shared/assets/icons/boost.svg";
import { ROUTES } from "@/shared/config";
import { BottomNav } from "@/widgets/bottom-nav";

import { GUIDE_PROFILE, PROFILES, type Profile } from "../model/profiles";
import { LikeLimitOverlay } from "./like-limit-overlay";
import { MatchOverlay } from "./match-overlay";
import { showNewMatchToast } from "./new-match-toast";
import { SwipeCard } from "./swipe-card";

const LIKE_LIMIT = 4;
// Показать "Это взаимно!" / тост о паре на этих по счёту лайках — для
// демонстрации механики (реальная логика взаимности придёт с бэком).
const MATCH_ON_LIKE_NUMBER = 2;
const TOAST_MATCH_ON_LIKE_NUMBER = 3;

export const FeedPage = () => {
  const navigate = useNavigate();
  // Пока гайд-карточка встречает всех первой.
  const [stack, setStack] = useState([GUIDE_PROFILE, ...PROFILES]);
  const [history, setHistory] = useState<
    { direction: "left" | "right"; profile: Profile }[]
  >([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<null | Profile>(null);
  // Карточка, которую только что вернули (для анимации влёта).
  const [returning, setReturning] = useState<{
    from: "left" | "right";
    id: number;
  } | null>(null);
  const likesLocked = likeCount >= LIKE_LIMIT;

  const handleSwipe = (direction: "left" | "right", id: number) => {
    const swiped = stack.find((profile) => profile.id === id);
    setStack((prev) => prev.filter((profile) => profile.id !== id));
    if (swiped) setHistory((prev) => [...prev, { direction, profile: swiped }]);

    // Считаем только лайки реальных людей (не гайд, не дизлайки).
    if (direction === "right" && id !== GUIDE_PROFILE.id) {
      const nextCount = likeCount + 1;
      setLikeCount(nextCount);
      if (nextCount >= LIKE_LIMIT) setIsLimitReached(true);
      if (nextCount === MATCH_ON_LIKE_NUMBER && swiped) {
        setMatchedProfile(swiped);
      }
      if (nextCount === TOAST_MATCH_ON_LIKE_NUMBER && swiped) {
        showNewMatchToast(swiped);
      }
    }
  };

  // Вернуть последнюю свайпнутую карточку.
  const handleRewind = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setStack((prev) => [last.profile, ...prev]);
    setReturning({ from: last.direction, id: last.profile.id });
    // Откатываем лайк, если возвращаем лайкнутую карточку.
    if (last.direction === "right" && last.profile.id !== GUIDE_PROFILE.id) {
      setLikeCount((count) => Math.max(0, count - 1));
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхний бар */}
      <header className="flex items-center justify-between px-4 pt-2.5 pb-2.5">
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
            <div className="flex h-full items-center justify-center px-8 text-center text-[#6B7280]">
              Пока никого рядом. Загляни позже 👀
            </div>
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
                  onLikeBlocked={() => setIsLimitReached(true)}
                  onRewind={handleRewind}
                  onSwipe={handleSwipe}
                />
              ))
          )}

          <LikeLimitOverlay
            isOpen={isLimitReached}
            onRemoveLimit={() => {
              // TODO: покупка Premium. Пока просто сбрасываем лимит.
              setLikeCount(0);
              setIsLimitReached(false);
            }}
            onWait={() => setIsLimitReached(false)}
          />
        </div>
      </div>

      <BottomNav />

      <MatchOverlay
        profile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
      />
    </div>
  );
};
