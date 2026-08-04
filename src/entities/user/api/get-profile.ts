import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type User, UserSchema } from "../model/types";

export function useProfileQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => UserSchema.parse(await api.get<User>("/api/profile")),
    queryKey: ["profile"],
  });
}
