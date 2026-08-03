import personDastan from "@/shared/assets/images/person-dastan.png";
import person1 from "@/shared/assets/images/person-1.jpg";
import personNight from "@/shared/assets/images/person-night.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

export const OWN_PROFILE = {
  age: 19,
  bio: "Люблю путешествия, уютные вечера и людей с хорошим чувством юмора",
  completion: 12,
  location: "Бишкек, Кыргызстан",
  name: "Тимур",
  photo: personNight,
  study: "ККС (Кыргызско-Корейский Колледж)",
  work: "Проект менеджер",
};

// Превью для «Добавь больше фото» — просто заглушки из уже имеющихся ассетов.
export const MORE_PHOTOS_PREVIEW = [person1, personDastan, personZalkar];

export const PREMIUM_FEATURES = [
  { bold: false, label: "Узнай, кто тебя лайкнул" },
  { bold: false, label: "Бесконечные суперлайки" },
  { bold: true, label: "Указать машину" },
];

// Тот же список, что в фильтрах партнёра (pages/filters) — независимый мок
// под свой контекст (свои интересы, а не предпочтения по партнёру).
export const INTERESTS = [
  "🎳 Боулинг",
  "🧘 Йога",
  "⛰️ Горы",
  "🍷 Вино",
  "🌱 Вегетерианство",
  "🎾 Теннис",
  "💃 Танцы",
  "🐱 Кошки",
  "🐶 Собаки",
  "🎪 Фестивали",
  "🎤 Пение",
  "🎬 Кино",
  "🎵 Музыка",
  "🧁 Выпечка",
  "🧩 Паззлы",
  "✈️ Путешествия",
  "🎮 Игры",
  "👗 Мода",
  "⚽ Спорт",
  "🎧 RnB",
  "💻 Технологии",
  "🎲 Настолки",
  "🌲 Природа",
  "🎉 Вечеринки",
  "🏳️‍🌈 ЛГБТК+",
  "👻 Ужасы",
  "🎫 Концерты",
  "🎙️ Подкасты",
  "📚 Книги",
  "🕹️ Онлайн-игры",
  "🍺 Бары",
  "🍳 Готовка",
  "🏍️ Мотоциклы",
];

export const DEFAULT_INTERESTS = [
  "🎳 Боулинг",
  "🌲 Природа",
  "💻 Технологии",
  "🎪 Фестивали",
  "🧩 Паззлы",
  "👗 Мода",
];

// Те же поля/опции, что в pages/filters (OPTION_FIELDS), только про себя, а
// не про партнёра — title и лимит выбора (max) те же, что и там.
export const PROFILE_OPTION_FIELDS = [
  {
    key: "children",
    label: "Дети",
    max: 1,
    options: [
      "Хочу когда-нибудь",
      "Пока не знаю",
      "Дети есть и хочу еще",
      "Дети есть, больше не хочу",
    ],
    title: "Хочешь детей?",
  },
  {
    key: "pets",
    label: "Питомцы",
    max: 2,
    options: [
      "Собаки",
      "Кошки",
      "Рыбы",
      "Рептилии",
      "Птицы",
      "Черепахи",
      "Хомяки",
      "Кролики",
      "Всех",
      "У меня аллергия",
      "Другое",
    ],
    title: "Какие у тебя питомцы?",
  },
  {
    key: "loveLanguage",
    label: "Язык любви",
    max: 2,
    options: [
      "Жесты внимания",
      "Комплименты",
      "Забота",
      "Подарки",
      "Совместное время",
      "Прикосновения",
      "Интеллектуальная любовь",
      "Эмоции",
    ],
    title: "Какой у тебя язык любви?",
  },
  {
    key: "religion",
    label: "Религия",
    max: 1,
    options: [
      "Ислам",
      "Атеизм",
      "Христианство",
      "Мормонизм",
      "Агностицизм",
      "Спиритуализм",
      "Протестантизм",
      "Иудаизм",
      "Буддизм",
      "Католичество",
      "Другое",
    ],
    title: "Какая у тебя религия?",
  },
  {
    key: "sport",
    label: "Спорт",
    max: 1,
    options: ["Каждый день", "Иногда", "Очень редко"],
    title: "Как часто занимаешься спортом?",
  },
  {
    key: "alcohol",
    label: "Алкоголь",
    max: 1,
    options: [
      "Я не пью",
      "Категорически против",
      "Пью редко",
      "По особым случаям",
      "Пью за компанию",
      "Иногда",
      "Люблю выпить",
      "По выходным",
    ],
    title: "Как относишься к алкоголю?",
  },
] as const;

export type ProfileOptionFieldKey = (typeof PROFILE_OPTION_FIELDS)[number]["key"];

export const DEFAULT_PROFILE_OPTION_VALUES: Record<
  ProfileOptionFieldKey,
  string[]
> = {
  alcohol: ["Категорически против"],
  children: ["Пока не знаю"],
  loveLanguage: ["Подарки"],
  pets: ["Кошки"],
  religion: ["Иудаизм"],
  sport: ["Каждый день"],
};
