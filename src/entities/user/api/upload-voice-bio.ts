import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useUploadVoiceBioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("audio", file);
      return api.post<{ url: string }>("/api/profile/voice-bio", formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
