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
