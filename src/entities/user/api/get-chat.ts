import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type ChatDetail, ChatDetailSchema } from "../model/types";

export function useChatQuery(chatId: null | number) {
  return useQuery({
    enabled: chatId !== null,
    queryFn: async () =>
      ChatDetailSchema.parse(await api.get<ChatDetail>(`/api/chats/${chatId}`)),
    queryKey: ["chats", chatId],
  });
}
