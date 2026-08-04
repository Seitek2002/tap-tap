import { z } from "zod";

export const AuthResponseSchema = z.object({
  token: z.string(),
  userId: z.number(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
