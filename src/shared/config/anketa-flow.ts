import { ROUTES } from "./routes";

/**
 * Порядок шагов анкеты. Добавляешь новый экран анкеты — дописываешь его сюда,
 * и он автоматически встроится в цепочку «Далее» (см. useAnketaFlow).
 */
export const ANKETA_STEPS = [
  ROUTES.anketa1,
  ROUTES.anketa2,
  ROUTES.anketa3,
  ROUTES.anketa4,
  ROUTES.anketa5,
  ROUTES.anketa6,
  ROUTES.anketa7,
  ROUTES.anketa8,
  ROUTES.anketa9,
  ROUTES.anketa10,
  ROUTES.anketa11,
  ROUTES.anketa12,
] as const;
