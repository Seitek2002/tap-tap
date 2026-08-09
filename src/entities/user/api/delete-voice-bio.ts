import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useDeleteVoiceBioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<{ ok: boolean }>("/api/profile/voice-bio"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
