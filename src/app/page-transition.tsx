import { type ReactNode, useState } from "react";
import { Navigate, useLocation, useOutlet } from "react-router";

import { AnimatePresence, motion } from "motion/react";

import { MatchNotifications } from "@/widgets/match-notification";

import { useSessionStore } from "@/entities/session";
import { useMeQuery } from "@/entities/user";

import { ANKETA_STEPS, ROUTES } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";

// "/" — это WelcomePage (см. router.tsx), ROUTES.welcome сейчас нигде не
// смонтирован. Обе страницы не требуют токена, все остальные — требуют.
const PUBLIC_PATHS = new Set<string>(["/", ROUTES.auth]);

// Анкета + номер/OTP — сюда можно попасть с токеном на руках, но ещё не
// закончив регистрацию; гейт "анкета не пройдена" не должен уводить отсюда
// сам себя же (иначе бесконечный редирект на первый шаг). ROUTES.premium —
// с анкеты-11 есть прямая ссылка "Получить Premium" ("Хочешь указать, что у
// тебя есть машина?"); без исключения гейт уводил с неё обратно на anketa-1
// раньше, чем пользователь успевал нажать кнопку покупки.
const ANKETA_PATHS = new Set<string>([
  ...ANKETA_STEPS,
  ROUTES.numberVerification,
  ROUTES.premium,
]);

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
  const isPublicPath = PUBLIC_PATHS.has(location.pathname);
  const isAnketaPath = ANKETA_PATHS.has(location.pathname);
  const meQuery = useMeQuery(!isMockMode() && Boolean(token));
  const isOnboardingComplete = meQuery.data?.onboarding_completed === 1;

  // auth-page.tsx получает токен и тут же зовёт navigate() на
  // number-verification — но react-router оседает на новом location не
  // сразу, а спустя несколько рендеров (сколько именно — не гарантировано).
  // На этих промежуточных рендерах (token уже есть, pathname всё ещё
  // "/auth") гейт ниже принял бы это за "уже залогинен, но почему-то на
  // публичной странице" и увёл бы на /feed, затерев ещё не подхваченный
  // переход. Поэтому держим флаг с момента появления токена и до первого
  // рендера с непубличным pathname — то есть пока переход реально не осел.
  // (setState прямо в теле рендера — официальный паттерн подстройки state
  // под изменившийся проп/внешний стор, не побочный эффект.)
  const [prevToken, setPrevToken] = useState(token);
  const [awaitingPostAuthNavigation, setAwaitingPostAuthNavigation] =
    useState(false);
  if (prevToken !== token) {
    setPrevToken(token);
    if (prevToken === null && token !== null) {
      setAwaitingPostAuthNavigation(true);
    }
  } else if (awaitingPostAuthNavigation && !isPublicPath) {
    setAwaitingPostAuthNavigation(false);
  }

  // Проверка сессии: есть токен → нечего делать на welcome/auth, в ленту;
  // нет токена → нечего делать нигде, кроме welcome/auth. В mock-режиме
  // бэка нет вообще — сессии неоткуда взяться, гейт просто выключен.
  let content: ReactNode;
  if (!isMockMode() && !token && !isPublicPath) {
    content = <Navigate to="/" replace />;
  } else if (
    !isMockMode() &&
    token &&
    isPublicPath &&
    !awaitingPostAuthNavigation
  ) {
    // meQuery.data ещё не пришёл — isOnboardingComplete на этом рендере
    // ложно false (не "точно не пройдена", а "пока не знаем"). Увести на
    // anketa-1 по этому неверному значению нельзя: anketa-1 сам входит в
    // isAnketaPath, и следующая проверка ниже уже не смогла бы поправить
    // ошибочный увод оттуда — человек застрял бы там навсегда.
    content = meQuery.data ? (
      <Navigate
        to={isOnboardingComplete ? ROUTES.feed : ROUTES.anketa1}
        replace
      />
    ) : null;
  } else if (
    // Токен есть, анкета не пройдена, но человек уже сбежал с неё на другую
    // защищённую страницу (например, стёр весь путь из адресной строки) —
    // возвращаем в анкету. Ждём meQuery.data, чтобы не увести по ложному
    // срабатыванию на пустом первом рендере, пока /api/auth/me ещё грузится.
    !isMockMode() &&
    token &&
    !isPublicPath &&
    !isAnketaPath &&
    meQuery.data &&
    !isOnboardingComplete
  ) {
    content = <Navigate to={ROUTES.anketa1} replace />;
  } else {
    content = (
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
  }

  return (
    <>
      {content}
      {/* Смонтирован вне зависимости от того, что показывает content выше
          (в т.ч. во время редиректов) — иначе уведомление о паре пропадало бы
          именно на те рендеры, когда идёт проверка/редирект анкеты. */}
      <MatchNotifications
        enabled={!isMockMode() && Boolean(token) && isOnboardingComplete}
      />
    </>
  );
};
