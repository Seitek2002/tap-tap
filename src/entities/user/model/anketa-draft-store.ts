import { create } from "zustand";

import type { ProfileUpdate } from "./types";

type AnketaDraftState = {
  draft: Partial<ProfileUpdate>;
  reset: () => void;
  setField: <K extends keyof ProfileUpdate>(
    key: K,
    value: ProfileUpdate[K],
  ) => void;
};

// Копится по мере прохождения шагов /anketa-1..12 (каждый шаг пишет свои
// поля перед переходом дальше), одним PUT /api/profile уходит на бэк на
// последнем шаге. Специально не персистится — это черновик одного прохода
// анкеты, не пользовательские данные для восстановления между сессиями.
export const useAnketaDraftStore = create<AnketaDraftState>((set) => ({
  draft: {},
  reset: () => set({ draft: {} }),
  setField: (key, value) =>
    set((state) => ({ draft: { ...state.draft, [key]: value } })),
}));
