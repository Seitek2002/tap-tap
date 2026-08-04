import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type ChatMessage, ChatMessageSchema } from "../model/types";

export function useUploadChatAttachmentMutation(chatId: null | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return ChatMessageSchema.parse(
        await api.post<ChatMessage>(
          `/api/chats/${chatId}/attachments`,
          formData,
        ),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
