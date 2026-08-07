// "Показано один раз за всё время жизни аккаунта на этом устройстве" —
// общий паттерн для нескольких несвязанных одноразовых UI-подсказок/эффектов,
// сгруппированных здесь в один модуль (а не по файлу на каждый флаг), чтобы
// не раздувать shared/lib числом модулей (см. fsd/shared-lib-grouping).
function createSeenFlag(storageKey: string) {
  return {
    get: () => localStorage.getItem(storageKey) === "1",
    set: () => localStorage.setItem(storageKey, "1"),
  };
}

// Обучающий оверлей на первой карточке ленты (см. swipe-card.tsx).
export const guideSeen = createSeenFlag("taptap_guide_seen");

// Первая попытка загрузки фото (в анкете или в профиле) — показываем
// предупреждение "не подходит по стандартам" и не грузим сам файл, дальше
// все попытки проходят как обычно (см. anketa-12-page.tsx, profile-page.tsx).
export const photoUploadWarningSeen = createSeenFlag(
  "taptap_photo_upload_warning_seen",
);
