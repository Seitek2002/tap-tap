import { useMutation } from "@tanstack/react-query";

import { api } from "@/shared/api";

export function useDislikeMutation() {
  return useMutation({
    mutationFn: (userId: number) =>
      api.post<{ match: false; ok: true }>(`/api/swipes/dislike/${userId}`),
  });
}
