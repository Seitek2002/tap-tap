const STORAGE_KEY = "taptap_guide_seen";

export const guideSeen = {
  get: () => localStorage.getItem(STORAGE_KEY) === "1",
  set: () => localStorage.setItem(STORAGE_KEY, "1"),
};
