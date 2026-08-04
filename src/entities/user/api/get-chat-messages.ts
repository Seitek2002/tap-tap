import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type ChatMessage, ChatMessageSchema } from "../model/types";

const ChatMessageListSchema = z.array(ChatMessageSchema);

export function useChatMessagesQuery(chatId: null | number) {
  return useQuery({
    enabled: chatId !== null,
    queryFn: async () =>
      ChatMessageListSchema.parse(
        await api.get<ChatMessage[]>(`/api/chats/${chatId}/messages`),
      ),
    queryKey: ["chats", chatId, "messages"],
  });
}
