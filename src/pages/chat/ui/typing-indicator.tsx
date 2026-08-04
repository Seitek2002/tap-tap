import { motion } from "motion/react";

import { cn } from "@/shared/lib/utils";

const DOTS = [0, 1, 2];

/** Три точки, поочерёдно подпрыгивающие — статус "печатает" в шапке чата. */
export const TypingIndicator = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-0.5", className)}>
    {DOTS.map((index) => (
      <motion.span
        key={index}
        className="size-1 rounded-full bg-current"
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
