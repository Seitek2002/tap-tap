import { useState } from "react";
import { Navigate, useLocation, useOutlet } from "react-router";

import { AnimatePresence, motion } from "motion/react";

import { useSessionStore } from "@/entities/session";

import { ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";

// "/" — это WelcomePage (см. router.tsx), ROUTES.welcome сейчас нигде не
// смонтирован. Обе страницы не требуют токена, все остальные — требуют.
const PUBLIC_PATHS = new Set<string>(["/", ROUTES.auth]);

// <Outlet/> сам по себе всегда синхронен с текущим location — при смене
// маршрута он мгновенно переключается на новый элемент, и «заморозить»
// старую страницу на время exit-анимации им не получится. Поэтому кэшируем
// полученный элемент через useState-инициализатор (срабатывает только при
// монтировании) — эта копия хранит именно ту страницу, что была на экране
// в момент начала перехода.
const FrozenOutlet = () => {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
};

// Нативный «push»-переход: новая страница въезжает справа, старая — слегка
// уезжает влево (параллакс), как в iOS/Android. Без учёта направления
// (вперёд/назад) — не полностью аутентично для возврата, но ощутимо ближе
// к нативному, чем мгновенная подмена.
export const PageTransition = () => {
  const location = useLocation();
  const token = useSessionStore((state) => state.token);

  // Проверка сессии: есть токен → нечего делать на welcome/auth, в ленту;
  // нет токена → нечего делать нигде, кроме welcome/auth. В mock-режиме
  // бэка нет вообще — сессии неоткуда взяться, гейт просто выключен.
  const isPublicPath = PUBLIC_PATHS.has(location.pathname);
  if (!isMockMode()) {
    if (!token && !isPublicPath) return <Navigate to="/" replace />;
    if (token && isPublicPath) return <Navigate to={ROUTES.feed} replace />;
  }

  return (
    <div className="relative h-dvh overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={location.pathname}
          className="absolute inset-0"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-30%" }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        >
          <FrozenOutlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
