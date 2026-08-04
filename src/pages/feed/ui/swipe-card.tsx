import {
  type ReactNode,
  type UIEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Ban,
  Check,
  ChevronsDown,
  Heart,
  MapPin,
  MessageSquareWarning,
  Quote,
  Star,
  Undo2,
  X,
} from "lucide-react";
import {
  type PanInfo,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";

import guideHand from "@/shared/assets/icons/guide-hand.svg";
import guideScroll from "@/shared/assets/icons/guide-scroll.svg";
import { REPORT_REASONS } from "@/shared/config";
import {
  ImpactStyle,
  NotificationType,
  triggerHaptic,
  triggerNotificationHaptic,
} from "@/shared/lib/haptics";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { ZodiacBadge } from "@/shared/ui/zodiac-badge";

import type { Profile } from "../model/profiles";

type SwipeDirection = "left" | "right";

// null — закрыт; "report" — только жалоба (из меню «Ещё»); "reportAndBlock" —
// жалоба + блокировка одним действием (из нижней кнопки в деталях профиля).
type ReportMode = "report" | "reportAndBlock" | null;

type SwipeCardProps = {
  enterFrom?: SwipeDirection;
  isTop: boolean;
  likesLocked: boolean;
  onBlock: (id: number) => Promise<void> | void;
  onLikeBlocked: () => void;
  onReport: (id: number, reason: string) => Promise<void> | void;
  onRewind: () => void;
  onSwipe: (direction: SwipeDirection, id: number) => void;
  profile: Profile;
};

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

export const SwipeCard = ({
  enterFrom,
  isTop,
  likesLocked,
  onBlock,
  onLikeBlocked,
  onReport,
  onRewind,
  onSwipe,
  profile,
}: SwipeCardProps) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [reportMode, setReportMode] = useState<ReportMode>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const openReportFromMenu = () => {
    setIsMenuOpen(false);
    setReportMode("report");
  };

  const openBlockConfirmFromMenu = () => {
    setIsMenuOpen(false);
    setIsBlockConfirmOpen(true);
  };

  const reportFromBlockConfirm = () => {
    setIsBlockConfirmOpen(false);
    setReportMode("report");
  };

  const confirmBlockOnly = async () => {
    setIsBlockConfirmOpen(false);
    await onBlock(profile.id);
  };

  const submitReport = async (reason: string) => {
    const mode = reportMode;
    setReportMode(null);
    if (mode === "report") {
      await onReport(profile.id, reason);
    } else if (mode === "reportAndBlock") {
      await onReport(profile.id, reason);
      await onBlock(profile.id);
    }
  };

  const scrollToDetails = () => {
    const el = cardRef.current;
    if (el) el.scrollTo({ behavior: "smooth", top: el.clientHeight });
  };

  // Если карточку вернули — стартуем за экраном и влетаем к центру.
  const initialX =
    enterFrom === "right" ? 700 : enterFrom === "left" ? -700 : 0;
  const x = useMotionValue(initialX);

  useEffect(() => {
    if (initialX !== 0) {
      animate(x, 0, { damping: 30, stiffness: 260, type: "spring" });
    }
  }, [initialX, x]);

  const prevPhoto = () => setPhotoIndex((index) => Math.max(0, index - 1));
  const nextPhoto = () =>
    setPhotoIndex((index) => Math.min(profile.photos.length - 1, index + 1));
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  // Прогресс скролла карточки: 0 — сверху (над фото), 1 — уже в деталях.
  const scrollProgress = useMotionValue(0);
  const barOpacity = useTransform(scrollProgress, [0, 1], [0, 1]);
  const btnBg = useTransform(
    scrollProgress,
    [0, 1],
    ["rgba(255,255,255,0.18)", "rgba(255,255,255,1)"],
  );
  const btnColor = useTransform(scrollProgress, [0, 1], ["#ffffff", "#1c1e24"]);
  const btnShadow = useTransform(
    scrollProgress,
    [0, 1],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 6px 16px rgba(0,0,0,0.18)"],
  );

  // Сердечко/крестик — фиолетовое стекло сверху над фото, к моменту скролла
  // в детали профиля становятся белыми с тёмной иконкой (как и у остальных
  // кнопок панели, но со своей стартовой точкой).
  const heartXBg = useTransform(
    scrollProgress,
    [0, 1],
    ["rgba(124, 58, 237, 0.56)", "#ffffff"],
  );
  const heartXColor = useTransform(
    scrollProgress,
    [0, 1],
    ["#ffffff", "#1c1e24"],
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    scrollProgress.set(Math.min(event.currentTarget.scrollTop / 120, 1));
  };

  // Свайп-решение (лайк/дизлайк) — заметнее обычного тычка по кнопке, но не
  // такой сильный, как у деструктивных подтверждений (разлайк/блок).
  const flyOut = (direction: SwipeDirection) => {
    triggerHaptic(ImpactStyle.Medium);
    animate(x, direction === "right" ? 700 : -700, {
      duration: 0.3,
      onComplete: () => onSwipe(direction, profile.id),
    });
  };

  // Лайк: если лимит исчерпан — показываем экран лимита и возвращаем карточку.
  const like = () => {
    if (likesLocked) {
      triggerNotificationHaptic(NotificationType.Warning);
      onLikeBlocked();
      animate(x, 0, { damping: 30, stiffness: 300, type: "spring" });
    } else {
      flyOut("right");
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | PointerEvent | TouchEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x > 120 || info.velocity.x > 700) like();
    else if (info.offset.x < -120 || info.velocity.x < -700) flyOut("left");
    else animate(x, 0, { damping: 30, stiffness: 300, type: "spring" });
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "absolute inset-0 rounded-3xl bg-[#FAF9FD]",
        isTop ? "overflow-y-auto" : "pointer-events-none overflow-hidden",
      )}
      style={{ rotate, x }}
      animate={{ scale: isTop ? 1 : 0.95 }}
      drag={isTop ? "x" : false}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onScroll={handleScroll}
    >
      {/* Фото на всю высоту карточки */}
      <div className="relative h-full">
        <img
          src={profile.photos[photoIndex]}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />

        {/* Тап по бокам фото — листать фото */}
        <button
          type="button"
          onClick={prevPhoto}
          aria-label="Предыдущее фото"
          className="absolute inset-y-0 left-0 w-1/2"
        />
        <button
          type="button"
          onClick={nextPhoto}
          aria-label="Следующее фото"
          className="absolute inset-y-0 right-0 w-1/2"
        />

        {/* Индикаторы фото + ещё */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-3">
          <div className="flex gap-1.5">
            {profile.photos.map((_photo, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full ${index === photoIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
          <div className="pointer-events-auto mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="text-white"
              aria-label="Ещё"
            >
              •••
            </button>
          </div>
        </div>

        {/* Меню «Ещё»: пожаловаться / заблокировать */}
        {isMenuOpen && (
          <>
            <div
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 z-30 rounded-3xl bg-black/40"
            />
            <div className="absolute top-12 right-3 z-40 w-68 overflow-hidden rounded-2xl bg-white shadow-xl">
              <button
                type="button"
                onClick={openReportFromMenu}
                className="text-nowrap flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm leading-none font-medium tracking-normal text-red-500"
              >
                <Ban className="size-5 shrink-0" />
                Пожаловаться на пользователя
              </button>
              <div className="border-t border-[#E4E7EC]" />
              <button
                type="button"
                onClick={openBlockConfirmFromMenu}
                className="text-nowrap flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm leading-none font-medium tracking-normal text-red-500"
              >
                <MessageSquareWarning className="size-5 shrink-0" />
                Заблокировать пользователя
              </button>
            </div>
          </>
        )}

        {/* Оверлеи лайк / дизлайк */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1C1E24] shadow-lg"
        >
          <Check className="size-8" />
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1C1E24] shadow-lg"
        >
          <X className="size-8" />
        </motion.div>

        {/* Нижняя инфа профиля */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/25 to-transparent px-4 pt-16 pb-20 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5FDE3] px-2.5 py-1 text-xs font-semibold text-[#18722E]">
            {profile.online && (
              <span className="size-1.5 rounded-full bg-[#18722E]" />
            )}
            {profile.online ? "Сейчас в сети" : "Был(а) недавно"}
          </span>

          <button
            type="button"
            onClick={scrollToDetails}
            onPointerDownCapture={(event) => event.stopPropagation()}
            className="mt-2 flex w-full items-end justify-between text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {profile.name}, {profile.age}
                </h2>
                <span className="shrink-0 rounded-full bg-black/25 px-3 py-1 text-sm whitespace-nowrap backdrop-blur-sm border border-white">
                  {profile.marital}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-4 text-xs text-white/90">
                {profile.distanceKm !== null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {profile.distanceKm} км от тебя
                  </span>
                )}
                <ZodiacBadge sign={profile.zodiac} />
              </div>
            </div>
            <ChevronsDown className="size-6 shrink-0" />
          </button>
        </div>

        {/* Обучающий оверлей — только на карточке-гайде */}
        {profile.isGuide && isTop && (
          <div className="pointer-events-none absolute inset-0 bg-black/50">
            {/* Пунктирные разделители */}
            <div className="absolute top-0 left-1/2 h-[52%] border-l-2 border-dashed border-white/50" />
            <div className="absolute inset-x-0 top-[52%] border-t-2 border-dashed border-white/50" />

            {/* Тап по левой части — предыдущее фото */}
            <div className="absolute top-[18%] left-0 flex w-1/2 flex-col items-center gap-3 px-4 text-center text-white">
              <img src={guideHand} alt="" className="size-14" />
              <span className="text-sm font-bold">ПРЕДЫДУЩЕЕ ФОТО</span>
            </div>
            {/* Тап по правой части — следующее фото */}
            <div className="absolute top-[18%] right-0 flex w-1/2 flex-col items-center gap-3 px-4 text-center text-white">
              <img src={guideHand} alt="" className="size-14" />
              <span className="text-sm font-bold">СЛЕДУЮЩЕЕ ФОТО</span>
            </div>

            {/* Нижняя часть — тап скроллит к профилю */}
            <button
              type="button"
              onClick={scrollToDetails}
              className="pointer-events-auto absolute inset-x-0 top-[52%] bottom-0 flex flex-col items-center gap-2 pt-8 text-center text-white"
            >
              <img src={guideScroll} alt="Скролл" className="w-20" />
              <span className="text-base font-bold">ПОСМОТРЕТЬ ПРОФИЛЬ</span>
            </button>
          </div>
        )}
      </div>

      {/* Компактная шапка — прилипает сверху при скролле */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-[#FAF9FD] py-3">
        <img
          src={profile.photos[photoIndex]}
          alt=""
          className="size-9 rounded-full object-cover"
        />
        <span className="text-lg font-bold">
          {profile.name}, {profile.age}
        </span>
      </div>

      {/* Подробности профиля (открываются скроллом) */}
      <div className="pb-10">
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
          onClick={() => setReportMode("reportAndBlock")}
          className="mt-4 w-full rounded-2xl bg-red-50 py-4 text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться и заблокировать
        </button>
      </div>

      <Modal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">Заблокировать {profile.name}?</h2>
          <p className="text-sm text-[#6B7280]">
            Мы скроем ваш профиль друг от друга,
            <br />а общение станет недоступно.
          </p>
        </div>
        <button
          type="button"
          data-haptic="heavy"
          onClick={() => void confirmBlockOnly()}
          className="mt-6 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Заблокировать
        </button>
        <button
          type="button"
          onClick={reportFromBlockConfirm}
          className="mt-4 w-full text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться
        </button>
      </Modal>

      <Modal isOpen={reportMode !== null} onClose={() => setReportMode(null)}>
        <h2 className="text-center text-lg font-bold">Укажи причину жалобы</h2>
        <div className="mt-2 divide-y divide-[#E4E7EC]">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              data-haptic="heavy"
              onClick={() => void submitReport(reason)}
              className="w-full py-4 text-center text-[#1C1E24]"
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setReportMode(null)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отмена
        </button>
      </Modal>

      <div className="sticky bottom-0 z-20 px-6 pb-4">
        {/* Прогрессивный blur (0 → 3px от верха к низу) — CSS не умеет
            пространственно-переменный backdrop-filter, берём максимум
            (3px), раз сама подложка и так проявляется только при скролле
            через barOpacity. */}
        <motion.div
          style={{ opacity: barOpacity }}
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/39 to-black/0 backdrop-blur-[3px]"
        />
        <div className="relative flex items-center justify-between">
          <motion.button
            type="button"
            data-haptic="medium"
            onClick={onRewind}
            style={{
              backgroundColor: btnBg,
              boxShadow: btnShadow,
              color: btnColor,
            }}
            className="flex size-10 items-center justify-center rounded-full"
            aria-label="Вернуть"
          >
            <Undo2 className="size-5" />
          </motion.button>
          <div className="flex items-center gap-5">
            <motion.button
              type="button"
              data-haptic="none"
              onClick={() => flyOut("left")}
              style={{ backgroundColor: heartXBg, color: heartXColor }}
              className="flex size-13.5 items-center justify-center rounded-full shadow-[inset_2px_-1px_2px_0_rgba(255,255,255,0.16)] backdrop-blur-[30px]"
              aria-label="Пропустить"
            >
              <X className="size-8 fill-current" />
            </motion.button>
            <motion.button
              type="button"
              data-haptic="none"
              onClick={like}
              style={{ backgroundColor: heartXBg, color: heartXColor }}
              className="flex size-13.5 items-center justify-center rounded-full shadow-[inset_2px_-1px_2px_0_rgba(255,255,255,0.16)] backdrop-blur-[30px]"
              aria-label="Нравится"
            >
              <Heart className="size-8 fill-current" />
            </motion.button>
          </div>
          <motion.button
            type="button"
            style={{ backgroundColor: btnBg, boxShadow: btnShadow }}
            className="flex size-10 items-center justify-center rounded-full text-[#F5A623]"
            aria-label="Суперлайк"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.5634 19.5616C19.9688 19.9445 18.3041 19.9259 16.7184 19.5076C15.1327 19.0892 13.6755 18.2842 12.4773 17.1644C11.2791 16.0447 10.3772 14.6453 9.85258 13.0915C9.32792 11.5378 9.1968 9.87812 9.47095 8.26123C9.42988 8.30218 9.38581 8.34 9.33912 8.3744C9.01245 8.6229 8.60412 8.71506 7.78745 8.8994L7.04662 9.0674C4.17662 9.71723 2.74162 10.0416 2.39978 11.1394C2.05912 12.2361 3.03678 13.3806 4.99328 15.6684L5.49962 16.2599C6.05495 16.9097 6.33378 17.2352 6.45861 17.6366C6.58345 18.0391 6.54145 18.4731 6.45745 19.3399L6.38045 20.1297C6.08528 23.1829 5.93712 24.7089 6.83078 25.3867C7.72445 26.0646 9.06845 25.4474 11.7541 24.2096L12.4506 23.8899C13.2136 23.5376 13.5951 23.3626 13.9999 23.3626C14.4048 23.3626 14.7863 23.5376 15.5504 23.8899L16.2446 24.2096C18.9314 25.4462 20.2754 26.0646 21.1679 25.3879C22.0628 24.7089 21.9146 23.1829 21.6194 20.1297L21.5634 19.5616Z"
                fill="#F4B740"
              />
              <path
                d="M10.6786 6.3095L10.296 6.9955C9.87597 7.74916 9.66597 8.126 9.33931 8.3745C9.38597 8.3395 9.42992 8.30177 9.47114 8.26133C9.19692 9.87834 9.32804 11.5381 9.85275 13.092C10.3775 14.6459 11.2794 16.0454 12.4778 17.1651C13.6761 18.2849 15.1335 19.0899 16.7194 19.5082C18.3052 19.9264 19.9701 19.9448 21.5648 19.5617L21.5415 19.34C21.4586 18.4732 21.4166 18.0392 21.5415 17.6367C21.6663 17.2353 21.944 16.9098 22.5005 16.26L23.0068 15.6685C24.9633 13.3818 25.941 12.2373 25.5991 11.1395C25.2585 10.0417 23.8235 9.71616 20.9535 9.0675L20.2115 8.8995C19.396 8.71516 18.9876 8.623 18.6598 8.3745C18.3331 8.126 18.1231 7.74916 17.7031 6.9955L17.3216 6.3095C15.8435 3.65883 15.105 2.3335 14.0001 2.3335C12.8953 2.3335 12.1568 3.65883 10.6786 6.3095Z"
                fill="#7C3AED"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
