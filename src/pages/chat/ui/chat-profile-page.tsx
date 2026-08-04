import { type ReactNode, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import { ChevronDown, MapPin, Quote, Star, X } from "lucide-react";

import {
  useBlockUserMutation,
  useChatQuery,
  usePublicProfileQuery,
  useReportUserMutation,
} from "@/entities/user";

import { REPORT_REASONS } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { ZodiacBadge } from "@/shared/ui/zodiac-badge";

import { CHAT_PROFILES } from "../model/chat-profiles";
import { CHATS } from "../model/chats";
import { mapFeedCandidateToChatProfile } from "../model/map-chat-profile";

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

export const ChatProfilePage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const numericChatId = chatId ? Number(chatId) : null;

  const mockChat = CHATS.find((item) => String(item.id) === chatId);
  const mockProfile = numericChatId ? CHAT_PROFILES[numericChatId] : undefined;

  const chatQuery = useChatQuery(isMockMode() ? null : numericChatId);
  const partnerId = isMockMode() ? null : (chatQuery.data?.partner.id ?? null);
  const profileQuery = usePublicProfileQuery(partnerId);
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportUserMutation();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const name = isMockMode() ? mockChat?.name : chatQuery.data?.partner.name;
  const profile = isMockMode()
    ? mockProfile
    : profileQuery.data && mapFeedCandidateToChatProfile(profileQuery.data);

  const submitReportAndBlock = async (reason: string) => {
    setIsReportOpen(false);
    if (isMockMode()) {
      toast.success("Жалоба отправлена, пользователь заблокирован");
      navigate(-1);
      return;
    }
    if (partnerId === null) return;
    try {
      await reportMutation.mutateAsync({ reason, reportedId: partnerId });
      await blockMutation.mutateAsync(partnerId);
      toast.success("Жалоба отправлена, пользователь заблокирован");
      navigate(-1);
    } catch {
      toast.error("Не получилось отправить жалобу");
    }
  };

  if (!isMockMode() && (chatQuery.isLoading || profileQuery.isLoading)) {
    return (
      <div className="h-dvh overflow-y-auto bg-[#FAF9FD] p-4">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
        <Skeleton className="mt-3 h-16 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    );
  }

  if (!name || !profile) {
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
          src={profile.photos[0]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 p-3">
          <div className="flex gap-1.5">
            {profile.photos.map((_photo, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  index === 0 ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        </div>

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
            {profile.online && (
              <span className="size-1.5 rounded-full bg-green-500" />
            )}
            {profile.online ? "Сейчас в сети" : "Был(а) недавно"}
          </span>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {name}, {profile.age}
              </h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-white/90">
                {profile.distanceKm !== null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {profile.distanceKm} км от тебя
                  </span>
                )}
                <ZodiacBadge sign={profile.zodiac} />
              </div>
            </div>
            <ChevronDown className="size-6 shrink-0" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Section title="О себе" icon={<Quote className="size-4" />}>
          <p className="font-medium">{profile.bio}</p>
        </Section>

        <Section
          title="Премиум данные"
          icon={<Star className="size-4 text-[#F5A623]" />}
        >
          <div className="flex flex-col items-start gap-2">
            {profile.premium.map((item) => (
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
          <p className="font-medium">{profile.seeking}</p>
        </Section>

        <Section title="Важная информация">
          <Chips items={profile.important} />
        </Section>

        <Section title="Семейное положение">
          <p className="font-medium">{profile.marital}</p>
        </Section>

        <Section title="Моя работа">
          <Chips items={profile.work} />
        </Section>

        <Section title="Моя учеба">
          <Chips items={profile.study} />
        </Section>

        <Section title="Мои интересы">
          <Chips items={profile.interests} />
        </Section>

        <Section title="Мои привычки">
          <Chips items={profile.habits} />
        </Section>

        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          className="mt-4 w-full rounded-2xl bg-red-50 py-4 text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться и заблокировать
        </button>
      </div>

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)}>
        <h2 className="text-center text-lg font-bold">Укажи причину жалобы</h2>
        <div className="mt-2 divide-y divide-[#E4E7EC]">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => void submitReportAndBlock(reason)}
              className="w-full py-4 text-center text-[#1C1E24]"
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsReportOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отмена
        </button>
      </Modal>
    </div>
  );
};
