import type { ChatListItem } from "@/entities/user";

import { resolveUploadUrl } from "@/shared/api";
import person1 from "@/shared/assets/images/person-1.jpg";

import type { Chat } from "./chats";

// Пока у собеседника нет ни одного загруженного фото.
const FALLBACK_PHOTO = person1;

export function mapChatListItemToChat(item: ChatListItem): Chat {
  return {
    id: item.id,
    lastMessage: item.lastMsg,
    name: item.partner.name || "Без имени",
    online: item.partner.online === 1,
    photo: item.partner.photo
      ? resolveUploadUrl(item.partner.photo)
      : FALLBACK_PHOTO,
    unread: item.unread > 0,
    yourTurn: item.yourTurn,
  };
}
