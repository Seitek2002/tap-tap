import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

type LikeLimitOverlayProps = {
  isOpen: boolean;
  onRemoveLimit: () => void;
  onWait: () => void;
};

const RESET_SECONDS = 24 * 60 * 60 - 1; // ~24 часа до сброса лайков

const pad = (value: number) => String(value).padStart(2, "0");

export const LikeLimitOverlay = ({
  isOpen,
  onRemoveLimit,
  onWait,
}: LikeLimitOverlayProps) => {
  const [seconds, setSeconds] = useState(RESET_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const time = `${pad(Math.floor(seconds / 3600))}:${pad(
    Math.floor((seconds % 3600) / 60),
  )}:${pad(seconds % 60)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-30 flex flex-col justify-between rounded-3xl bg-black/70 p-6 text-center text-white backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex flex-1 flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Лимит лайков исчерпан</h2>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Ты использовал все доступные лайки. Следующие появятся через:
            </p>
            <div className="mt-8 text-5xl font-bold tabular-nums">{time}</div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onRemoveLimit}
              className="w-full rounded-full bg-primary py-4 font-semibold text-white underline underline-offset-2 transition-transform active:scale-[0.99]"
            >
              Убрать лимит
            </button>
            <button
              type="button"
              onClick={onWait}
              className="w-full py-2 font-semibold text-white"
            >
              Я подожду
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
