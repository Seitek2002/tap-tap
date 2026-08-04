import { type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";

import { ChevronDown, MapPin, Quote, Star, X } from "lucide-react";

import { usePublicProfileQuery } from "@/entities/user";

import { isMockMode } from "@/shared/lib/mock-mode";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import { ZodiacBadge } from "@/shared/ui/zodiac-badge";

import { LIKE_PROFILE_DETAILS } from "../model/like-profile-details";
import { LIKED_YOU, YOUR_LIKES } from "../model/likes";
import { mapFeedCandidateToLikeDetails } from "../model/map-like-details";
import { mapLikeUserToProfile } from "../model/map-like-user";

const Section = ({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
}) => (
  <div className="mt-3 rounded-2xl bg-white p-4">
    <div className="flex items-center gap-1.5 text-sm font-bold text-[#6B7280]">
      {icon}
      {title}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span
        key={item}
        className="rounded-full bg-[#F2F1F3] px-3 py-2 text-xs font-medium text-[#1C1E24]"
      >
        {item}
      </span>
    ))}
  </div>
);

export const LikeProfilePage = () => {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();
  const numericId = profileId ? Number(profileId) : null;

  const mockProfile = [...LIKED_YOU, ...YOUR_LIKES].find(
    (item) => String(item.id) === profileId,
  );
  const mockDetails = numericId ? LIKE_PROFILE_DETAILS[numericId] : undefined;

  const profileQuery = usePublicProfileQuery(isMockMode() ? null : numericId);

  const profile = isMockMode()
    ? mockProfile
    : profileQuery.data && mapLikeUserToProfile(profileQuery.data);
  const details = isMockMode()
    ? mockDetails
    : profileQuery.data && mapFeedCandidateToLikeDetails(profileQuery.data);

  if (!isMockMode() && profileQuery.isLoading) {
    return (
      <div className="h-dvh overflow-y-auto bg-[#FAF9FD] p-4">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
        <Skeleton className="mt-3 h-16 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    );
  }

  if (!profile || !details) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#FAF9FD] p-6 text-center text-[#6B7280]">
        <p>Профиль не найден</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary font-semibold"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto bg-[#FAF9FD]">
      <div className="relative h-[70vh]">
        <img
          src={profile.photo}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />

        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Закрыть"
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 flex size-9 items-center justify-center rounded-full bg-black/30 text-white"
        >
          <X className="size-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/25 to-transparent px-4 pt-16 pb-5 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-600">
            {details.online && (
              <span className="size-1.5 rounded-full bg-green-500" />
            )}
            {details.online ? "Сейчас в сети" : "Был(а) недавно"}
          </span>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {profile.name}, {profile.age}
              </h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-white/90">
                {details.distanceKm !== null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {details.distanceKm} км от тебя
                  </span>
                )}
                <ZodiacBadge sign={details.zodiac} />
              </div>
            </div>
            <ChevronDown className="size-6 shrink-0" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Section title="О себе" icon={<Quote className="size-4" />}>
          <p className="font-medium">{details.bio}</p>
        </Section>

        <Section
          title="Премиум данные"
          icon={<Star className="size-4 text-[#F5A623]" />}
        >
          <div className="flex flex-col items-start gap-2">
            {details.premium.map((item) => (
              <span
                key={item.label}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium",
                  item.tone === "green"
                    ? "border-green-500 bg-green-50"
                    : "border-[#F5A623] bg-amber-50",
                )}
              >
                {item.label}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Ищет">
          <p className="font-medium">{details.seeking}</p>
        </Section>

        <Section title="Важная информация">
          <Chips items={details.important} />
        </Section>

        <Section title="Семейное положение">
          <p className="font-medium">{details.marital}</p>
        </Section>

        <Section title="Моя работа">
          <Chips items={details.work} />
        </Section>

        <Section title="Моя учеба">
          <Chips items={details.study} />
        </Section>

        <Section title="Мои интересы">
          <Chips items={details.interests} />
        </Section>

        <Section title="Мои привычки">
          <Chips items={details.habits} />
        </Section>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-red-50 py-4 text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться и заблокировать
        </button>
      </div>
    </div>
  );
};
