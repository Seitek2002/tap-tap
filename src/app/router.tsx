import { createHashRouter } from "react-router";

import { Anketa1Page } from "@/pages/anketa/1";
import { Anketa2Page } from "@/pages/anketa/2";
import { Anketa3Page } from "@/pages/anketa/3";
import { Anketa4Page } from "@/pages/anketa/4";
import { Anketa5Page } from "@/pages/anketa/5";
import { Anketa6Page } from "@/pages/anketa/6";
import { Anketa7Page } from "@/pages/anketa/7";
import { Anketa8Page } from "@/pages/anketa/8";
import { Anketa9Page } from "@/pages/anketa/9";
import { Anketa10Page } from "@/pages/anketa/10";
import { Anketa11Page } from "@/pages/anketa/11";
import { Anketa12Page } from "@/pages/anketa/12";
import { AuthPage } from "@/pages/auth";
import { ChatPage, ChatProfilePage, ChatRoomPage } from "@/pages/chat";
import { ComponentsPage } from "@/pages/components";
import { FeedPage, NearbyPage, NearbyProfilePage } from "@/pages/feed";
import { FiltersPage } from "@/pages/filters";
import { LikeProfilePage, LikesPage } from "@/pages/likes";
import { NumberVerificationPage } from "@/pages/number-verification";
import { PremiumPage } from "@/pages/premium";
import {
  AboutPage,
  AddContactManuallyPage,
  GuidelinesPage,
  HideFromContactsPage,
  NotificationsPage,
  PrivacyPage,
  ProfilePage,
  SettingsPage,
  SupportPage,
} from "@/pages/profile";
import { WalletPage } from "@/pages/wallet";
import { WelcomePage } from "@/pages/welcome";

import { ROUTES } from "@/shared/config";

import { PageTransition } from "./page-transition";

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
