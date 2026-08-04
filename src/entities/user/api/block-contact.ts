import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

// POST /api/blocks/by-phone — блокировка по номеру из контактов/ручного
// ввода ("Скрыться от знакомых"), в отличие от useBlockUserMutation (блок
// уже известного по id пользователя из чата/лайков/ленты).
export function useBlockContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, phone }: { name: string; phone: string }) =>
      api.post<{ ok: true }>("/api/blocks/by-phone", { name, phone }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blocks"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}
