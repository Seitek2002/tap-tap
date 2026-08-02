import personDastan from "@/shared/assets/images/person-dastan.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import personSeitek from "@/shared/assets/images/person-seitek.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

export type NearbyProfile = {
  age: number;
  id: number;
  interests: string[];
  name: string;
  photo: string;
};

export const NEARBY_PROFILES: NearbyProfile[] = [
  {
    age: 32,
    id: 1,
    interests: ["⛰️ Горы", "📈 Бизнес", "🍵 Чай"],
    name: "Залкар",
    photo: personZalkar,
  },
  {
    age: 29,
    id: 2,
    interests: ["✈️ Путешествия", "📷 Фото", "☕ Кофе"],
    name: "Эмир",
    photo: personEmir,
  },
  {
    age: 27,
    id: 3,
    interests: ["🎮 Игры", "🎲 Настолки", "🍜 Азиатская кухня"],
    name: "Дастан",
    photo: personDastan,
  },
  {
    age: 38,
    id: 4,
    interests: [
      "🎳 Боулинг",
      "🌲 Природа",
      "💻 Технологии",
      "🎉 Фестивали",
      "🧩 Паззлы",
      "👗 Мода",
    ],
    name: "Сейтек",
    photo: personSeitek,
  },
];
