import { useState } from "react";
import { useNavigate } from "react-router";

import { Heart, Settings2 } from "lucide-react";
import { motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import boostIcon from "@/shared/assets/icons/boost.svg";
import { ROUTES } from "@/shared/config";
import { useBounce } from "@/shared/lib/use-bounce";
import { cn } from "@/shared/lib/utils";

import { NEARBY_PROFILES } from "../model/nearby";
import { NearbyLikeIcon } from "./nearby-like-icon";

const TABS = [
  { key: "all", label: "Все" },
  { key: "forYou", label: "Для тебя" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// У каждой карточки — свой независимый scale, поэтому лайк вынесен в
// отдельный компонент (у .map()-колбэка нельзя вызывать хуки напрямую).
const AllTabLikeButton = ({
  liked,
  onClick,
}: {
  liked: boolean;
  onClick: () => void;
}) => {
  const { bounce, scale } = useBounce();

  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        bounce();
      }}
      aria-label="Лайк"
      className={liked ? "text-red-500" : "text-[#1C1E24]"}
    >
      <motion.span style={{ scale }} className="flex">
        <Heart className={cn("size-5", liked && "fill-current")} />
      </motion.span>
    </button>
  );
};

const ForYouLikeButton = ({
  liked,
  onClick,
}: {
  liked: boolean;
  onClick: () => void;
}) => {
  const { bounce, scale } = useBounce();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
        bounce();
      }}
      aria-label="Лайк"
      className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full bg-white/23 backdrop-blur-[4.3px]"
    >
      <motion.span style={{ scale }} className="flex">
        <NearbyLikeIcon className="size-9" filled={liked} />
      </motion.span>
    </button>
  );
};

export const NearbyPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("all");
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <h1 className="text-2xl font-extrabold">Люди рядом</h1>
        <button
          type="button"
          onClick={() => navigate(ROUTES.filters)}
          className="flex size-9 items-center justify-center text-[#1C1E24]"
        >
          <Settings2 className="size-6" />
        </button>
      </header>

      <div className="flex border-b border-[#E4E7EC] px-4">
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              data-haptic="medium"
              onClick={() => setTab(item.key)}
              className="flex w-1/2 justify-center pt-1"
            >
              <span className="flex flex-col items-center gap-2 flex-1">
                <span
                  className={cn(
                    "text-sm whitespace-nowrap flex-1",
                    active ? "font-semibold" : "font-normal",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "h-0.5 w-full rounded-full",
                    active ? "bg-[#1C1E24]" : "bg-transparent",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === "all" ? (
          <>
            <div
              className="mt-4 overflow-hidden rounded-3xl p-5"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
              }}
            >
              <h2 className="text-xl font-extrabold text-white italic">
                БУДЬ ПЕРВЫМ
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Твоя анкета будет первой, кого увидят пользователи поблизости
              </p>
              <button
                type="button"
                className="mt-4 flex items-center ml-auto gap-1.5 rounded-full bg-[#1C1E24] px-4 py-2.5 text-sm font-bold text-white"
              >
                <img src={boostIcon} alt="" className="size-3.5" />
                Быть первым
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {NEARBY_PROFILES.map((profile) => {
                const liked = likedIds.includes(profile.id);
                return (
                  <div
                    key={profile.id}
                    className="overflow-hidden rounded-3xl bg-white border border-[#E4E7EC] p-1"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/nearby/${profile.id}`)}
                      className="block w-full"
                    >
                      <img
                        src={profile.photo}
                        alt=""
                        className="aspect-3/4 w-full object-cover rounded-2xl"
                      />
                    </button>
                    <div className="flex items-center justify-between px-2.5 py-2">
                      <span className="text-sm font-medium">
                        {profile.name}, {profile.age}
                      </span>
                      <AllTabLikeButton
                        liked={liked}
                        onClick={() => toggleLike(profile.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4">
              <h2 className="text-lg font-bold">Специальные рекомендации</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Мы будем предлагать тебе людей поблизости, которые подходят под
                твои интересы
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {NEARBY_PROFILES.map((profile) => {
                const liked = likedIds.includes(profile.id);
                return (
                  <div
                    key={profile.id}
                    className="overflow-hidden rounded-3xl bg-white"
                  >
                    <div className="p-1">
                      <div
                        onClick={() => navigate(`/nearby/${profile.id}`)}
                        className="relative aspect-335/269 overflow-hidden rounded-2xl"
                      >
                        <img
                          src={profile.photo}
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4 pt-10">
                          <span className="text-lg font-bold text-white">
                            {profile.name}, {profile.age}
                          </span>
                        </div>
                        <ForYouLikeButton
                          liked={liked}
                          onClick={() => toggleLike(profile.id)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 pt-3">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-[#F2F1F3] px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
