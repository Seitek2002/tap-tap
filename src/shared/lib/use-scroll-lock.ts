import { useEffect } from "react";

/** Фиксирует прокрутку body, пока active === true (для модалок/шитов). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo({ behavior: "instant", top: scrollY });
    };
  }, [active]);
}
