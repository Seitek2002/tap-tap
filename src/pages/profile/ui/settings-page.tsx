import {
  Car,
  Check,
  ChevronRight,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { RangeSlider, Slider } from "@/shared/ui/slider";
import { Toggle } from "@/shared/ui/toggle";

import {
  APP_VERSION,
  DEFAULT_AGE_RANGE,
  DEFAULT_DISTANCE_KM,
  DEFAULT_LANGUAGE,
  DEFAULT_SEEKING,
  DEFAULT_SHOW_TO,
  LANGUAGE_OPTIONS,
  PREMIUM_SETTINGS_FEATURES,
  SEEKING_OPTIONS,
  SETTINGS_ACCOUNT,
  SHOW_TO_OPTIONS,
} from "../model/settings";

import { BottomNav } from "@/widgets/bottom-nav";

const PREMIUM_FEATURE_ICONS: Record<string, LucideIcon> = {
  car: Car,
  credit: CreditCard,
};

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 text-base font-bold">{children}</h2>
);

const SettingsRow = ({
  icon,
  label,
  onClick,
  premium,
  value,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  premium?: boolean;
  value?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-4 text-left",
      premium ? "border-[#F5A623]/50" : "border-[#E4E7EC]",
    )}
  >
    <span className="flex items-center gap-2.5 font-medium">
      {icon}
      {label}
    </span>
    <span className="flex items-center gap-1 text-[#6B7280]">
      {value}
      <ChevronRight className="size-4 shrink-0" />
    </span>
  </button>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [ageRange, setAgeRange] = useState(DEFAULT_AGE_RANGE);
  const [distance, setDistance] = useState(DEFAULT_DISTANCE_KM);

  const [showTo, setShowTo] = useState(DEFAULT_SHOW_TO);
  const [isShowToOpen, setIsShowToOpen] = useState(false);

  const [seeking, setSeeking] = useState(DEFAULT_SEEKING);
  const [isSeekingOpen, setIsSeekingOpen] = useState(false);

  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [isInvisibleModeOpen, setIsInvisibleModeOpen] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-2xl font-extrabold">Настройки</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Готово"
            className="flex size-9 items-center justify-center rounded-full border border-[#E4E7EC]"
          >
            <Check className="size-5" />
          </button>
        </header>

        <button
          type="button"
          className="mx-4 flex items-center gap-3 rounded-2xl p-4 text-left text-white"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
          }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-extrabold italic">
                TAPTAP PREMIUM
              </span>
              <span className="shrink-0 text-sm font-bold whitespace-nowrap">
                Всего 9 сом
              </span>
            </div>
            <p className="mt-1 text-xs text-white/80">
              Выделись среди многих с помощью возможностей с TapTap Premium
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0" />
        </button>

        <div className="mt-5 px-4">
          <SectionTitle>Аккаунт</SectionTitle>
          <div className="flex flex-col gap-3">
            <SettingsRow
              label="Номер телефона"
              value={SETTINGS_ACCOUNT.phone}
            />
            <SettingsRow label="Твое имя" value={SETTINGS_ACCOUNT.name} />
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Рекомендации</SectionTitle>
          <div className="flex flex-col gap-3">
            <SettingsRow
              label="Показывать тебе"
              onClick={() => setIsShowToOpen(true)}
              value={showTo}
            />
            <SettingsRow
              label="Ты ищешь"
              onClick={() => setIsSeekingOpen(true)}
              value={seeking}
            />

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4">
              <h3 className="text-sm font-bold">Возраст</h3>
              <RangeSlider
                className="mt-3 rounded-none border-0 px-0 py-0"
                min={18}
                max={60}
                value={ageRange}
                onChange={setAgeRange}
              />
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4">
              <h3 className="text-sm font-bold">Расстояние от тебя</h3>
              <div className="mt-3 flex items-center gap-3">
                <Slider
                  className="flex-1"
                  min={1}
                  max={150}
                  value={distance}
                  onChange={setDistance}
                />
                <span className="shrink-0 text-sm text-[#6B7280]">
                  {distance} км
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Premium возможности</SectionTitle>
          <div className="flex flex-col gap-3">
            {PREMIUM_SETTINGS_FEATURES.map((feature) => {
              const Icon = PREMIUM_FEATURE_ICONS[feature.key];
              return (
                <SettingsRow
                  key={feature.key}
                  premium
                  icon={
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#FDF1DC] text-[#B7791F]">
                      <Icon className="size-4" />
                    </span>
                  }
                  label={feature.label}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Системные настройки</SectionTitle>
          <div className="flex flex-col gap-3">
            <SettingsRow
              label="Уведомления"
              onClick={() => navigate(ROUTES.profileNotifications)}
            />
            <SettingsRow
              label="Язык"
              onClick={() => setIsLanguageOpen(true)}
              value={language}
            />
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Твои знакомые</SectionTitle>
          <SettingsRow
            label="Скрыться от знакомых"
            onClick={() => navigate(ROUTES.profileHideFromContacts)}
          />
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Невидимка</SectionTitle>
          <SettingsRow
            label="Параметры активности"
            onClick={() => setIsInvisibleModeOpen(true)}
          />
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>О нас</SectionTitle>
          <div className="flex flex-col gap-3">
            <SettingsRow label="Помощь и поддержка" />
            <SettingsRow label="Правила сообщества" />
            <SettingsRow label="Политика конфиденциальности" />
            <SettingsRow label="О приложении" />
          </div>
        </div>

        <div className="mt-5 divide-y divide-[#E4E7EC] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white text-center mx-4">
          <button type="button" className="w-full py-4 font-medium text-red-500">
            Выйти
          </button>
          <button type="button" className="w-full py-4 font-medium text-[#1C1E24]">
            Удалить аккаунт
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-extrabold">
            <span className="text-[#1C1E24]">Tap</span>
            <span className="text-primary">Tap</span>
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">{APP_VERSION}</p>
        </div>
      </div>

      <Modal isOpen={isShowToOpen} onClose={() => setIsShowToOpen(false)}>
        <h2 className="text-center text-lg font-bold">Показывать тебе</h2>

        <div className="mt-4 space-y-2">
          {SHOW_TO_OPTIONS.map((option) => {
            const selected = showTo === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setShowTo(option);
                  setIsShowToOpen(false);
                }}
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
      </Modal>

      <Modal isOpen={isSeekingOpen} onClose={() => setIsSeekingOpen(false)}>
        <h2 className="text-center text-lg font-bold">Ты ищешь</h2>

        <div className="mt-4 space-y-2">
          {SEEKING_OPTIONS.map((option) => {
            const selected = seeking === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setSeeking(option.label);
                  setIsSeekingOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-full px-4 py-3.5 text-sm font-medium transition-colors",
                  selected
                    ? "bg-primary text-white"
                    : "bg-[#F2F1F3] text-[#1C1E24]",
                )}
              >
                <span className="text-lg">{option.emoji}</span>
                {option.label}
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)}>
        <h2 className="text-center text-lg font-bold">Язык</h2>

        <div className="mt-4 space-y-2">
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = language === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setLanguage(option);
                  setIsLanguageOpen(false);
                }}
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
      </Modal>

      <Modal
        isOpen={isInvisibleModeOpen}
        onClose={() => setIsInvisibleModeOpen(false)}
      >
        <h2 className="text-center text-lg font-bold">Режим невидимки</h2>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Скрыть статус</span>
            <Toggle
              checked={hideStatus}
              onChange={(event) => setHideStatus(event.target.checked)}
            />
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            Скрыть от пользователей, что ты в сети
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Скрыть недавнюю активность</span>
            <Toggle
              checked={hideActivity}
              onChange={(event) => setHideActivity(event.target.checked)}
            />
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            Скрыть от пользователей время последнего посещения, если ты не в
            сети
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInvisibleModeOpen(false)}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <BottomNav />
    </div>
  );
};
