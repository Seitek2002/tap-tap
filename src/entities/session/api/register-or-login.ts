import { ApiError, api } from "@/shared/api";

import { type AuthResponse, AuthResponseSchema } from "../model/types";

// Временный пароль, чтобы входить только по номеру телефона, пока не готов
// SMS/OTP-эндпоинт (его делает другой бек-разработчик). Когда авторизация
// начнёт приходить из хост-приложения (webview внутри банковского аппа),
// само понятие пароля на фронте уйдёт вместе с этой функцией.
const DEV_PASSWORD = "taptap-dev-2026";

// gender — "men"/"women". Пока приложение не встроено в хост (МБанк/
// БакайБанк и т.п.), который передавал бы пол сам при каждом входе, его
// временно спрашивают на экране ввода номера (см. auth-page.tsx).
export async function registerOrLogin(
  phoneDigits: string,
  gender: string,
): Promise<AuthResponse & { isNewUser: boolean }> {
  const phone = `+996${phoneDigits}`;

  try {
    const data = AuthResponseSchema.parse(
      await api.post("/api/auth/register", {
        gender,
        password: DEV_PASSWORD,
        phone,
      }),
    );
    return { ...data, isNewUser: true };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 409) throw error;

    const data = AuthResponseSchema.parse(
      await api.post("/api/auth/login", {
        gender,
        password: DEV_PASSWORD,
        phone,
      }),
    );
    return { ...data, isNewUser: false };
  }
}
