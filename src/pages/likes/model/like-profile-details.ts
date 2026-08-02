export type LikeProfileDetails = {
  bio: string;
  distanceKm: number;
  habits: string[];
  important: string[];
  interests: string[];
  marital: string;
  online: boolean;
  premium: { label: string; tone: "gold" | "green" }[];
  seeking: string;
  study: string[];
  work: string[];
  zodiac: string;
};

// Ключ — id из LIKED_YOU/YOUR_LIKES. Те же поля, что у CHAT_PROFILES
// (страница профиля в чате) и у карточек в /feed — независимый мок под свой
// контекст (лайки), а не общая сущность.
export const LIKE_PROFILE_DETAILS: Record<number, LikeProfileDetails> = {
  1: {
    bio: "Люблю горы и тишину. Ищу того, с кем можно и помолчать, и поговорить обо всём.",
    distanceKm: 5,
    habits: ["🚭 Не курю", "🥾 Часто", "🍷 Редко"],
    important: ["📏 178 см", "📍 Бишкек", "♑ Козерог", "⛪ Христианство", "🐕 Собаки"],
    interests: ["⛰️ Горы", "📈 Бизнес", "🎧 Подкасты"],
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
    interests: ["✈️ Путешествия", "📷 Фото", "🍜 Азиатская кухня"],
    marital: "Не женат",
    online: false,
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Пообщаться",
    study: ["🎓 АУЦА", "🎓 Бакалавриат"],
    work: ["💼 SMM-специалист", "🏢 фриланс"],
    zodiac: "Близнецы",
  },
  3: {
    bio: "Пляж, закат и хорошая компания — вот мой идеальный день.",
    distanceKm: 3,
    habits: ["🚬 Иногда", "🏃 Каждый день", "🍹 По компании"],
    important: ["📏 176 см", "📍 Бишкек", "♌ Лев", "🌌 Агностик", "🐕 Собаки"],
    interests: ["🎳 Боулинг", "🌲 Природа", "💻 Технологии"],
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
  4: {
    bio: "Учусь и подрабатываю, но всегда найду время на хороший разговор.",
    distanceKm: 6,
    habits: ["🚭 Не курю", "🚶 Иногда", "🚫 Не пью"],
    important: ["📏 175 см", "📍 Бишкек", "♍ Дева", "🕌 Ислам", "🐰 Кролики"],
    interests: ["🎮 Игры", "🎵 Музыка", "📚 Книги"],
    marital: "Не женат",
    online: false,
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Дружба",
    study: ["🎓 БГУ", "🎓 Бакалавриат"],
    work: ["💼 Студент", "🏢 подработка курьером"],
    zodiac: "Дева",
  },
  5: {
    bio: "Обожаю осенние прогулки и разговоры под чашку какао.",
    distanceKm: 2,
    habits: ["🚭 Не курю", "🚶 Каждый день", "🚫 Не пью"],
    important: ["📏 162 см", "📍 Бишкек", "♓ Рыбы", "🌌 Атеизм", "🐈 Кошки"],
    interests: ["🍂 Прогулки", "☕ Какао", "🎵 Музыка"],
    marital: "Не замужем",
    online: false,
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Пообщаться",
    study: ["🎓 КГУ им. Арабаева", "🎓 Высшее"],
    work: ["💼 Учитель", "🏢 школа №5"],
    zodiac: "Рыбы",
  },
  6: {
    bio: "Работаю над интересными проектами, люблю горы и хорошую компанию.",
    distanceKm: 9,
    habits: ["🚭 Не курю", "🏋️ Каждый день", "🍷 Иногда"],
    important: ["📏 180 см", "📍 Бишкек", "🐂 Телец", "🌌 Агностик", "🐕 Собаки"],
    interests: ["⛰️ Горы", "📈 Бизнес", "🎧 Подкасты"],
    marital: "Не женат",
    online: true,
    premium: [{ label: "🚗 Lexus RX", tone: "gold" }],
    seeking: "Нетворкинг",
    study: ["🎓 КНУ", "🎓 Высшее"],
    work: ["💼 Менеджер проектов", "🏢 в StartUp Hub"],
    zodiac: "Телец",
  },
};
