import { useNavigate } from "react-router";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import { ROUTES } from "@/shared/config";

import { APP_VERSION } from "../model/settings";
import { SUPPORT_EMAIL } from "../model/support";

const LinkRow = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
  >
    <span className="text-sm font-medium">{label}</span>
    <ChevronRight className="size-4 shrink-0 text-[#6B7280]" />
  </button>
);

export const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-6">
        <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-extrabold">О приложении</h1>
        </header>

        <div className="mx-4 mt-3 rounded-3xl border border-[#E4E7EC] bg-white p-6 text-center">
          <p className="text-3xl font-extrabold">
            <span className="text-[#1C1E24]">Tap</span>
            <span className="text-primary">Tap</span>
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">Версия {APP_VERSION}</p>
          <p className="mt-4 text-sm leading-relaxed">
            TapTap — приложение для знакомств рядом с тобой. Свайпай анкеты,
            находи совпадения, общайся в чате и назначай встречи с людьми,
            которые тебе интересны.
          </p>
        </div>

        <div className="mx-4 mt-3 divide-y divide-[#E4E7EC] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white">
          <LinkRow
            label="Правила сообщества"
            onClick={() => navigate(ROUTES.profileGuidelines)}
          />
          <LinkRow
            label="Политика конфиденциальности"
            onClick={() => navigate(ROUTES.profilePrivacy)}
          />
          <LinkRow
            label="Помощь и поддержка"
            onClick={() => navigate(ROUTES.profileSupport)}
          />
        </div>

        <div className="mt-6 text-center text-xs text-[#6B7280]">
          <p>{SUPPORT_EMAIL}</p>
          <p className="mt-1">© 2026 TapTap</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
