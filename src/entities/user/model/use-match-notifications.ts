import { useEffect, useRef } from "react";

import { connectSocket } from "@/shared/api";

import { type NewMatchEvent, NewMatchEventSchema } from "./types";

/**
 * Событие new_match приходит ОБЕИМ сторонам сразу (см. bakai-server
 * POST /api/swipes/like/:userId), а не только тому, кто только что лайкнул —
 * поэтому это не привязано к конкретной странице (ленте/чату), а слушается
 * глобально, пока пользователь залогинен, вне зависимости от того, где он
 * сейчас находится в приложении.
 */
export function useMatchNotifications(
  enabled: boolean,
  onNewMatch: (event: NewMatchEvent) => void,
) {
  const callbackRef = useRef(onNewMatch);

  useEffect(() => {
    callbackRef.current = onNewMatch;
  }, [onNewMatch]);

  useEffect(() => {
    if (!enabled) return;
    const socket = connectSocket();

    const handleNewMatch = (payload: unknown) => {
      const parsed = NewMatchEventSchema.safeParse(payload);
      if (parsed.success) callbackRef.current(parsed.data);
    };

    socket.on("new_match", handleNewMatch);
    return () => {
      socket.off("new_match", handleNewMatch);
    };
  }, [enabled]);
}
