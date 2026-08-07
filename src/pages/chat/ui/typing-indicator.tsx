import { motion } from "motion/react";

import { cn } from "@/shared/lib/utils";

const DOTS = [0, 1, 2];

/** Три точки, поочерёдно подпрыгивающие — статус "печатает", что в шапке
 * чата (мелкие, size-1), что в облаке сообщения (крупнее, см. dotClassName
 * у chat-room-page.tsx). */
export const TypingIndicator = ({
  className,
  dotClassName = "size-1",
}: {
  className?: string;
  dotClassName?: string;
}) => (
  <span className={cn("inline-flex items-center gap-1", className)}>
    {DOTS.map((index) => (
      <motion.span
        key={index}
        className={cn("rounded-full bg-current", dotClassName)}
        animate={{ y: [0, -3, 0] }}
        transition={{
          delay: index * 0.15,
          duration: 0.6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    ))}
  </span>
);
