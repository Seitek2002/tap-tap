import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import type { NotificationPreferences } from "../model/types";

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      api.put<{ ok: true }>("/api/notifications/preferences", prefs),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notificationPreferences"],
      });
    },
  });
}
