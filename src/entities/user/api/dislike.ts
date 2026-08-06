import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useDislikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      api.post<{ match: false; ok: true }>(`/api/swipes/dislike/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
