import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import {
  type NotificationPreferences,
  NotificationPreferencesSchema,
} from "../model/types";

export function useNotificationPreferencesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () =>
      NotificationPreferencesSchema.parse(
        await api.get<Partial<NotificationPreferences>>(
          "/api/notifications/preferences",
        ),
      ),
    queryKey: ["notificationPreferences"],
  });
}
