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

/** «12 июля 2026» — используется и в чате (дата начала переписки), и в
 * кошельке (дата истечения Premium). */
export function formatDateRu(input: Date | number | string): string {
  const date = new Date(input);
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}
