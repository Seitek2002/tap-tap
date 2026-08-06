import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { useMatchNotifications } from "@/entities/user";

import { MatchNotificationToast } from "./match-notification-toast";

const TOAST_DURATION = 6000;

/**
 * Глобальный слушатель "новая пара" — смонтирован один раз в PageTransition
 * (см. app/page-transition.tsx), поэтому уведомление всплывает на любой
 * странице, а не только на ленте свайпов, где сам мэтч мог и не произойти
 * (см. NewMatchEvent — прилетает обеим сторонам, а не только тому, кто
 * только что лайкнул).
 */
export const MatchNotifications = ({ enabled }: { enabled: boolean }) => {
  const navigate = useNavigate();

  useMatchNotifications(enabled, (event) => {
    toast.custom(
      (t) => (
        <MatchNotificationToast
          onClick={() => navigate(`/chat/${event.chatId}`)}
          partner={event.partner}
          t={t}
        />
      ),
      { duration: TOAST_DURATION, position: "top-center" },
    );
  });

  return null;
};
