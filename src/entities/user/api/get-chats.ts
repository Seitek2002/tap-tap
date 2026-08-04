import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/shared/api";

import { type ChatListItem, ChatListItemSchema } from "../model/types";

const ChatListSchema = z.array(ChatListItemSchema);

export function useChatsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      ChatListSchema.parse(await api.get<ChatListItem[]>("/api/chats")),
    queryKey: ["chats"],
  });
}
