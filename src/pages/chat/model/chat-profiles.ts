import personDastan from "@/shared/assets/images/person-dastan.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import person1 from "@/shared/assets/images/person-1.jpg";
import personNight from "@/shared/assets/images/person-night.png";
import personSeitek from "@/shared/assets/images/person-seitek.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

export type ChatProfile = {
  age: number;
  bio: string;
  distanceKm: number;
  habits: string[];
  important: string[];
  interests: string[];
  marital: string;
  online: boolean;
  photos: string[];
  premium: { label: string; tone: "gold" | "green" }[];
  seeking: string;
  study: string[];
  work: string[];
  zodiac: string;
};

// Ключ — id из CHATS. Полные данные анкеты для страницы «Посмотреть профиль»
// в чате (те же поля, что и у карточек в /feed, но независимый мок).
export const CHAT_PROFILES: Record<number, ChatProfile> = {
  1: {
    age: 21,
    bio: "Люблю путешествия, уютные вечера и людей с хорошим чувством юмора. Всегда рада новым знакомствам и интересным разговорам. Напиши если не гей",
    distanceKm: 6,
    habits: ["🚬 Бросаю", "🏃 Каждый день", "🍷 Категорически против"],
    important: [
      "📏 245 см",
      "📍 Бишкек",
      "🌙 Овен",
      "☸️ Иудаизм",
      "🧠 Интеллектуальная любовь",
      "👶 Дети есть, больше не хочу",
      "🐱 Кошки",
    ],
    interests: [
      "🎳 Боулинг",
      "🌲 Природа",
      "💻 Технологии",
      "🎉 Фестивали",
      "🧩 Паззлы",
      "👗 Мода",
    ],
    marital: "В браке",
    online: true,
    photos: [person1],
    premium: [
      { label: "💳 Хорошая кредитная история", tone: "green" },
      { label: "🚗 Toyota Starlet P90", tone: "gold" },
    ],
    seeking: "Серьезные отношения",
    study: ["🎓 ККС (Кыргызско-Корейский Колледж)", "🎓 Средне-специальное"],
    work: ["💼 Проект менеджер", "🏢 в Adam.Tech"],
    zodiac: "Овен",
  },
  2: {
    age: 24,
    bio: "Обожаю кофе по утрам, книги по вечерам и спонтанные поездки на выходных.",
    distanceKm: 3,
    habits: ["🚭 Не курю", "🏋️ Иногда", "🍸 По праздникам"],
    important: ["📏 168 см", "📍 Ош", "♌ Лев", "🕌 Ислам", "🐶 Собаки"],
    interests: ["📚 Книги", "☕ Кофе", "✈️ Путешествия", "🎬 Кино"],
    marital: "Не замужем",
    online: false,
    photos: [personNight],
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Пообщаться",
    study: ["🎓 КРСУ", "🎓 Высшее"],
    work: ["💼 Дизайнер", "🏢 фриланс"],
    zodiac: "Лев",
  },
  3: {
    age: 30,
    bio: "Работаю над интересными проектами, люблю горы и хорошую компанию.",
    distanceKm: 9,
    habits: ["🚭 Не курю", "🏋️ Каждый день", "🍷 Иногда"],
    important: ["📏 180 см", "📍 Бишкек", "🐂 Телец", "🌌 Агностик", "🐕 Собаки"],
    interests: ["⛰️ Горы", "📈 Бизнес", "🎧 Подкасты"],
    marital: "Не женат",
    online: true,
    photos: [personZalkar],
    premium: [{ label: "🚗 Lexus RX", tone: "gold" }],
    seeking: "Нетворкинг",
    study: ["🎓 КНУ", "🎓 Высшее"],
    work: ["💼 Менеджер проектов", "🏢 в StartUp Hub"],
    zodiac: "Телец",
  },
  4: {
    age: 26,
    bio: "Нашла себя в кулинарии и уюте загородных выходных.",
    distanceKm: 4,
    habits: ["🚭 Не курю", "🚶 Иногда", "🚫 Не пью"],
    important: ["📏 165 см", "📍 Бишкек", "♍ Дева", "🕌 Ислам", "🐰 Кролики"],
    interests: ["🍳 Готовка", "🌿 Природа", "📸 Фото"],
    marital: "Не замужем",
    online: false,
    photos: [personDastan],
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Дружба",
    study: ["🎓 БГУ", "🎓 Средне-специальное"],
    work: ["💼 Повар", "🏢 ресторан Nomad"],
    zodiac: "Дева",
  },
  5: {
    age: 33,
    bio: "Планирую поездки чаще, чем разговариваю по телефону.",
    distanceKm: 11,
    habits: ["🚭 Не курю", "🥾 Часто", "🍷 Редко"],
    important: ["📏 178 см", "📍 Каракол", "♏ Скорпион", "⛪ Христианство", "🐕 Собаки"],
    interests: ["⛰️ Горы", "✈️ Путешествия", "📷 Фото"],
    marital: "В разводе",
    online: true,
    photos: [personEmir],
    premium: [{ label: "🚗 Honda Fit", tone: "gold" }],
    seeking: "Серьезные отношения",
    study: ["🎓 КГУ", "🎓 Высшее"],
    work: ["💼 Гид", "🏢 туристическое агентство"],
    zodiac: "Скорпион",
  },
  6: {
    age: 27,
    bio: "Люблю осенние прогулки и разговоры под чашку какао.",
    distanceKm: 2,
    habits: ["🚭 Не курю", "🚶 Каждый день", "🚫 Не пью"],
    important: ["📏 162 см", "📍 Бишкек", "♓ Рыбы", "🌌 Атеизм", "🐈 Кошки"],
    interests: ["🍂 Прогулки", "☕ Какао", "🎵 Музыка"],
    marital: "Не замужем",
    online: false,
    photos: [personSeitek],
    premium: [{ label: "✅ Подтверждённый профиль", tone: "green" }],
    seeking: "Пообщаться",
    study: ["🎓 КГУ им. Арабаева", "🎓 Высшее"],
    work: ["💼 Учитель", "🏢 школа №5"],
    zodiac: "Рыбы",
  },
};
