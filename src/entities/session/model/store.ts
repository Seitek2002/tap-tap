import { create } from "zustand";

import { setUnauthorizedHandler, tokenStorage } from "@/shared/api";

type SessionState = {
  clear: () => void;
  setSession: (session: { token: string; userId: number }) => void;
  token: null | string;
  userId: null | number;
};

const stored = tokenStorage.get();

export const useSessionStore = create<SessionState>((set) => ({
  clear: () => {
    tokenStorage.clear();
    set({ token: null, userId: null });
  },
  setSession: ({ token, userId }) => {
    tokenStorage.set({ token, userId });
    set({ token, userId });
  },
  token: stored?.token ?? null,
  userId: stored?.userId ?? null,
}));

// Протухший/невалидный токен — сервер ответил 401, разлогиниваем локально.
setUnauthorizedHandler(() => useSessionStore.getState().clear());
