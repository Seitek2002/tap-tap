import toast, { type Toast } from "react-hot-toast";

import { motion } from "motion/react";

import type { NewMatchEvent } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";

export const MatchNotificationToast = ({
  onClick,
  partner,
  t,
}: {
  onClick: () => void;
  partner: NewMatchEvent["partner"];
  t: Toast;
}) => (
  <motion.button
    type="button"
    onClick={() => {
      toast.dismiss(t.id);
      onClick();
    }}
    style={{ background: "linear-gradient(90deg, #7C3AED 0%, #F4B740 100%)" }}
    className="flex w-[calc(100vw-2rem)] max-w-85.75 items-center gap-2.5 rounded-full p-4 text-left shadow-[0_2px_12px_rgba(127,127,127,0.12)]"
    initial={{ opacity: 0, scale: 0.9, y: -30 }}
    animate={{
      opacity: t.visible ? 1 : 0,
      scale: t.visible ? 1 : 0.9,
      y: t.visible ? 0 : -30,
    }}
    transition={{ damping: 22, stiffness: 300, type: "spring" }}
  >
    <img
      src={partner.photo ? resolveUploadUrl(partner.photo) : person1}
      alt=""
      className="size-9 shrink-0 rounded-full border-2 border-white object-cover"
    />
    <div className="min-w-0">
      <p className="text-sm font-bold text-white">У вас новая пара!</p>
      <p className="truncate text-xs text-white/90">
        {partner.name} тоже лайкнул(а) вас — напишите первыми
      </p>
    </div>
  </motion.button>
);
