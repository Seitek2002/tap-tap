import onboarding1 from "@/shared/assets/images/onboarding-1.png";
import onboarding2 from "@/shared/assets/images/onboarding-2.png";
import onboarding3 from "@/shared/assets/images/onboarding-3.png";

export type OnboardingHeadingLine = {
  emphasis?: boolean;
  size?: "hero";
  text: string;
};

export type OnboardingSlide = {
  heading: OnboardingHeadingLine[];
  image: string;
  paragraphs: [string, string];
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    heading: [
      { emphasis: true, size: "hero", text: "100%" },
      { text: "подтвержденные профили" },
    ],
    image: onboarding1,
    paragraphs: [
      "Каждый пользователь проходит подтверждение личности через государственную систему «Түндүк».",
      "Никаких фейков, ботов и вымышленных анкет — только реальные люди из Кыргызстана.",
    ],
  },
  {
    heading: [
      { text: "Женатых и замужних" },
      { emphasis: true, text: "не допускаем" },
    ],
    image: onboarding2,
    paragraphs: [
      "Регистрация доступна только тем, кто официально не состоит в браке.",
      "Семейный статус проверяется по данным государственной системы «Түндүк».",
    ],
  },
  {
    heading: [
      { text: "Мошенники вернуться" },
      { emphasis: true, text: "не смогут" },
    ],
    image: onboarding3,
    paragraphs: [
      "Каждый аккаунт связан с подтвержденной личностью.",
      "За мошенничество, угрозы и серьезные нарушения пользователь блокируется на уровне идентификационных данных и не сможет просто создать новую анкету.",
    ],
  },
];
