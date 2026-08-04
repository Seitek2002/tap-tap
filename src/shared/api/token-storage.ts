const STORAGE_KEY = "taptap_session";

type StoredSession = { token: string; userId: number };

export const tokenStorage = {
  clear: () => localStorage.removeItem(STORAGE_KEY),
  get: (): null | StoredSession => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  },
  set: (session: StoredSession) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session)),
};
