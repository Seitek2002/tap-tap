import { Ban, Flag, HeartCrack } from "lucide-react";
import { type PanInfo, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Chat } from "../model/chats";

type ChatRowProps = {
  chat: Chat;
  isOpen: boolean;
  onBlock: () => void;
  onNavigate: () => void;
  onOpenChange: (open: boolean) => void;
  onReport: () => void;
  onUnmatch: () => void;
};

// После какой доли ширины блока действий свайп считается «открыть» — иначе
// пользователю пришлось бы тянуть строку до конца самому, чтобы увидеть
// все три кнопки.
const OPEN_THRESHOLD_RATIO = 0.4;
const OPEN_VELOCITY_THRESHOLD = 500;

/** Строка чата со свайп-действиями: тянешь влево — снапается полностью открытой. */
export const ChatRow = ({
  chat,
  isOpen,
  onBlock,
  onNavigate,
  onOpenChange,
  onReport,
  onUnmatch,
}: ChatRowProps) => {
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsWidth, setActionsWidth] = useState(0);
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    if (actionsRef.current) {
      setActionsWidth(actionsRef.current.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    animate(x, isOpen ? -actionsWidth : 0, {
      damping: 30,
      stiffness: 300,
      type: "spring",
    });
  }, [isOpen, actionsWidth, x]);

  const handleDragEnd = (
    _event: MouseEvent | PointerEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const openThreshold = actionsWidth * OPEN_THRESHOLD_RATIO;
    const shouldOpen =
      info.offset.x < -openThreshold ||
      info.velocity.x < -OPEN_VELOCITY_THRESHOLD;
    onOpenChange(shouldOpen);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Действия — под контентом строки, открываются свайпом влево */}
      <div
        ref={actionsRef}
        className="absolute inset-y-0 right-0 flex shrink-0 items-center gap-3 pr-4"
      >
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onUnmatch}
            className="flex py-1.5 w-18 items-center justify-center rounded-2xl bg-primary text-white"
          >
            <HeartCrack size={16} />
          </button>
          <span className="text-xs whitespace-nowrap text-[#1C1E24]">
            Отменить лайк
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onBlock}
            className="flex py-1.5 w-18 items-center justify-center rounded-2xl bg-[#1C1E24] text-white"
          >
            <Ban size={16} />
          </button>
          <span className="text-xs whitespace-nowrap text-[#1C1E24]">
            Заблокировать
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onReport}
            className="flex py-1.5 w-18 items-center justify-center rounded-2xl bg-red-500 text-white"
          >
            <Flag size={16} />
          </button>
          <span className="text-xs whitespace-nowrap text-[#1C1E24]">
            Пожаловаться
          </span>
        </div>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        className="relative bg-[#FAF9FD]"
      >
        <button
          type="button"
          onClick={() => (isOpen ? onOpenChange(false) : onNavigate())}
          className="flex w-full shrink-0 items-center gap-3 px-4 py-3 text-left"
        >
          <div className="relative shrink-0">
            <img
              src={chat.photo}
              alt=""
              className="size-14 rounded-full object-cover"
            />
            {/* Один статус-бэйдж сверху, не два одновременно — непрочитанное
                важнее и перекрывает индикатор онлайна. */}
            {chat.unread ? (
              <span className="absolute top-0 right-0 size-3 rounded-full bg-red-500 ring-2 ring-[#FAF9FD]" />
            ) : (
              chat.online && (
                <span className="absolute top-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-[#FAF9FD]" />
              )
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-bold">{chat.name}</h3>
              {chat.yourTurn && (
                <span className="shrink-0 rounded-full bg-[#1C1E24] px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-white">
                  Твоя очередь
                </span>
              )}
            </div>
            <p className="truncate text-sm text-[#6B7280]">
              {chat.lastMessage}
            </p>
          </div>
        </button>
      </motion.div>
    </div>
  );
};
