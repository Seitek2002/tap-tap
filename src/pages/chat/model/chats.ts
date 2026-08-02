import personDastan from "@/shared/assets/images/person-dastan.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import person1 from "@/shared/assets/images/person-1.jpg";
import personNight from "@/shared/assets/images/person-night.png";
import personSeitek from "@/shared/assets/images/person-seitek.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

export type Chat = {
  id: number;
  lastMessage: string;
  name: string;
  online: boolean;
  photo: string;
  unread: boolean;
  yourTurn: boolean;
};

// Верхний ряд «Лайки и пары» — первая с фиолетовым кольцом и счётчиком лайков.
export const LIKES_AND_MATCHES = [
  person1,
  personNight,
  personDastan,
  personZalkar,
  personSeitek,
];

export const CHATS: Chat[] = [
  {
    id: 1,
    lastMessage: "Привет! Я тоже люблю кошек",
    name: "Айдай",
    online: true,
    photo: person1,
    unread: true,
    yourTurn: false,
  },
  {
    id: 2,
    lastMessage: "Хочу устроить пикник в парке, кто присоединится?",
    name: "Асия",
    online: false,
    photo: personNight,
    unread: true,
    yourTurn: false,
  },
  {
    id: 3,
    lastMessage: "Завтра на встрече обсудим новый проект",
    name: "Тимур",
    online: true,
    photo: personZalkar,
    unread: false,
    yourTurn: true,
  },
  {
    id: 4,
    lastMessage: "Нашла интересный рецепт, поделюсь на выходных",
    name: "Лейла",
    online: false,
    photo: personDastan,
    unread: false,
    yourTurn: false,
  },
  {
    id: 5,
    lastMessage: "Планирую поездку в горы, кто хочет пойти?",
    name: "Данияр",
    online: false,
    photo: personEmir,
    unread: false,
    yourTurn: false,
  },
  {
    id: 6,
    lastMessage: "Обожаю осенние прогулки, а ты?",
    name: "Гульнара",
    online: true,
    photo: personSeitek,
    unread: false,
    yourTurn: true,
  },
];
