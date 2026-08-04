import { useState } from "react";
import { useNavigate } from "react-router";

import { ChevronDown, ChevronLeft, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import { cn } from "@/shared/lib/utils";

import { FAQ_ITEMS, SUPPORT_EMAIL } from "../model/support";

const FaqRow = ({
  answer,
  isOpen,
  onToggle,
  question,
}: {
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  question: string;
}) => (
  <div className="border-b border-[#E4E7EC] last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 py-4 text-left"
    >
      <span className="text-sm font-semibold">{question}</span>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-[#6B7280] transition-transform",
          isOpen && "rotate-180",
        )}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="pb-4 text-sm text-[#6B7280]">{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const SupportPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<null | number>(0);

  return (
    <div className="flex h-dvh flex-col bg-[#FAF9FD] text-[#1C1E24]">
      <div className="flex-1 overflow-y-auto pb-4">
        <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B7280] bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-extrabold">Помощь и поддержка</h1>
        </header>

        <div className="px-4">
          <h2 className="mb-2 text-sm font-bold text-[#6B7280]">
            Частые вопросы
          </h2>
          <div className="rounded-2xl border border-[#E4E7EC] bg-white px-4">
            {FAQ_ITEMS.map((item, index) => (
              <FaqRow
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
              />
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 text-center">
            <p className="font-bold">Не нашёл ответ?</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Напиши нам, и мы поможем разобраться
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1E24] py-3.5 font-bold text-white"
            >
              <Mail className="size-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
