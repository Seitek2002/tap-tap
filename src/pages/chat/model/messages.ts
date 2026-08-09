export type Message = {
  // Есть только у сообщений с бэка (мок-сообщения ничего не знают о
  // времени) — используется, чтобы показать реальную дату начала переписки
  // вместо заглушки (см. formatDateRu в chat-room-page.tsx).
  created_at?: string;
  // Длительность голосового — известна сразу после записи (см.
  // useAudioRecorder), не нужно ждать loadedmetadata у <audio> для неё.
  durationSec?: number;
  fileName?: string;
  // Реальный URL вложения — есть только у сообщений с бэка, не у
  // моковых/ещё не загруженных.
  fileUrl?: string;
  id: number;
  imageUrl?: string;
  kind: "file" | "image" | "text" | "voice";
  seen?: boolean;
  sending?: boolean;
  text?: string;
  type: "incoming" | "outgoing";
  voiceUrl?: string;
};

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
