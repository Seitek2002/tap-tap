import personDastan from "@/shared/assets/images/person-dastan.png";
import personEmir from "@/shared/assets/images/person-emir.png";
import personNight from "@/shared/assets/images/person-night.png";
import personSeitek from "@/shared/assets/images/person-seitek.png";
import personZalkar from "@/shared/assets/images/person-zalkar.png";

export type LikeProfile = {
  age: number;
  id: number;
  name: string;
  photo: string;
};

// Первые 2 открыты бесплатно, остальные — под замком Premium (блюр + лок).
export const LIKED_YOU: LikeProfile[] = [
  { age: 32, id: 1, name: "Залкар", photo: personZalkar },
  { age: 19, id: 2, name: "Эмир", photo: personEmir },
  { age: 38, id: 3, name: "Сейтек", photo: personSeitek },
  { age: 17, id: 4, name: "Дастан", photo: personDastan },
  { age: 24, id: 5, name: "Аяна", photo: personNight },
  { age: 21, id: 6, name: "Тимур", photo: personZalkar },
];

export const UNLOCKED_LIKES_COUNT = 2;

export const YOUR_LIKES: LikeProfile[] = [
  { age: 32, id: 1, name: "Залкар", photo: personZalkar },
  { age: 19, id: 2, name: "Эмир", photo: personEmir },
  { age: 38, id: 3, name: "Сейтек", photo: personSeitek },
  { age: 17, id: 4, name: "Дастан", photo: personDastan },
  { age: 24, id: 5, name: "Аяна", photo: personNight },
  { age: 21, id: 6, name: "Тимур", photo: personZalkar },
];
