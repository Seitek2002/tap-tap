import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useUploadProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      return api.post<{ photos: string[]; url: string }>(
        "/api/profile/photos",
        formData,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
