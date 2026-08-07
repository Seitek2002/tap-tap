import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useDeleteProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (index: number) =>
      api.delete<{ photos: string[] }>(`/api/profile/photos/${index}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
