import { animate, useMotionValue } from "motion/react";

// Пружинистая «bouncy» анимация масштаба по клику (лайк-сердечко и т.п.):
// вызывающий сам решает, когда её проигрывать (обычно вместе с тогглом стейта).
export const useBounce = () => {
  const scale = useMotionValue(1);

  const bounce = () => {
    animate(scale, [1, 1.35, 0.9, 1.1, 1], {
      duration: 0.5,
      ease: "easeInOut",
    });
  };

  return { bounce, scale };
};
