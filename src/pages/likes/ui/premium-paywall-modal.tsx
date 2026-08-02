import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import personDastan from "@/shared/assets/images/person-dastan.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import personNight from "@/shared/assets/images/person-night.png";
import personSeitek from "@/shared/assets/images/person-seitek.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";
import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";
import { cn } from "@/shared/lib/utils";

import { LockHeartIcon } from "./lock-heart-icon";

type PremiumPaywallModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Ровно 5 карточек веера — по одному фото на карточку, центр (index 2) резкий.
const FAN = [
  { photo: personZalkar, rotate: -16 },
  { photo: personNight, rotate: -8 },
  { photo: personEmir, rotate: 0 },
  { photo: personDastan, rotate: 8 },
  { photo: personSeitek, rotate: 16 },
];

const CENTER_INDEX = 2;
// Шаг между соседними картами веера (под w-24 карту с -mx-3 нахлёстом).
const FAN_STEP = 72;

export const PremiumPaywallModal = ({
  isOpen,
  onClose,
}: PremiumPaywallModalProps) => {
  const mounted = useMounted();
  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Карточка выезжает снизу с лёгким пружинным "поп"-эффектом */}
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl pt-9 pb-6 shadow-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, #3D1671 0%, #150A2E 55%, #0B0417 100%)",
            }}
            initial={{ opacity: 0, scale: 0.75, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ damping: 22, stiffness: 300, type: "spring" }}
          >
            {/* Веер карточек: боковые лежат позади центральной и выезжают
                из-под неё в стороны, а не влетают отдельно с нуля. */}
            <div className="relative flex h-44 items-center justify-center">
              {FAN.map((card, index) => {
                const isCenter = index === CENTER_INDEX;
                const offset = (index - CENTER_INDEX) * FAN_STEP;
                return (
                  <motion.div
                    key={index}
                    className={cn(
                      "relative -mx-3 h-32 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10",
                      !isCenter && "brightness-75",
                    )}
                    style={{ zIndex: 10 - Math.abs(index - CENTER_INDEX) }}
                    initial={{ opacity: 0, rotate: 0, scale: 0.85, x: -offset, y: 0 }}
                    animate={{
                      opacity: 1,
                      rotate: card.rotate,
                      scale: isCenter ? 1.08 : 0.94,
                      x: 0,
                      y: isCenter ? -6 : 6,
                    }}
                    transition={{
                      damping: 20,
                      delay: isCenter ? 0.05 : 0.25 + Math.abs(index - CENTER_INDEX) * 0.08,
                      stiffness: 240,
                      type: "spring",
                    }}
                  >
                    <img
                      src={card.photo}
                      alt=""
                      className={cn(
                        "size-full object-cover",
                        !isCenter && "blur-[3px]",
                      )}
                    />
                  </motion.div>
                );
              })}

              {/* Замок поверх веера — влетает последним, дужка открывается и закрывается */}
              <motion.div
                className="absolute bottom-0 z-20 flex size-14 items-center justify-center rounded-full shadow-[0_0_25.8px_rgba(255,255,255,0.62)] backdrop-blur-[71.8px]"
                style={{ background: "#18033EB2" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ damping: 14, delay: 0.5, stiffness: 400, type: "spring" }}
              >
                <LockHeartIcon className="size-11" />
              </motion.div>
            </div>

            <motion.div
              className="mt-5 px-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <p className="text-xl font-bold text-white">Смотри всех,</p>
              <p className="text-xl font-bold text-[#F472B6]">
                кому ты нравишься
              </p>
            </motion.div>

            <motion.div
              className="mt-5 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <div className="overflow-hidden rounded-[20px]">
                <div
                  className="flex h-24.25 items-center justify-center gap-3 border-t border-[#CF6AB7]/64 px-4 pt-2.5 pb-9.75 -mb-10"
                  style={{
                    background: "linear-gradient(180deg, #3D084B 0%, #0A0620 100%)",
                  }}
                >
                  <span className="text-sm text-white/50 line-through">
                    50 сом
                  </span>
                  <span className="text-2xl font-bold text-white">9</span>
                  <span className="text-sm text-white/70">сом / день</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="relative rounded-full w-full bg-[#F5A623] py-4 text-sm font-bold text-[#1C1E24] transition-transform active:scale-[0.99]"
                >
                  Смотреть
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
