import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

// DELETE /api/blocks/:id — id либо реальный userId (был зарегистрирован),
// либо отрицательный id ожидающей записи по номеру — см. BlockedContact.
export function useUnblockContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete<{ ok: true }>(`/api/blocks/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blocks"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
