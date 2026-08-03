import { useState } from "react";
import toast, { type Toast } from "react-hot-toast";

import { type PanInfo, animate, motion, useMotionValue } from "motion/react";

import personEmir from "@/shared/assets/images/person-emir.png";

import type { Profile } from "../model/profiles";

// Свайп в любую сторону дальше этого порога (px) или достаточно резко —
// закрывает тост, не дожидаясь автоскрытия по таймеру.
const SWIPE_DISMISS_THRESHOLD = 80;
const SWIPE_DISMISS_VELOCITY = 500;

export const MatchToastCard = ({
  profile,
  t,
}: {
  profile: Profile;
  t: Toast;
}) => {
  const x = useMotionValue(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [flyDirection, setFlyDirection] = useState(1);

  const handleDragEnd = (
    _event: MouseEvent | PointerEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const shouldDismiss =
      Math.abs(info.offset.x) > SWIPE_DISMISS_THRESHOLD ||
      Math.abs(info.velocity.x) > SWIPE_DISMISS_VELOCITY;

    if (shouldDismiss) {
      setFlyDirection(info.offset.x >= 0 ? 1 : -1);
      setIsDismissed(true);
      toast.dismiss(t.id);
    } else {
      animate(x, 0, { damping: 30, stiffness: 400, type: "spring" });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{
        background: "linear-gradient(90deg, #7C3AED 0%, #F4B740 100%)",
        x,
      }}
      className="flex w-[calc(100vw-2rem)] max-w-85.75 items-center gap-2.5 rounded-full p-4 shadow-[0_2px_12px_rgba(127,127,127,0.12)]"
      initial={{ opacity: 0, scale: 0.9, y: -30 }}
      animate={
        isDismissed
          ? { opacity: 0, x: flyDirection * 400 }
          : {
              opacity: t.visible ? 1 : 0,
              scale: t.visible ? 1 : 0.9,
              y: t.visible ? 0 : -30,
            }
      }
      transition={{ damping: 22, stiffness: 300, type: "spring" }}
    >
      <div className="flex shrink-0 items-center">
        <img
          src={personEmir}
          alt=""
          className="size-9 rounded-full border-2 border-white object-cover"
        />
        <img
          src={profile.photos[0]}
          alt=""
          className="-ml-3 size-9 rounded-full border-2 border-white object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-white">У вас новая пара!</p>
        <p className="text-xs text-white/90">{profile.name} тоже лайкнул вас</p>
      </div>
    </motion.div>
  );
};
