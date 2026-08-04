import { useEffect, useRef, useState } from "react";

import { connectSocket } from "@/shared/api";

import {
  type ChatMessage,
  ChatMessageSchema,
  TypingEventSchema,
  UserStatusEventSchema,
} from "./types";

// Если stop_typing потеряется (обрыв связи и т.п.), сами снимаем индикатор
// печати через паузу — иначе он мог бы повиснуть навсегда.
const TYPING_TIMEOUT_MS = 3000;

type PartnerStatus = { lastSeenAt: null | number; online: boolean };

/**
 * Живое соединение на конкретную комнату чата: подключается, вступает в
 * комнату, копит входящие сообщения и статус партнёра (печатает/онлайн) по
 * событиям сокета. Начальную историю сообщений и снэпшот статуса при заходе
 * даёт REST (useChatMessagesQuery/useChatQuery) — сокет только доливает то,
 * что произошло, пока страница открыта.
 */
export function useChatSocket(chatId: null | number, partnerId: null | number) {
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<null | PartnerStatus>(
    null,
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (chatId === null) return;
    const socket = connectSocket();
    socket.emit("join_chat", chatId);

    const handleNewMessage = (payload: unknown) => {
      const parsed = ChatMessageSchema.safeParse(payload);
      if (parsed.success && parsed.data.chat_id === chatId) {
        setLiveMessages((prev) => [...prev, parsed.data]);
      }
    };

    const handleTyping = (payload: unknown) => {
      const parsed = TypingEventSchema.safeParse(payload);
      if (!parsed.success) return;
      if (parsed.data.chatId !== chatId || parsed.data.userId !== partnerId) {
        return;
      }
      setPartnerTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => setPartnerTyping(false),
        TYPING_TIMEOUT_MS,
      );
    };

    const handleStopTyping = (payload: unknown) => {
      const parsed = TypingEventSchema.safeParse(payload);
      if (!parsed.success) return;
      if (parsed.data.chatId !== chatId || parsed.data.userId !== partnerId) {
        return;
      }
      clearTimeout(typingTimeoutRef.current);
      setPartnerTyping(false);
    };

    const handleUserStatus = (payload: unknown) => {
      const parsed = UserStatusEventSchema.safeParse(payload);
      if (!parsed.success || parsed.data.userId !== partnerId) return;
      setPartnerStatus({
        lastSeenAt: parsed.data.lastSeenAt ?? null,
        online: parsed.data.online,
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("user_status", handleUserStatus);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, partnerId]);

  const sendMessage = (text: string) => {
    if (chatId === null) return;
    connectSocket().emit("send_message", { chatId, text });
  };

  const notifyTyping = () => {
    if (chatId === null) return;
    connectSocket().emit("typing", { chatId });
  };

  const notifyStopTyping = () => {
    if (chatId === null) return;
    connectSocket().emit("stop_typing", { chatId });
  };

  return {
    liveMessages,
    notifyStopTyping,
    notifyTyping,
    partnerStatus,
    partnerTyping,
    sendMessage,
  };
}
