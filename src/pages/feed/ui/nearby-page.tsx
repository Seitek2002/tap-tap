import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Heart, MapPin, Settings2 } from "lucide-react";
import { motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useFeedQuery,
  useLikeMutation,
  useUpdateProfileMutation,
} from "@/entities/user";

import boostIcon from "@/shared/assets/icons/boost.svg";
import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { useBounce } from "@/shared/lib/use-bounce";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

import { mapFeedCandidateToNearbyProfile } from "../model/map-nearby-candidate";
import { NEARBY_PROFILES } from "../model/nearby";
import { NearbyLikeIcon } from "./nearby-like-icon";

const SKELETON_COUNT = 6;

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

type GeoStatus = "checking" | "granted" | "locating" | "prompt";

export const NearbyPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("all");
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(
    isMockMode() ? "granted" : "checking",
  );

  // Смотрим текущее разрешение геолокации, чтобы не требовать его заново у
  // тех, кто уже разрешил раньше (иначе гейт мешал бы каждый визит).
  // Permissions API поддерживается не везде — если недоступен, просто
  // показываем гейт и разбираемся по клику на кнопку.
  useEffect(() => {
    if (isMockMode()) return;
    let cancelled = false;

    const resolveGeoStatus = async (): Promise<GeoStatus> => {
      if (!navigator.permissions) return "prompt";
      try {
        const status = await navigator.permissions.query({
          name: "geolocation",
        });
        return status.state === "granted" ? "granted" : "prompt";
      } catch {
        return "prompt";
      }
    };

    void resolveGeoStatus().then((next) => {
      if (!cancelled) setGeoStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const feedQuery = useFeedQuery(!isMockMode() && geoStatus === "granted");
  const likeMutation = useLikeMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const profiles = isMockMode()
    ? NEARBY_PROFILES
    : (feedQuery.data ?? []).map(mapFeedCandidateToNearbyProfile);
  const isLoading = !isMockMode() && feedQuery.isLoading;

  const handleEnableGeo = () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается этим устройством");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateProfileMutation.mutate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("prompt");
        toast.error("Не получилось получить геопозицию. Попробуй ещё раз");
      },
    );
  };

  const handleLike = async (id: number) => {
    if (likedIds.includes(id)) return;
    setLikedIds((prev) => [...prev, id]);

    if (isMockMode()) return;
    try {
      const result = await likeMutation.mutateAsync(id);
      if (result.limitReached) {
        setLikedIds((prev) => prev.filter((item) => item !== id));
        toast.error("Дневной лимит лайков исчерпан");
        return;
      }
      if (result.match) {
        const profile = profiles.find((item) => item.id === id);
        toast.success(
          profile ? `Это пара с ${profile.name}! 💜` : "Это пара! 💜",
        );
      }
    } catch {
      setLikedIds((prev) => prev.filter((item) => item !== id));
      toast.error("Не получилось лайкнуть. Попробуй ещё раз");
    }
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

      {geoStatus !== "granted" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <MapPin className="size-10 text-[#6B7280]" />
          <h2 className="mt-4 text-lg font-bold">
            Разреши доступ к геопозиции
          </h2>
          <p className="mt-2 max-w-xs text-sm text-[#6B7280]">
            Чтобы пользоваться этой страницей, разреши получать твои гео-данные
          </p>
          <button
            type="button"
            disabled={geoStatus === "locating"}
            onClick={handleEnableGeo}
            className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            {geoStatus === "locating" && (
              <Spinner className="size-4 text-white" />
            )}
            {geoStatus === "locating"
              ? "Определяем позицию..."
              : "Включить геопозицию"}
          </button>
        </div>
      ) : (
        <>
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
                    background:
                      "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
                  }}
                >
                  <h2 className="text-xl font-extrabold text-white italic">
                    БУДЬ ПЕРВЫМ
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    Твоя анкета будет первой, кого увидят пользователи
                    поблизости
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex items-center ml-auto gap-1.5 rounded-full bg-[#1C1E24] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <img src={boostIcon} alt="" className="size-3.5" />
                    Быть первым
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {isLoading
                    ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                        <Skeleton key={index} className="aspect-3/4 w-full" />
                      ))
                    : profiles.map((profile) => {
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
                                onClick={() => void handleLike(profile.id)}
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
                  <h2 className="text-lg font-bold">
                    Специальные рекомендации
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Мы будем предлагать тебе людей поблизости, которые подходят
                    под твои интересы
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  {isLoading
                    ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                        <Skeleton
                          key={index}
                          className="aspect-335/269 w-full"
                        />
                      ))
                    : profiles.map((profile) => {
                        const liked = likedIds.includes(profile.id);
                        return (
                          <div
                            key={profile.id}
                            className="overflow-hidden rounded-3xl bg-white"
                          >
                            <div className="p-1">
                              <div
                                onClick={() =>
                                  navigate(`/nearby/${profile.id}`)
                                }
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
                                  onClick={() => void handleLike(profile.id)}
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
        </>
      )}

      <BottomNav />
    </div>
  );
};
