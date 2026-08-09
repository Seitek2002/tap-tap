const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const pad = (value: number) => String(value).padStart(2, "0");

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** «12 июля 2026» — используется и в чате (дата начала переписки), и в
 * кошельке (дата истечения Premium). */
export function formatDateRu(input: Date | number | string): string {
  const date = new Date(input);
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

/** "сегодня в 14:30" / "вчера в 09:05" / "12 июля в 12:56" (+год, если не текущий). */
export function formatLastSeen(timestamp: null | number): string {
  if (timestamp === null) return "давно";

  const date = new Date(timestamp);
  const now = new Date();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (isSameDay(date, now)) return `сегодня в ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return `вчера в ${time}`;

  const yearSuffix =
    date.getFullYear() !== now.getFullYear() ? ` ${date.getFullYear()}` : "";
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}${yearSuffix} в ${time}`;
}

/** "1:05" — прошедшее время записи/проигрывания голосового (анкета-7,
 * голосовые сообщения в чате). */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${pad(s)}`;
}
