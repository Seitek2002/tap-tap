import { motion } from "motion/react";
import toast from "react-hot-toast";

import personEmir from "@/shared/assets/images/person-emir.png";

import type { Profile } from "../model/profiles";

const TOAST_DURATION = 4000;

/** Показывает тост «У вас новая пара!» — вызывается при взаимном лайке. */
export const showNewMatchToast = (profile: Profile) => {
  toast.custom(
    (t) => (
      <motion.div
        className="flex w-[calc(100vw-2rem)] max-w-[343px] items-center gap-2.5 rounded-full p-4 shadow-[0_2px_12px_rgba(127,127,127,0.12)]"
        style={{
          background: "linear-gradient(90deg, #7C3AED 0%, #F4B740 100%)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: -30 }}
        animate={{
          opacity: t.visible ? 1 : 0,
          scale: t.visible ? 1 : 0.9,
          y: t.visible ? 0 : -30,
        }}
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
          <p className="text-xs text-white/90">
            {profile.name} тоже лайкнул вас
          </p>
        </div>
      </motion.div>
    ),
    { duration: TOAST_DURATION, position: "top-center" },
  );
};
