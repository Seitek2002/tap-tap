export type NearbyProfileDetails = {
  bio: string;
  distanceKm: number;
  habits: string[];
  important: string[];
  marital: string;
  online: boolean;
  premium: { label: string; tone: "gold" | "green" }[];
  seeking: string;
  study: string[];
  work: string[];
  zodiac: string;
};

// Ключ — id из NEARBY_PROFILES. Те же поля, что у CHAT_PROFILES/
// LIKE_PROFILE_DETAILS — независимый мок под свой контекст (интересы уже
// есть в NearbyProfile, поэтому здесь не дублируются).
export const NEARBY_PROFILE_DETAILS: Record<number, NearbyProfileDetails> = {
  1: {
    bio: "Люблю горы и тишину. Ищу того, с кем можно и помолчать, и поговорить обо всём.",
    distanceKm: 5,
    habits: ["🚭 Не курю", "🥾 Часто", "🍷 Редко"],
    important: [
      "📏 178 см",
      "📍 Бишкек",
      "♑ Козерог",
      "⛪ Христианство",
      "🐕 Собаки",
    ],
    marital: "Не женат",
    online: true,
    premium: [{ label: "🚗 Lexus RX", tone: "gold" }],
    seeking: "Серьезные отношения",
    study: ["🎓 КНУ", "🎓 Высшее"],
    work: ["💼 Менеджер проектов", "🏢 в StartUp Hub"],
    zodiac: "Козерог",
  },
  2: {
    bio: "Путешествую при первой возможности и обожаю пробовать новую кухню.",
    distanceKm: 8,
    habits: ["🚭 Не курю", "🏋️ Иногда", "🍸 По праздникам"],
    important: ["📏 182 см", "📍 Ош", "♊ Близнецы", "🕌 Ислам", "🐈 Кошки"],
    marital: "Не женат",
    online: false,
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Пообщаться",
    study: ["🎓 АУЦА", "🎓 Бакалавриат"],
    work: ["💼 SMM-специалист", "🏢 фриланс"],
    zodiac: "Близнецы",
  },
  3: {
    bio: "Учусь и подрабатываю, но всегда найду время на хороший разговор.",
    distanceKm: 6,
    habits: ["🚭 Не курю", "🚶 Иногда", "🚫 Не пью"],
    important: ["📏 175 см", "📍 Бишкек", "♍ Дева", "🕌 Ислам", "🐰 Кролики"],
    marital: "Не женат",
    online: false,
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Дружба",
    study: ["🎓 БГУ", "🎓 Бакалавриат"],
    work: ["💼 Дизайнер", "🏢 фриланс"],
    zodiac: "Дева",
  },
  4: {
    bio: "Пляж, закат и хорошая компания — вот мой идеальный день.",
    distanceKm: 3,
    habits: ["🚬 Иногда", "🏃 Каждый день", "🍹 По компании"],
    important: ["📏 176 см", "📍 Бишкек", "♌ Лев", "🌌 Агностик", "🐕 Собаки"],
    marital: "В разводе",
    online: true,
    premium: [
      { label: "💳 Хорошая кредитная история", tone: "green" },
      { label: "🚗 Toyota Camry", tone: "gold" },
    ],
    seeking: "Серьезные отношения",
    study: ["🎓 КГТУ", "🎓 Высшее"],
    work: ["💼 Инженер", "🏢 в Nur Energy"],
    zodiac: "Лев",
  },
};
