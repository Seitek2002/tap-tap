import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api";

import type { ProfileUpdate } from "../model/types";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: ProfileUpdate) =>
      api.put<{ ok: true }>("/api/profile", update),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
