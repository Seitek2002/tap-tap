import { createHashRouter } from "react-router";

import { ROUTES } from "@/shared/config";

import {
  AboutPage,
  AddContactManuallyPage,
  Anketa1Page,
  Anketa2Page,
  Anketa3Page,
  Anketa4Page,
  Anketa5Page,
  Anketa6Page,
  Anketa7Page,
  Anketa8Page,
  Anketa9Page,
  Anketa10Page,
  Anketa11Page,
  Anketa12Page,
  AuthPage,
  ChatPage,
  ChatProfilePage,
  ChatRoomPage,
  ComponentsPage,
  FeedPage,
  FiltersPage,
  GuidelinesPage,
  HideFromContactsPage,
  LikeProfilePage,
  LikesPage,
  NearbyPage,
  NearbyProfilePage,
  NotificationsPage,
  NumberVerificationPage,
  PremiumPage,
  PrivacyPage,
  ProfilePage,
  SettingsPage,
  SupportPage,
  WalletPage,
  WelcomePage,
} from "./lazy-pages";
import { PageTransition } from "./page-transition";

// React.lazy (см. lazy-pages.tsx) — вместо одного бандла на ~1 МБ, куда
// попадали все ~35 страниц сразу (анкета, лента, чат, профиль и т.д.),
// каждая страница теперь свой чанк, догружаемый только когда на неё реально
// заходят. Фоллбэк на время загрузки чанка — один Suspense вокруг
// FrozenOutlet в PageTransition, а не здесь: не плодить его на каждый роут.

// createHashRouter, а не browser: в Capacitor WebView перезагрузка на любом
// маршруте не улетает в 404 и не требует серверного rewrite.
// Проверка сессии (есть токен → в ленту, иначе → на welcome) — в
// PageTransition, он оборачивает все роуты ниже.
// Корневой pathless layout-роут — не участвует в матчинге URL, только
// оборачивает все страницы в PageTransition для анимации между ними.
export const router = createHashRouter([
  {
    children: [
      {
        element: <WelcomePage />,
        path: "/",
      },
      {
        element: <FeedPage />,
        path: ROUTES.feed,
      },
      {
        element: <NearbyPage />,
        path: ROUTES.nearby,
      },
      {
        element: <NearbyProfilePage />,
        path: ROUTES.nearbyProfile,
      },
      {
        element: <FiltersPage />,
        path: ROUTES.filters,
      },
      {
        element: <LikesPage />,
        path: ROUTES.likes,
      },
      {
        element: <LikeProfilePage />,
        path: ROUTES.likeProfile,
      },
      {
        element: <ProfilePage />,
        path: ROUTES.profile,
      },
      {
        element: <SettingsPage />,
        path: ROUTES.profileSettings,
      },
      {
        element: <NotificationsPage />,
        path: ROUTES.profileNotifications,
      },
      {
        element: <HideFromContactsPage />,
        path: ROUTES.profileHideFromContacts,
      },
      {
        element: <AddContactManuallyPage />,
        path: ROUTES.profileAddContactManually,
      },
      {
        element: <SupportPage />,
        path: ROUTES.profileSupport,
      },
      {
        element: <GuidelinesPage />,
        path: ROUTES.profileGuidelines,
      },
      {
        element: <PrivacyPage />,
        path: ROUTES.profilePrivacy,
      },
      {
        element: <AboutPage />,
        path: ROUTES.profileAbout,
      },
      {
        element: <ChatPage />,
        path: ROUTES.chat,
      },
      {
        element: <ChatRoomPage />,
        path: ROUTES.chatRoom,
      },
      {
        element: <ChatProfilePage />,
        path: ROUTES.chatProfile,
      },
      {
        element: <ComponentsPage />,
        path: ROUTES.components,
      },
      {
        element: <AuthPage />,
        path: ROUTES.auth,
      },
      {
        element: <NumberVerificationPage />,
        path: ROUTES.numberVerification,
      },
      {
        element: <Anketa1Page />,
        path: ROUTES.anketa1,
      },
      {
        element: <Anketa2Page />,
        path: ROUTES.anketa2,
      },
      {
        element: <Anketa3Page />,
        path: ROUTES.anketa3,
      },
      {
        element: <Anketa4Page />,
        path: ROUTES.anketa4,
      },
      {
        element: <Anketa5Page />,
        path: ROUTES.anketa5,
      },
      {
        element: <Anketa6Page />,
        path: ROUTES.anketa6,
      },
      {
        element: <Anketa7Page />,
        path: ROUTES.anketa7,
      },
      {
        element: <Anketa8Page />,
        path: ROUTES.anketa8,
      },
      {
        element: <Anketa9Page />,
        path: ROUTES.anketa9,
      },
      {
        element: <Anketa10Page />,
        path: ROUTES.anketa10,
      },
      {
        element: <Anketa11Page />,
        path: ROUTES.anketa11,
      },
      {
        element: <Anketa12Page />,
        path: ROUTES.anketa12,
      },
      {
        element: <WalletPage />,
        path: ROUTES.wallet,
      },
      {
        element: <PremiumPage />,
        path: ROUTES.premium,
      },
    ],
    element: <PageTransition />,
  },
]);
