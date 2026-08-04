import { ApiError, api } from "@/shared/api";

import { type AuthResponse, AuthResponseSchema } from "../model/types";

// Временный пароль, чтобы входить только по номеру телефона, пока не готов
// SMS/OTP-эндпоинт (его делает другой бек-разработчик). Когда авторизация
// начнёт приходить из хост-приложения (webview внутри банковского аппа),
// само понятие пароля на фронте уйдёт вместе с этой функцией.
const DEV_PASSWORD = "taptap-dev-2026";

export async function registerOrLogin(
  phoneDigits: string,
): Promise<AuthResponse & { isNewUser: boolean }> {
  const phone = `+996${phoneDigits}`;

  try {
    const data = AuthResponseSchema.parse(
      await api.post("/api/auth/register", { password: DEV_PASSWORD, phone }),
    );
    return { ...data, isNewUser: true };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 409) throw error;

    const data = AuthResponseSchema.parse(
      await api.post("/api/auth/login", { password: DEV_PASSWORD, phone }),
    );
    return { ...data, isNewUser: false };
  }
}
