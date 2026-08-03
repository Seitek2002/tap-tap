import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import {
  Briefcase,
  Check,
  ChevronRight,
  Dumbbell,
  Gift,
  GraduationCap,
  Lock,
  PawPrint,
  Plus,
  Ruler,
  Settings,
  Smile,
  Sparkles,
  Wine,
} from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import bestPhotoIllustration from "@/shared/assets/images/best-photo-illustration.png";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Checkbox, Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Pill } from "@/shared/ui/pill";
import { Slider } from "@/shared/ui/slider";
import { Toggle } from "@/shared/ui/toggle";

import {
  DEFAULT_INTERESTS,
  DEFAULT_PROFILE_OPTION_VALUES,
  INTERESTS,
  MORE_PHOTOS_PREVIEW,
  OWN_PROFILE,
  PREMIUM_FEATURES,
  PROFILE_OPTION_FIELDS,
  type ProfileOptionFieldKey,
} from "../model/profile";
import { BioQuoteIcon } from "./bio-quote-icon";

const FIELD_ICONS: Record<ProfileOptionFieldKey, ReactNode> = {
  alcohol: <Wine className="size-4" />,
  children: <Smile className="size-4" />,
  loveLanguage: <Gift className="size-4" />,
  pets: <PawPrint className="size-4" />,
  religion: <Sparkles className="size-4" />,
  sport: <Dumbbell className="size-4" />,
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
  <div className="mx-4 mt-3 rounded-3xl border border-[#E4E7EC] bg-white p-4">
    <h2 className="flex items-center gap-1.5 border-b border-[#E4E7EC] pb-2.5 text-sm leading-[120%] font-semibold text-[#1C1E24]">
      {icon}
      {title}
    </h2>
    <div className="mt-1">{children}</div>
  </div>
);

/** Склонение «интерес/интереса/интересов» по числу. */
const interestsWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "интерес";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "интереса";
  return "интересов";
};

