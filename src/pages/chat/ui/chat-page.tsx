import { AlignJustify, Check, Heart, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { BottomNav } from "@/widgets/bottom-nav";

import emptyChatIllustration from "@/shared/assets/images/empty-chat-illustration.png";
import { useClickAway } from "@/shared/lib/use-click-away";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { PullToRefresh } from "@/shared/ui/pull-to-refresh";

import { CHATS, LIKES_AND_MATCHES } from "../model/chats";
import { REPORT_REASONS } from "../model/report-reasons";
import { ChatRow } from "./chat-row";

const CHAT_FILTERS = [
  { key: "all", label: "Все" },
  { key: "unread", label: "Непрочитанные" },
  { key: "online", label: "Онлайн" },
  { key: "waiting", label: "Ждут ответ" },
] as const;

type ChatFilterKey = (typeof CHAT_FILTERS)[number]["key"];

export const ChatPage = () => {
  const navigate = useNavigate();

  // Локальная копия — «Отменить лайк»/«Заблокировать» из подтверждения
  // реально убирают переписку из списка, без бэкенда.
  const [chats, setChats] = useState(CHATS);
  const [unmatchChatId, setUnmatchChatId] = useState<null | number>(null);
  const [blockChatId, setBlockChatId] = useState<null | number>(null);
  const [reportChatId, setReportChatId] = useState<null | number>(null);
  const unmatchChat = chats.find((chat) => chat.id === unmatchChatId);
  const blockChat = chats.find((chat) => chat.id === blockChatId);

  const [filter, setFilter] = useState<ChatFilterKey>("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Открытая свайпом строка — только одна за раз, как в большинстве
  // мессенджеров: открыть новую значит закрыть предыдущую.
  const [openChatId, setOpenChatId] = useState<null | number>(null);

  useClickAway(filterMenuRef, () => {
    if (isFilterMenuOpen) setIsFilterMenuOpen(false);
  });

  const visibleChats = chats.filter((chat) => {
    if (filter === "unread") return chat.unread;
    if (filter === "online") return chat.online;
    if (filter === "waiting") return chat.yourTurn;
    return true;
  });

  const confirmUnmatch = () => {
    setChats((prev) => prev.filter((chat) => chat.id !== unmatchChatId));
    setUnmatchChatId(null);
  };

  const confirmBlock = () => {
    setChats((prev) => prev.filter((chat) => chat.id !== blockChatId));
    setBlockChatId(null);
  };

  const reportFromUnmatch = () => {
    setReportChatId(unmatchChatId);
    setUnmatchChatId(null);
  };

  const reportFromBlock = () => {
    setReportChatId(blockChatId);
    setBlockChatId(null);
  };

  // Бэкенда нет — просто имитируем сетевой запрос под спиннером.
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success("Обновлено");
  };

  return (
    <div className="flex h-dvh flex-col overflow-x-hidden bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхний бар */}
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <h1 className="text-2xl font-extrabold">Чаты</h1>
        <button
          type="button"
          aria-label="Поиск"
          className="flex size-9 items-center justify-center text-[#1C1E24]"
        >
          <Search className="size-6" />
        </button>
      </header>

      {/* Лайки и пары */}
      <div className="px-4 pb-2">
        <h2 className="text-sm font-bold text-[#6B7280]">Лайки и пары</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LIKES_AND_MATCHES.map((photo, index) => (
            <div key={index} className="relative mb-2 w-16 shrink-0">
              <img
                src={photo}
                alt=""
                className={cn(
                  "size-16 rounded-full object-cover",
                  index === 0
                    ? "border-2 border-primary"
                    : "border-2 border-transparent",
                )}
              />
              {index === 0 && (
                <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white">
                  <Heart className="size-2.5 fill-current" />
                  99+
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <h2 className="text-base font-bold">Сообщения</h2>
        <div className="relative" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => setIsFilterMenuOpen((open) => !open)}
            aria-label="Фильтр"
            className="flex size-8 items-center justify-center text-[#1C1E24]"
          >
            <AlignJustify className="size-5" />
          </button>

          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 z-30 mt-2 flex w-51.75 flex-col gap-4.5 rounded-3xl border-[0.3px] border-[#1C1E24] bg-white py-5 shadow-[-3px_6px_40px_0_rgba(61,61,61,0.14)]"
              >
                {CHAT_FILTERS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setFilter(option.key);
                      setIsFilterMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 text-left text-sm"
                  >
                    {option.label}
                    {filter === option.key && (
                      <Check className="size-4 shrink-0 text-[#1C1E24]" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-16 text-center">
          <img src={emptyChatIllustration} alt="" className="mb-6 w-55.25" />
          <h2 className="text-lg font-bold">Чат пустой</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            После взаимной симпатии
            <br />
            вы сможете общаться здесь
          </p>
        </div>
      ) : visibleChats.length === 0 ? (
        <p className="flex-1 px-8 pt-10 text-center text-sm text-[#6B7280]">
          По этому фильтру ничего не нашлось
        </p>
      ) : (
        <PullToRefresh
          onRefresh={handleRefresh}
          className="flex-1 divide-y divide-[#E4E7EC] overflow-y-auto"
        >
          <AnimatePresence mode="popLayout">
            {visibleChats.map((chat) => (
              // layout + popLayout — при удалении строка выезжает дальше
              // вправо и гаснет, а соседние строки сразу сдвигаются вверх,
              // не дожидаясь конца анимации ухода.
              <motion.div
                key={chat.id}
                layout
                exit={{ opacity: 0, x: 120 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ChatRow
                  chat={chat}
                  isOpen={openChatId === chat.id}
                  onBlock={() => setBlockChatId(chat.id)}
                  onNavigate={() => navigate(`/chat/${chat.id}`)}
                  onOpenChange={(open) => setOpenChatId(open ? chat.id : null)}
                  onReport={() => setReportChatId(chat.id)}
                  onUnmatch={() => setUnmatchChatId(chat.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </PullToRefresh>
      )}

      <Modal
        isOpen={unmatchChatId !== null}
        onClose={() => setUnmatchChatId(null)}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">
            Удалить пару с {unmatchChat?.name}?
          </h2>
          <p className="text-sm text-[#6B7280]">
            Ваша пара будет аннулирована и удалится чат у обоих
          </p>
        </div>
        <button
          type="button"
          data-haptic="heavy"
          onClick={confirmUnmatch}
          className="mt-6 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отменить лайк
        </button>
        <button
          type="button"
          onClick={reportFromUnmatch}
          className="mt-4 w-full text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться
        </button>
      </Modal>

      <Modal isOpen={blockChatId !== null} onClose={() => setBlockChatId(null)}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-bold">
            Заблокировать {blockChat?.name}?
          </h2>
          <p className="text-sm text-[#6B7280]">
            Мы скроем ваш профиль друг от друга,
            <br />а общение станет недоступно.
          </p>
        </div>
        <button
          type="button"
          data-haptic="heavy"
          onClick={confirmBlock}
          className="mt-6 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Заблокировать
        </button>
        <button
          type="button"
          onClick={reportFromBlock}
          className="mt-4 w-full text-center text-sm font-semibold text-red-500"
        >
          Пожаловаться
        </button>
      </Modal>

      <Modal
        isOpen={reportChatId !== null}
        onClose={() => setReportChatId(null)}
      >
        <h2 className="text-center text-lg font-bold">Укажи причину жалобы</h2>
        <div className="mt-2 divide-y divide-[#E4E7EC]">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              data-haptic="heavy"
              onClick={() => setReportChatId(null)}
              className="w-full py-4 text-center text-[#1C1E24]"
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setReportChatId(null)}
          className="mt-4 w-full rounded-full bg-[#1C1E24] py-4 font-bold text-white"
        >
          Отмена
        </button>
      </Modal>

      <BottomNav />
    </div>
  );
};
