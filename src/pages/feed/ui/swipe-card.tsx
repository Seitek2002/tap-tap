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
  RotateCcw,
  Star,
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
import {
  ImpactStyle,
  NotificationType,
  triggerHaptic,
  triggerNotificationHaptic,
} from "@/shared/lib/haptics";
import { cn } from "@/shared/lib/utils";

import type { Profile } from "../model/profiles";

type SwipeDirection = "left" | "right";

type SwipeCardProps = {
  enterFrom?: SwipeDirection;
  isTop: boolean;
  likesLocked: boolean;
  onLikeBlocked: () => void;
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
  onLikeBlocked,
  onRewind,
  onSwipe,
  profile,
}: SwipeCardProps) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    const el = cardRef.current;
    if (el) el.scrollTo({ behavior: "smooth", top: el.clientHeight });
  };

  // Если карточку вернули — стартуем за экраном и влетаем к центру.
  const initialX = enterFrom === "right" ? 700 : enterFrom === "left" ? -700 : 0;
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
                onClick={() => setIsMenuOpen(false)}
                className="text-nowrap flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm leading-none font-medium tracking-normal text-red-500"
              >
                <Ban className="size-5 shrink-0" />
                Пожаловаться на пользователя
              </button>
              <div className="border-t border-[#E4E7EC]" />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
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
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/25 to-transparent px-4 pt-16 pb-24 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-green-600">
            {profile.online && (
              <span className="size-1.5 rounded-full bg-green-500" />
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
                <h2 className="text-3xl font-bold">
                  {profile.name}, {profile.age}
                </h2>
                <span className="shrink-0 rounded-full bg-black/25 px-3 py-1 text-sm whitespace-nowrap backdrop-blur-sm">
                  {profile.marital}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {profile.distanceKm} км от тебя
                </span>
                <span className="flex items-center gap-1">
                  ⛎ {profile.zodiac}
                </span>
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
          className="mt-4 w-full rounded-2xl bg-red-50 py-4 text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться и заблокировать
        </button>
      </div>

      {/* Плавающая панель действий — прилипает снизу.
          Фон/цвет/тень проявляются по мере скролла (сверху — прозрачные). */}
      <div className="sticky bottom-0 z-20 px-6 pt-10 pb-4">
        <motion.div
          style={{ opacity: barOpacity }}
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#FAF9FD] via-[#FAF9FD]/95 to-transparent"
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
            className="flex size-12 items-center justify-center rounded-full"
            aria-label="Вернуть"
          >
            <RotateCcw className="size-5" />
          </motion.button>
          <motion.button
            type="button"
            data-haptic="none"
            onClick={() => flyOut("left")}
            style={{
              backgroundColor: btnBg,
              boxShadow: btnShadow,
              color: btnColor,
            }}
            className="flex size-16 items-center justify-center rounded-full"
            aria-label="Пропустить"
          >
            <X className="size-7" />
          </motion.button>
          <motion.button
            type="button"
            data-haptic="none"
            onClick={like}
            style={{
              backgroundColor: btnBg,
              boxShadow: btnShadow,
              color: btnColor,
            }}
            className="flex size-16 items-center justify-center rounded-full"
            aria-label="Нравится"
          >
            <Heart className="size-7 fill-current" />
          </motion.button>
          <motion.button
            type="button"
            style={{ backgroundColor: btnBg, boxShadow: btnShadow }}
            className="flex size-12 items-center justify-center rounded-full text-[#F5A623]"
            aria-label="Суперлайк"
          >
            <Star className="size-5 fill-current" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
