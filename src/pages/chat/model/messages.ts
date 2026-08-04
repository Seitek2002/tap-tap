export type Message = {
  fileName?: string;
  // Реальный URL вложения — есть только у сообщений с бэка, не у
  // моковых/ещё не загруженных.
  fileUrl?: string;
  id: number;
  imageUrl?: string;
  kind: "file" | "image" | "text";
  seen?: boolean;
  sending?: boolean;
  text?: string;
  type: "incoming" | "outgoing";
};

export const CONVERSATION_DATE = "12 июля 2026, 12:56";

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    kind: "text",
    text: "Привет! Скоро выходит 3 сезон АИУ",
    type: "incoming",
  },
  {
    id: 2,
    kind: "text",
    text: "Давай вместе смотреть будем?",
    type: "incoming",
  },
  {
    id: 3,
    kind: "text",
    text: "Или ты лох который наруто смотрит?",
    type: "incoming",
  },
  {
    id: 4,
    kind: "text",
    text: "Сам ты лох, я смотрю Черное Зеркало!",
    type: "outgoing",
  },
  {
    id: 5,
    kind: "image",
    type: "incoming",
  },
  {
    id: 6,
    kind: "image",
    seen: true,
    type: "outgoing",
  },
];
