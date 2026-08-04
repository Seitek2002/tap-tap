/**
 * Демо-режим: приложение работает целиком на моках, без единого запроса
 * к bakai-server. Включается через VITE_MOCK_MODE=true (обычно в
 * .env.local, чтобы не менять поведение по умолчанию для остальных).
 */
export const isMockMode = () => import.meta.env.VITE_MOCK_MODE === "true";
