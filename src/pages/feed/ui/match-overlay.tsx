import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";

import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import matchBadge from "@/shared/assets/icons/match-badge.svg";
import matchHeartBg from "@/shared/assets/images/match-heart-bg.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

import type { Profile } from "../model/profiles";

type MatchOverlayProps = {
  onClose: () => void;
  profile: null | Profile;
};

const SUGGESTIONS = ["Сходим на ужин?", "Мне нравятся твои фотки"];

export const MatchOverlay = ({ onClose, profile }: MatchOverlayProps) => {
  const mounted = useMounted();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [prevProfileId, setPrevProfileId] = useState<null | number>(
    profile?.id ?? null,
  );
  useScrollLock(!!profile);

  // Сброс поля сообщения при смене профиля — подстройка state под проп
  // прямо в рендере (не в useEffect, синхронный setState там под запретом).
  const profileId = profile?.id ?? null;
  if (profileId !== prevProfileId) {
    setPrevProfileId(profileId);
    setMessage("");
  }

  // Отправка (кнопкой или готовым вариантом первого сообщения) сразу
  // переносит в чат с этим человеком — не просто закрывает оверлей.
  const goToChat = () => {
    if (!profile) return;
    onClose();
    navigate(`/chat/${profile.id}`);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    goToChat();
  };

  const handleSuggestionClick = (text: string) => {
    setMessage(text);
    goToChat();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (profile) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profile, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {profile && (
        <motion.div
          className="fixed inset-0 z-100 flex flex-col items-center overflow-hidden px-3 pt-16 pb-10"
          style={{
            background:
              "linear-gradient(180deg, #4C1D95 0%, #A855F7 45%, #F5A623 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <img
            src={matchHeartBg}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />

          {/* Две фото-карточки внахлёст + бейдж на стыке */}
          <div className="relative mt-6 flex items-center justify-center">
            <motion.div
              className="h-44 w-36 -rotate-[8deg] overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl"
              initial={{ opacity: 0, rotate: 0, scale: 0.6, x: 20 }}
              animate={{ opacity: 1, rotate: -8, scale: 1, x: 0 }}
              transition={{ damping: 16, stiffness: 260, type: "spring" }}
            >
              <img
                src={profile.photos[0]}
                alt=""
                className="size-full object-cover"
              />
            </motion.div>
            <motion.div
              className="-ml-8 h-44 w-36 rotate-[8deg] overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl"
              initial={{ opacity: 0, rotate: 0, scale: 0.6, x: -20 }}
              animate={{ opacity: 1, rotate: 8, scale: 1, x: 0 }}
              transition={{
                damping: 16,
                delay: 0.08,
                stiffness: 260,
                type: "spring",
              }}
            >
              <img src={personEmir} alt="" className="size-full object-cover" />
            </motion.div>

            <motion.img
              src={matchBadge}
              alt=""
              className="absolute bottom-2 left-1/2 size-14 -translate-x-1/2"
              initial={{ opacity: 0, rotate: -30, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{
                damping: 12,
                delay: 0.35,
                stiffness: 320,
                type: "spring",
              }}
            />
          </div>

          <motion.div
            className="relative mt-10 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white">Это взаимно!</h1>
            <p className="mt-2 text-base text-white/90">
              💖 Ты и {profile.name} нравитесь друг другу. Напиши ей, не упусти
              свою искру!
            </p>
          </motion.div>

          <motion.div
            className="relative mt-10 w-full flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pr-1.5 pl-5">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напиши сообщение"
                className="min-w-0 flex-1 text-sm text-[#1C1E24] outline-none placeholder:text-[#6B7280]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim()}
                aria-label="Отправить"
                className="flex px-6 py-2.5 h-full shrink-0 items-center justify-center rounded-full bg-[#1C1E24] text-white disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleSuggestionClick(text)}
                  className="flex shrink-0 items-center gap-2.5 rounded-full border-[#E4E7EC] border bg-white/90 p-2 text-sm font-medium whitespace-nowrap text-[#1C1E24]"
                >
                  <Send className="size-3.5" />
                  {text}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="relative mt-8 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              damping: 16,
              delay: 0.7,
              stiffness: 300,
              type: "spring",
            }}
          >
            <X className="size-6" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
