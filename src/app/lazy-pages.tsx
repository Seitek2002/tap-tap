import { lazy } from "react";

// Вынесено из router.tsx отдельным файлом — react-refresh/only-export-
// components не даёт файлу одновременно объявлять компоненты и экспортировать
// не-компонент (там — router, обычный объект createHashRouter).
export const Anketa1Page = lazy(() =>
  import("@/pages/anketa/1").then((m) => ({ default: m.Anketa1Page })),
);
export const Anketa2Page = lazy(() =>
  import("@/pages/anketa/2").then((m) => ({ default: m.Anketa2Page })),
);
export const Anketa3Page = lazy(() =>
  import("@/pages/anketa/3").then((m) => ({ default: m.Anketa3Page })),
);
export const Anketa4Page = lazy(() =>
  import("@/pages/anketa/4").then((m) => ({ default: m.Anketa4Page })),
);
export const Anketa5Page = lazy(() =>
  import("@/pages/anketa/5").then((m) => ({ default: m.Anketa5Page })),
);
export const Anketa6Page = lazy(() =>
  import("@/pages/anketa/6").then((m) => ({ default: m.Anketa6Page })),
);
export const Anketa7Page = lazy(() =>
  import("@/pages/anketa/7").then((m) => ({ default: m.Anketa7Page })),
);
export const Anketa8Page = lazy(() =>
  import("@/pages/anketa/8").then((m) => ({ default: m.Anketa8Page })),
);
export const Anketa9Page = lazy(() =>
  import("@/pages/anketa/9").then((m) => ({ default: m.Anketa9Page })),
);
export const Anketa10Page = lazy(() =>
  import("@/pages/anketa/10").then((m) => ({ default: m.Anketa10Page })),
);
export const Anketa11Page = lazy(() =>
  import("@/pages/anketa/11").then((m) => ({ default: m.Anketa11Page })),
);
export const Anketa12Page = lazy(() =>
  import("@/pages/anketa/12").then((m) => ({ default: m.Anketa12Page })),
);
export const AuthPage = lazy(() =>
  import("@/pages/auth").then((m) => ({ default: m.AuthPage })),
);
export const ChatPage = lazy(() =>
  import("@/pages/chat").then((m) => ({ default: m.ChatPage })),
);
export const ChatProfilePage = lazy(() =>
  import("@/pages/chat").then((m) => ({ default: m.ChatProfilePage })),
);
export const ChatRoomPage = lazy(() =>
  import("@/pages/chat").then((m) => ({ default: m.ChatRoomPage })),
);
export const ComponentsPage = lazy(() =>
  import("@/pages/components").then((m) => ({ default: m.ComponentsPage })),
);
export const FeedPage = lazy(() =>
  import("@/pages/feed").then((m) => ({ default: m.FeedPage })),
);
export const NearbyPage = lazy(() =>
  import("@/pages/feed").then((m) => ({ default: m.NearbyPage })),
);
export const NearbyProfilePage = lazy(() =>
  import("@/pages/feed").then((m) => ({ default: m.NearbyProfilePage })),
);
export const FiltersPage = lazy(() =>
  import("@/pages/filters").then((m) => ({ default: m.FiltersPage })),
);
export const LikeProfilePage = lazy(() =>
  import("@/pages/likes").then((m) => ({ default: m.LikeProfilePage })),
);
export const LikesPage = lazy(() =>
  import("@/pages/likes").then((m) => ({ default: m.LikesPage })),
);
export const NumberVerificationPage = lazy(() =>
  import("@/pages/number-verification").then((m) => ({
    default: m.NumberVerificationPage,
  })),
);
export const PremiumPage = lazy(() =>
  import("@/pages/premium").then((m) => ({ default: m.PremiumPage })),
);
export const AboutPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.AboutPage })),
);
export const AddContactManuallyPage = lazy(() =>
  import("@/pages/profile").then((m) => ({
    default: m.AddContactManuallyPage,
  })),
);
export const GuidelinesPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.GuidelinesPage })),
);
export const HideFromContactsPage = lazy(() =>
  import("@/pages/profile").then((m) => ({
    default: m.HideFromContactsPage,
  })),
);
export const NotificationsPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.NotificationsPage })),
);
export const PrivacyPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.PrivacyPage })),
);
export const ProfilePage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.ProfilePage })),
);
export const SettingsPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.SettingsPage })),
);
export const SupportPage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.SupportPage })),
);
export const WalletPage = lazy(() =>
  import("@/pages/wallet").then((m) => ({ default: m.WalletPage })),
);
export const WelcomePage = lazy(() =>
  import("@/pages/welcome").then((m) => ({ default: m.WelcomePage })),
);
