import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { AlignJustify, Check, Heart, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { BottomNav } from "@/widgets/bottom-nav";

import {
  useBlockUserMutation,
  useChatsQuery,
  useReportUserMutation,
  useUnmatchMutation,
} from "@/entities/user";

import emptyChatIllustration from "@/shared/assets/images/empty-chat-illustration.png";
import { REPORT_REASONS } from "@/shared/config";
import { isMockMode } from "@/shared/lib/mock-mode";
import { useClickAway } from "@/shared/lib/use-click-away";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui/modal";
import { PullToRefresh } from "@/shared/ui/pull-to-refresh";
import { Skeleton } from "@/shared/ui/skeleton";

import { CHATS, LIKES_AND_MATCHES } from "../model/chats";
import { mapChatListItemToChat } from "../model/map-chat-list-item";
import { ChatRow } from "./chat-row";

const CHAT_FILTERS = [
  { key: "all", label: "Все" },
  { key: "unread", label: "Непрочитанные" },
  { key: "online", label: "Онлайн" },
  { key: "waiting", label: "Ждут ответ" },
] as const;

type ChatFilterKey = (typeof CHAT_FILTERS)[number]["key"];

// Карточки данных (список чатов) — скелетон формы контента, пока не пришёл
// реальный список. Бэкенда нет, поэтому имитируем короткой задержкой на
// монтировании.
const CHAT_ROW_SKELETON_COUNT = 6;

const ChatRowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton className="size-14 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3.5 w-40" />
    </div>
  </div>
);

export const ChatPage = () => {
  const navigate = useNavigate();

  // Mock-режим без бэка — имитируем короткую загрузку списка чатов при
  // заходе на страницу скелетонами вместо реальных строк.
  const [isMockLoading, setIsMockLoading] = useState(true);

  useEffect(() => {
    if (!isMockMode()) return;
    const timer = setTimeout(() => setIsMockLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const chatsQuery = useChatsQuery(!isMockMode());
  const unmatchMutation = useUnmatchMutation();
  const blockMutation = useBlockUserMutation();
  const reportMutation = useReportUserMutation();

  const [mockChats, setMockChats] = useState(CHATS);

  const chats = isMockMode()
    ? mockChats
    : (chatsQuery.data ?? []).map(mapChatListItemToChat);
  const isLoadingChats = isMockMode() ? isMockLoading : chatsQuery.isLoading;

  const [unmatchChatId, setUnmatchChatId] = useState<null | number>(null);
  const [blockChatId, setBlockChatId] = useState<null | number>(null);
  const [reportChatId, setReportChatId] = useState<null | number>(null);
  const unmatchChat = chats.find((chat) => chat.id === unmatchChatId);
  const blockChat = chats.find((chat) => chat.id === blockChatId);
  const reportChat = chats.find((chat) => chat.id === reportChatId);

  const [filter, setFilter] = useState<ChatFilterKey>("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Открытая свайпом строка — только одна за раз, как в большинстве
  // мессенджеров: открыть новую значит закрыть предыдущую.
  const [openChatId, setOpenChatId] = useState<null | number>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    searchInputRef.current?.blur();
  };

  // Крестик: если есть текст — просто очищает поле, курсор остаётся в
  // инпуте. Если поле уже пустое — закрывает поиск целиком.
  const handleSearchClear = () => {
    if (searchQuery) {
      setSearchQuery("");
      searchInputRef.current?.focus();
    } else {
      closeSearch();
    }
  };

  useClickAway(filterMenuRef, () => {
    if (isFilterMenuOpen) setIsFilterMenuOpen(false);
  });

  const visibleChats = chats.filter((chat) => {
    if (
      searchQuery.trim() &&
      !chat.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ) {
      return false;
    }
    if (filter === "unread") return chat.unread;
    if (filter === "online") return chat.online;
    if (filter === "waiting") return chat.yourTurn;
    return true;
  });

  const confirmUnmatch = async () => {
    if (isMockMode()) {
      setMockChats((prev) => prev.filter((chat) => chat.id !== unmatchChatId));
      setUnmatchChatId(null);
      return;
    }
    if (!unmatchChat) {
      setUnmatchChatId(null);
      return;
    }
    setUnmatchChatId(null);
    try {
      await unmatchMutation.mutateAsync(unmatchChat.partnerId);
    } catch {
      toast.error("Не получилось удалить пару. Попробуй ещё раз");
    }
  };

  const confirmBlock = async () => {
    if (isMockMode()) {
      setMockChats((prev) => prev.filter((chat) => chat.id !== blockChatId));
      setBlockChatId(null);
      return;
    }
    if (!blockChat) {
      setBlockChatId(null);
      return;
    }
    setBlockChatId(null);
    try {
      await blockMutation.mutateAsync(blockChat.partnerId);
    } catch {
      toast.error("Не получилось заблокировать. Попробуй ещё раз");
    }
  };

  const reportFromUnmatch = () => {
    setReportChatId(unmatchChatId);
    setUnmatchChatId(null);
  };

  const reportFromBlock = () => {
    setReportChatId(blockChatId);
    setBlockChatId(null);
  };

  const submitReport = async (reason: string) => {
    setReportChatId(null);
    if (isMockMode() || !reportChat) return;
    try {
      await reportMutation.mutateAsync({
        reason,
        reportedId: reportChat.partnerId,
      });
      toast.success("Жалоба отправлена");
    } catch {
      toast.error("Не получилось отправить жалобу");
    }
  };

  const handleRefresh = async () => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 700));
    } else {
      await chatsQuery.refetch();
    }
    toast.success("Обновлено");
  };

  return (
    <div className="flex h-dvh flex-col overflow-x-hidden bg-[#FAF9FD] text-[#1C1E24]">
      {/* Верхний бар */}
      <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div className="relative h-9">
          <AnimatePresence initial={false}>
            {isSearchOpen ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center gap-2 rounded-full bg-[#F2F1F3] px-4"
              >
                <Search className="size-5 shrink-0 text-[#6B7280]" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Найти"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#1C1E24] outline-none placeholder:text-[#6B7280]"
                />
                <button
                  type="button"
                  onClick={handleSearchClear}
                  aria-label="Очистить"
                  className="flex size-5 shrink-0 items-center justify-center text-[#6B7280]"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-between"
              >
                <h1 className="text-2xl font-extrabold">Чаты</h1>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Поиск"
                  className="flex size-9 items-center justify-center text-[#1C1E24]"
                >
                  <Search className="size-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Лайки и пары */}
      <div className="px-4 pb-2">
        <h2 className="text-base font-medium text-[#1C1E24]">Лайки и пары</h2>
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
                    : "border-2 border-white",
                )}
              />
              {index === 0 && (
                <span className="absolute border-2 border-[#faf9fd] -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white">
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
        <h2 className="text-base font-medium">Сообщения</h2>
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

      {isLoadingChats ? (
        <div className="flex-1 divide-y divide-[#E4E7EC] overflow-y-auto">
          {Array.from({ length: CHAT_ROW_SKELETON_COUNT }).map((_, index) => (
            <ChatRowSkeleton key={index} />
          ))}
        </div>
      ) : chats.length === 0 ? (
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
          onClick={() => void confirmUnmatch()}
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
          onClick={() => void confirmBlock()}
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
              onClick={() => void submitReport(reason)}
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