const Row = ({
  icon,
  label,
  onClick,
  value,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  value: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between py-3 text-left"
  >
    <span className="flex items-center gap-2 text-sm leading-[120%] font-normal text-[#1C1E24]">
      {icon}
      {label}
    </span>
    <span className="flex items-center gap-1 text-[#6B7280]">
      <span className="max-w-40 truncate">{value}</span>
      <ChevronRight className="size-4 shrink-0" />
    </span>
  </button>
);

export const ProfilePage = () => {
  const navigate = useNavigate();
  const profile = OWN_PROFILE;
  const [isBestPhotoOpen, setIsBestPhotoOpen] = useState(false);
  const [bestPhotoEnabled, setBestPhotoEnabled] = useState(false);

  // Тап по описанию превращает текст в textarea прямо на карточке.
  const [bio, setBio] = useState(profile.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingBio) bioInputRef.current?.select();
  }, [isEditingBio]);

  const [isHeightOpen, setIsHeightOpen] = useState(false);
  const [height, setHeight] = useState(170);
  const [heightHidden, setHeightHidden] = useState(false);

  const [isJobOpen, setIsJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState(profile.work);
  const [jobCompany, setJobCompany] = useState("");

  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [interests, setInterests] = useState<string[]>(DEFAULT_INTERESTS);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [study, setStudy] = useState(profile.study);

  const [optionValues, setOptionValues] = useState(
    DEFAULT_PROFILE_OPTION_VALUES,
  );
  const [openField, setOpenField] = useState<null | ProfileOptionFieldKey>(
    null,
  );

  // max=1 — выбор сразу закрывает шит (радио-семантика: тап = готово).
  // max>1 — тап только переключает опцию, шит остаётся открытым.
  const selectOption = (
    field: (typeof PROFILE_OPTION_FIELDS)[number],
    option: string,
  ) => {
    if (field.max === 1) {
      setOptionValues((prev) => ({ ...prev, [field.key]: [option] }));
      setOpenField(null);
      return;
    }
    setOptionValues((prev) => {
      const current = prev[field.key];
      if (current.includes(option)) {
        return {
          ...prev,
          [field.key]: current.filter((item) => item !== option),
        };
      }
      if (current.length >= field.max) return prev;
      return { ...prev, [field.key]: [...current, option] };
    });
  };

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <img
            src={profile.photo}
            alt=""
            className="size-14 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">
              {profile.name}, {profile.age}
            </h1>
            <p className="text-sm text-[#6B7280]">{profile.location}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.profileSettings)}
            aria-label="Настройки"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC]"
          >
            <Settings className="size-5" />
          </button>
        </header>

        <div className="relative mt-4 px-4">
          <div className="h-1 rounded-full bg-[#E4E7EC]">
            <div
              className="h-1 rounded-full bg-[#1C1E24]"
              style={{ width: `${profile.completion}%` }}
            />
          </div>
          <span
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[#1C1E24] px-2 py-1 text-[10px] font-bold text-white"
            style={{ left: `calc(${profile.completion}% + 4px)` }}
          >
            {profile.completion}%
          </span>
        </div>

        <div className="mx-4 mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#F4B740] to-[#FDDA60] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold italic">PREMIUM</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold italic">9 сом »</span>
              <button
                type="button"
                className="rounded-full bg-[#1C1E24] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white"
              >
                Еще функции
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_auto] items-center gap-y-3 text-sm">
            <span className="text-xs leading-[120%] font-bold text-[#1C1E24]">
              Что входит
            </span>
            <span className="text-center text-xs leading-[120%] font-bold text-[#1C1E24]">
              Бесплатно
            </span>
            <span className="text-center pl-4 text-xs leading-[120%] font-bold text-[#1C1E24]">
              Premium
            </span>
            {PREMIUM_FEATURES.map((feature) => (
              <Fragment key={feature.label}>
                <span
                  className={cn(
                    "text-xs leading-[120%] text-[#1C1E24]",
                    feature.bold ? "font-bold" : "font-medium",
                  )}
                >
                  {feature.label}
                </span>
                <div className="flex justify-center">
                  <Lock className="size-3" />
                </div>
                <div className="flex justify-center pl-4">
                  <Check className="size-3" />
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mx-4 mt-4 flex flex-col gap-2.5 divide-y divide-[#E4E7EC] rounded-3xl border border-[#E4E7EC] bg-white py-2">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4"
          >
            <span className="flex items-center gap-2 text-sm leading-[120%] font-semibold">
              <Plus className="size-4" />
              Добавь больше фото
            </span>
            <div className="flex -space-x-2">
              {MORE_PHOTOS_PREVIEW.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt=""
                  className="size-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsBestPhotoOpen(true)}
            className="flex w-full items-center justify-between px-4"
          >
            <span className="text-sm leading-[120%] font-normal text-[#1C1E24]">
              Показывать лучшее фото
            </span>
            <span className="flex text-xs items-center gap-1 text-[#1C1E24]">
              {bestPhotoEnabled ? "Вкл" : "Выкл"}
              <ChevronRight className="size-4" />
            </span>
          </button>
        </div>

        <div className="mx-4 mt-3 rounded-3xl border border-[#E4E7EC] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm leading-[120%] font-semibold">
              Добавь свои интересы
            </span>
            <button
              type="button"
              onClick={() => setIsInterestsOpen(true)}
              aria-label="Добавить интерес"
              className="flex size-7 items-center justify-center rounded-full bg-[#F2F1F3]"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-[#F2F1F3] px-3 py-2 text-xs leading-[120%] font-normal text-[#1C1E24]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-4 mt-3 flex h-33.25 flex-col gap-2.5 rounded-3xl border border-[#E4E7EC] bg-white px-4 py-2.5">
          <h2 className="flex items-center gap-1.5 border-b border-[#E4E7EC] pb-2.5 text-sm leading-[120%] font-semibold text-[#1C1E24]">
            <BioQuoteIcon className="size-4 shrink-0" />
            Дополни описание
          </h2>

          {isEditingBio ? (
            <textarea
              ref={bioInputRef}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              onBlur={() => setIsEditingBio(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsEditingBio(false);
              }}
              className="flex-1 resize-none bg-transparent text-sm leading-[120%] font-normal text-[#1C1E24] outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingBio(true)}
              className="flex-1 overflow-hidden text-left text-sm leading-[120%] font-normal text-[#1C1E24]"
            >
              {bio}
            </button>
          )}
        </div>

        <Section title="О тебе">
          <Row
            icon={<Ruler className="size-4" />}
            label="Твой рост"
            onClick={() => setIsHeightOpen(true)}
            value={heightHidden ? "Не указано" : `${height} см`}
          />
          <Row
            icon={<Briefcase className="size-4" />}
            label="Работа"
            onClick={() => setIsJobOpen(true)}
            value={jobCompany ? `${jobTitle} · ${jobCompany}` : jobTitle}
          />
          <Row
            icon={<GraduationCap className="size-4" />}
            label="Учеба"
            onClick={() => setIsStudyOpen(true)}
            value={study}
          />
        </Section>

        <Section title="Твоя жизнь">
          {PROFILE_OPTION_FIELDS.map((field) => (
            <Row
              key={field.key}
              icon={FIELD_ICONS[field.key]}
              label={field.label}
              onClick={() => setOpenField(field.key)}
              value={optionValues[field.key].join(", ")}
            />
          ))}
        </Section>
      </div>

      <Modal isOpen={isBestPhotoOpen} onClose={() => setIsBestPhotoOpen(false)}>
        <div className="flex justify-center">
          <img src={bestPhotoIllustration} alt="" className="h-20" />
        </div>

        <h2 className="mt-4 text-center text-lg font-bold">
          Покажи лучшее фото первым
        </h2>
        <p className="mt-1 text-center text-sm text-[#6B7280]">
          Алгоритм по очереди будет показывать твои фотографии и будет чаще
          отображать первой ту, которая привлекает больше внимания
        </p>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F2F1F3] p-4">
          <span className="font-medium">Показывать лучшее фото</span>
          <Toggle
            checked={bestPhotoEnabled}
            onChange={(event) => setBestPhotoEnabled(event.target.checked)}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsBestPhotoOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <Modal isOpen={isHeightOpen} onClose={() => setIsHeightOpen(false)}>
        <h2 className="text-lg font-bold">Укажи свой настоящий рост</h2>

        <div className="mt-5 flex items-center gap-3">
          <span className="shrink-0 text-sm font-medium text-[#6B7280]">
            {height} см
          </span>
          <Slider
            className="flex-1"
            min={140}
            max={210}
            value={height}
            onChange={setHeight}
            disabled={heightHidden}
          />
        </div>

        <Checkbox
          className="mt-4"
          label="Предпочту не отвечать"
          checked={heightHidden}
          onChange={(event) => setHeightHidden(event.target.checked)}
        />

        <button
          type="button"
          onClick={() => setIsHeightOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <Modal isOpen={isJobOpen} onClose={() => setIsJobOpen(false)}>
        <h2 className="text-lg font-bold">Твоя работа</h2>

        <div className="mt-5 flex flex-col gap-3">
          <Input
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="Должность"
          />
          <Input
            value={jobCompany}
            onChange={(event) => setJobCompany(event.target.value)}
            placeholder="Компания"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsJobOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <Modal isOpen={isStudyOpen} onClose={() => setIsStudyOpen(false)}>
        <h2 className="text-lg font-bold">Твоя учеба</h2>

        <div className="mt-5">
          <Input
            value={study}
            onChange={(event) => setStudy(event.target.value)}
            placeholder="Учебное заведение"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsStudyOpen(false)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      {/* Шиты «Твоя жизнь» — вертикальный список пилюль, 1 или 2 варианта
          на выбор (см. PROFILE_OPTION_FIELDS), тот же паттерн, что и в
          pages/filters. */}
      {PROFILE_OPTION_FIELDS.map((field) => (
        <Modal
          key={field.key}
          isOpen={openField === field.key}
          onClose={() => setOpenField(null)}
        >
          <h2 className="text-center text-lg font-bold">{field.title}</h2>

          <div className="mt-4 space-y-2">
            {field.options.map((option) => {
              const selected = optionValues[field.key].includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(field, option)}
                  className={cn(
                    "w-full rounded-full px-4 py-3.5 text-center text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary text-white"
                      : "bg-[#F2F1F3] text-[#1C1E24]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setOpenField(null)}
            className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 text-sm font-semibold text-white"
          >
            Готово
          </button>
        </Modal>
      ))}

      <Modal isOpen={isInterestsOpen} onClose={() => setIsInterestsOpen(false)}>
        <h2 className="text-lg font-bold">
          У тебя уже {interests.length} {interestsWord(interests.length)}!
        </h2>

        <div className="mt-4 flex flex-wrap gap-2 pb-4">
          {INTERESTS.map((item) => (
            <Pill
              key={item}
              variant="outline"
              selected={interests.includes(item)}
              onClick={() => toggleInterest(item)}
            >
              {item}
            </Pill>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-5 -mb-5 bg-linear-to-t from-white via-white to-transparent px-5 pt-6 pb-5">
          <button
            type="button"
            onClick={() => setIsInterestsOpen(false)}
            className="w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
          >
            Готово
          </button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
};
