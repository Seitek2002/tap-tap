// Совпадает с ценой в pages/wallet/model/wallet.ts и PREMIUM_PRICE_PER_DAY в
// bakai-server/src/routes/wallet.js.
export const PREMIUM_PRICE_PER_DAY = 9;
export const PREMIUM_ORIGINAL_PRICE_PER_DAY = 50;

// Настоящей оплаты ещё нет (см. buy-premium в bakai-server/src/routes/wallet.js)
// — кнопка "Получить Premium" сразу включает подписку на этот срок.
export const FREE_PREMIUM_DAYS = 30;

export const PREMIUM_FEATURES = [
  "Узнай, кто тебя лайкнул",
  "Бесконечные суперлайки",
  "Укажи свою машину",
  "Будь первым в экране «Рядом»",
  "Разблокируй доп. фильтры поиска",
  "Покажи хорошую кредитную историю",
  "Режим невидимки",
];
