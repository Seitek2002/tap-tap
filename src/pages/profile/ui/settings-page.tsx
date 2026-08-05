import { type ReactNode, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { Check, ChevronRight } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import { deleteAccount, logout } from "@/entities/session";
import {
  useFiltersQuery,
  useProfileQuery,
  useUpdateFiltersMutation,
  useUpdateProfileMutation,
} from "@/entities/user";

import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { Skeleton } from "@/shared/ui/skeleton";
import { RangeSlider, Slider } from "@/shared/ui/slider";
import { Spinner } from "@/shared/ui/spinner";
import { Toggle } from "@/shared/ui/toggle";

import {
  APP_VERSION,
  AUDIENCE_TO_SHOW_TO,
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
  SHOW_TO_TO_AUDIENCE,
} from "../model/settings";
import { PremiumFeatureIcon } from "./premium-feature-icon";

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 text-base font-bold">{children}</h2>
);

// Без onClick строка чисто информационная (например, номер телефона —
// в проде он приходит из хост-приложения и не редактируется) — рендерим её
// как div без courserа "клика" и шеврона, чтобы не обещать действие, которого
// нет.
const SettingsRow = ({
  icon,
  label,
  onClick,
  value,
  variant = "standalone",
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  value?: string;
  variant?: "bare" | "grouped" | "standalone";
}) => {
  const className = cn(
    "flex w-full items-center justify-between text-left",
    variant !== "bare" && "px-4 py-4",
    variant === "standalone" && "rounded-2xl border border-[#E4E7EC] bg-white",
  );
  const content = (
    <>
      <span className="flex items-center gap-2.5 text-sm leading-[120%] font-normal text-[#1C1E24]">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-1 text-sm leading-[120%] font-normal text-[#1C1E24]">
        {value}
        {onClick && <ChevronRight className="size-4 shrink-0" />}
      </span>
    </>
  );

  if (!onClick) return <div className={className}>{content}</div>;

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const filtersQuery = useFiltersQuery(!isMockMode());
  const updateFiltersMutation = useUpdateFiltersMutation();
  const profileQuery = useProfileQuery(!isMockMode());
  const updateProfileMutation = useUpdateProfileMutation();

  const [ageRange, setAgeRange] = useState(DEFAULT_AGE_RANGE);
  const [distance, setDistance] = useState(DEFAULT_DISTANCE_KM);

  const [showTo, setShowTo] = useState(DEFAULT_SHOW_TO);
  const [isShowToOpen, setIsShowToOpen] = useState(false);

  const [seeking, setSeeking] = useState<string>(DEFAULT_SEEKING);
  const [isSeekingOpen, setIsSeekingOpen] = useState(false);

  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [isInvisibleModeOpen, setIsInvisibleModeOpen] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Реальный режим: "Рекомендации" и "Невидимка" — это сохранённые /api/filters
  // и /api/profile, заливаем их в локальный черновик один раз, как только оба
  // ответа пришли.
  const hasHydratedSettings = useRef(isMockMode());
  useEffect(() => {
    if (
      hasHydratedSettings.current ||
      !filtersQuery.data ||
      !profileQuery.data
    ) {
      return;
    }
    hasHydratedSettings.current = true;
    const prefs = filtersQuery.data;
    setAgeRange([prefs.ageMin, prefs.ageMax]);
    setDistance(prefs.maxDistance);
    setShowTo(AUDIENCE_TO_SHOW_TO[prefs.audience] ?? DEFAULT_SHOW_TO);
    setSeeking(
      SEEKING_OPTIONS.find((option) => option.code === prefs.seeking)?.label ??
        DEFAULT_SEEKING,
    );
    setHideStatus(profileQuery.data.hide_online_status === 1);
    setHideActivity(profileQuery.data.hide_last_seen === 1);
  }, [filtersQuery.data, profileQuery.data]);

  // Бэкенда нет (mock-режим) — имитируем сетевой раунд-трип: галочка на
  // кнопке "Готово" на мгновение сменяется спиннером, и только потом
  // всплывает тост.
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    if (isMockMode()) {
      setTimeout(() => {
        toast.success("Изменения сохранены");
        navigate(-1);
      }, 500);
      return;
    }
    const current = filtersQuery.data;
    if (!current) {
      setIsSaving(false);
      return;
    }
    try {
      await updateFiltersMutation.mutateAsync({
        ...current,
        ageMax: ageRange[1],
        ageMin: ageRange[0],
        audience: SHOW_TO_TO_AUDIENCE[showTo] ?? "all",
        maxDistance: distance,
        seeking:
          SEEKING_OPTIONS.find((option) => option.label === seeking)?.code ??
          "",
      });
      toast.success("Изменения сохранены");
      navigate(-1);
    } catch {
      toast.error("Не получилось сохранить");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmInvisibleMode = async () => {
    setIsInvisibleModeOpen(false);
    if (isMockMode()) return;
    try {
      await updateProfileMutation.mutateAsync({
        hide_last_seen: hideActivity ? 1 : 0,
        hide_online_status: hideStatus ? 1 : 0,
      });
    } catch {
      toast.error("Не получилось сохранить");
    }
  };

  const handlePremiumClick = () => {
    navigate(ROUTES.wallet);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch {
      toast.error("Не получилось удалить аккаунт");
      setIsDeletingAccount(false);
    }
  };

  const displayName = isMockMode()
    ? SETTINGS_ACCOUNT.name
    : (profileQuery.data?.name ?? "");
  const displayPhone = isMockMode()
    ? SETTINGS_ACCOUNT.phone
    : (profileQuery.data?.phone ?? "");

  if (!isMockMode() && (filtersQuery.isLoading || profileQuery.isLoading)) {
    return (
      <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
        <div className="flex-1 overflow-y-auto pb-4">
          <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
            <h1 className="text-2xl font-extrabold">Настройки</h1>
            <Skeleton className="size-9 rounded-full" />
          </header>
          <Skeleton className="mx-4 h-20 rounded-3xl" />
          <Skeleton className="mx-4 mt-5 h-20 rounded-3xl" />
          <Skeleton className="mx-4 mt-5 h-56 rounded-3xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <h1 className="text-2xl font-extrabold">Настройки</h1>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            aria-label="Готово"
            className="flex size-9 items-center justify-center rounded-full border border-[#E4E7EC] disabled:opacity-60"
          >
            {isSaving ? (
              <Spinner className="size-5" />
            ) : (
              <Check className="size-5" />
            )}
          </button>
        </header>

        <button
          type="button"
          onClick={handlePremiumClick}
          className="mx-4 flex items-center gap-4 rounded-3xl p-4 text-left text-white"
          style={{
            background: "linear-gradient(135deg, #9B6FF0 0%, #7C3AED 100%)",
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
          <div className="divide-y divide-[#E4E7EC] rounded-3xl border-[0.5px] border-[#E4E7EC] bg-white shadow-[0_2px_12px_0_rgba(127,127,127,0.12)]">
            <SettingsRow
              variant="grouped"
              label="Номер телефона"
              value={displayPhone}
            />
            <SettingsRow
              variant="grouped"
              label="Твое имя"
              value={displayName}
            />
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Рекомендации</SectionTitle>
          <div className="flex flex-col gap-4 rounded-3xl border-[0.5px] border-[#E4E7EC] bg-white p-4 shadow-[0_2px_12px_0_rgba(127,127,127,0.12)]">
            <SettingsRow
              variant="bare"
              label="Показывать тебе"
              onClick={() => setIsShowToOpen(true)}
              value={showTo}
            />
            <SettingsRow
              variant="bare"
              label="Ты ищешь"
              onClick={() => setIsSeekingOpen(true)}
              value={seeking}
            />

            <div>
              <h3 className="text-sm font-bold">Возраст</h3>
              <RangeSlider
                className="mt-3 rounded-none border-0 px-0 py-0"
                min={18}
                max={60}
                value={ageRange}
                onChange={setAgeRange}
              />
            </div>

            <div>
              <h3 className="text-sm font-bold">Расстояние от тебя</h3>
              <div className="mt-3 flex items-center gap-3">
                <Slider
                  className="flex-1"
                  min={1}
                  max={150}
                  value={distance}
                  onChange={setDistance}
                />
                <span className="shrink-0 text-sm leading-[120%] font-normal text-[#1C1E24]">
                  {distance} км
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Premium возможности</SectionTitle>
          <div
            className="rounded-3xl p-[0.5px]"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #F4B740 100%)",
            }}
          >
            <div className="flex flex-col divide-y divide-[#E4E7EC] rounded-3xl bg-white p-4 shadow-[0_2px_12px_0_rgba(127,127,127,0.12)] [&>button]:py-1.25">
              {PREMIUM_SETTINGS_FEATURES.map((feature) => (
                <SettingsRow
                  key={feature.key}
                  variant="bare"
                  icon={
                    <PremiumFeatureIcon className="h-4.5 w-6.75 shrink-0" />
                  }
                  label={feature.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 px-4">
          <SectionTitle>Системные настройки</SectionTitle>
          <div className="divide-y divide-[#E4E7EC] rounded-3xl border-[0.5px] border-[#E4E7EC] bg-white shadow-[0_2px_12px_0_rgba(127,127,127,0.12)]">
            <SettingsRow
              variant="grouped"
              label="Уведомления"
              onClick={() => navigate(ROUTES.profileNotifications)}
            />
            <SettingsRow
              variant="grouped"
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
          <div className="divide-y divide-[#E4E7EC] rounded-3xl border-[0.5px] border-[#E4E7EC] bg-white shadow-[0_2px_12px_0_rgba(127,127,127,0.12)]">
            <SettingsRow
              variant="grouped"
              label="Помощь и поддержка"
              onClick={() => navigate(ROUTES.profileSupport)}
            />
            <SettingsRow
              variant="grouped"
              label="Правила сообщества"
              onClick={() => navigate(ROUTES.profileGuidelines)}
            />
            <SettingsRow
              variant="grouped"
              label="Политика конфиденциальности"
              onClick={() => navigate(ROUTES.profilePrivacy)}
            />
            <SettingsRow
              variant="grouped"
              label="О приложении"
              onClick={() => navigate(ROUTES.profileAbout)}
            />
          </div>
        </div>

        <div className="mt-5 divide-y divide-[#E4E7EC] overflow-hidden rounded-3xl border-[0.5px] border-[#E4E7EC] bg-white text-center mx-4 shadow-[0_2px_12px_0_rgba(127,127,127,0.12)]">
          <button
            type="button"
            data-haptic="heavy"
            onClick={() => void handleLogout()}
            className="w-full py-4 font-medium text-red-500"
          >
            Выйти
          </button>
          <button
            type="button"
            data-haptic="heavy"
            onClick={() => setIsDeleteAccountOpen(true)}
            className="w-full py-4 font-medium text-[#1C1E24]"
          >
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
          onClick={() => void confirmInvisibleMode()}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Готово
        </button>
      </Modal>

      <Modal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">Удалить аккаунт?</h2>
          <p className="text-sm text-[#6B7280]">
            Это действие необратимо: анкета, переписки и пары будут удалены
            безвозвратно
          </p>
        </div>
        <button
          type="button"
          data-haptic="heavy"
          disabled={isDeletingAccount}
          onClick={() => void handleDeleteAccount()}
          className="mt-6 w-full rounded-full bg-red-500 py-4 font-bold text-white disabled:opacity-60"
        >
          {isDeletingAccount ? "Удаляем..." : "Да, удалить"}
        </button>
        <button
          type="button"
          disabled={isDeletingAccount}
          onClick={() => setIsDeleteAccountOpen(false)}
          className="mt-4 w-full text-center text-sm font-semibold text-[#6B7280]"
        >
          Отмена
        </button>
      </Modal>

      <BottomNav />
    </div>
  );
};
