import { useNavigate } from "react-router";

import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/widgets/bottom-nav";

import { GUIDELINE_SECTIONS } from "../model/guidelines";

const Section = ({ body, title }: { body: string; title: string }) => (
  <div className="mx-4 mt-3 rounded-3xl border border-[#E4E7EC] bg-white p-4">
    <h2 className="border-b border-[#E4E7EC] pb-2.5 text-sm font-semibold">
      {title}
    </h2>
    <p className="mt-2 text-sm text-[#6B7280]">{body}</p>
  </div>
);

export const GuidelinesPage = () => {
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
          <h1 className="text-2xl font-extrabold">Правила сообщества</h1>
        </header>

        <p className="px-4 text-sm text-[#6B7280]">
          Эти правила помогают TapTap оставаться безопасным местом для
          знакомств. Их нарушение может привести к блокировке аккаунта.
        </p>

        {GUIDELINE_SECTIONS.map((section) => (
          <Section
            key={section.title}
            title={section.title}
            body={section.body}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};
