import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";

import enableNotifications from "@/shared/assets/images/enable-notifications.png";
import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Toggle } from "@/shared/ui/toggle";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  EMAIL_NOTIFICATION_TOGGLES,
  NOTIFICATION_TOGGLES,
} from "../model/notifications";

const DEFAULT_EMAIL_PREFS = Object.fromEntries(
  EMAIL_NOTIFICATION_TOGGLES.map((item) => [item.key, false]),
);

// Центрированный алерт (не боттомщит) — как системный пермишен-диалог.
// Реального доступа к настройкам ОС нет, поэтому обе кнопки просто закрывают.
const EnableNotificationsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const mounted = useMounted();
  useScrollLock(isOpen);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-6"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ damping: 22, stiffness: 300, type: "spring" }}
          >
            <img
              src={enableNotifications}
              alt=""
              className="mx-auto h-20"
            />
            <h2 className="mt-4 text-lg font-bold">Включи уведомления</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Измени настройки устройства, чтобы получать от нас уведомления
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
            >
              Изменить настройки
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-sm font-semibold text-[#6B7280]"
            >
              Позже
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailPrefs, setEmailPrefs] = useState(DEFAULT_EMAIL_PREFS);

  const toggleEmailPref = (key: string) =>
    setEmailPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-extrabold">Уведомления</h1>
        </header>

        <div className="px-4">
          <h2 className="mb-2 text-sm font-bold text-[#6B7280]">
            Push-уведомления
          </h2>

          <div className="overflow-hidden rounded-2xl bg-white">
            <div className="divide-y divide-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setIsPromptOpen(true)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-sm text-[#6B7280]">Выключить все</span>
                <Toggle
                  checked={false}
                  onChange={() => {}}
                  className="pointer-events-none"
                />
              </button>

              {NOTIFICATION_TOGGLES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIsPromptOpen(true)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-sm">{item.label}</span>
                  <Toggle
                    checked
                    onChange={() => {}}
                    className="pointer-events-none"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEmailOpen(true)}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-[#E4E7EC] bg-white px-4 py-4 text-left"
          >
            <span className="font-medium">Адрес эл. почты</span>
            <ChevronRight className="size-4 shrink-0 text-[#6B7280]" />
          </button>
        </div>
      </div>

      <EnableNotificationsModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
      />

      <Modal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)}>
        <h2 className="text-center text-lg font-bold">Привяжи почту</h2>

        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Почта"
          type="email"
          className="mt-4"
        />

        <h3 className="mt-5 mb-2 text-sm font-bold text-[#6B7280]">
          Отправлять на почту
        </h3>

        <div className="divide-y divide-[#E4E7EC] overflow-hidden rounded-2xl bg-white">
          {EMAIL_NOTIFICATION_TOGGLES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleEmailPref(item.key)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm">{item.label}</span>
              <Toggle
                checked={emailPrefs[item.key]}
                onChange={() => toggleEmailPref(item.key)}
                className="pointer-events-none"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!email.trim()}
          onClick={() => setIsEmailOpen(false)}
          className="mt-5 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white disabled:bg-[#D1D5DB] disabled:text-white/70"
        >
          Готово
        </button>
      </Modal>

      <BottomNav />
    </div>
  );
};
