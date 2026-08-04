import { z } from "zod";

// GET /api/options — списки вариантов для боттомшитов (язык любви, религия,
// спорт и т.д.), управляются из /admin/options на бэке.
export const OptionsSchema = z.record(z.string(), z.array(z.string()));

export type Options = z.infer<typeof OptionsSchema>;
