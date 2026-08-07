import { z } from "zod";

// GET /api/options — списки вариантов для боттомшитов (язык любви, религия,
// спорт и т.д.), управляются из /admin/options на бэке.
export const OptionsSchema = z.record(z.string(), z.array(z.string()));

export type Options = z.infer<typeof OptionsSchema>;

// GET /api/field-settings — какие вопросы анкеты включены, кому их
// показывать (по полу) и каким виджетом отвечать. Тот же field_key, что и
// в Options выше (варианты ответа) — управляется из того же /admin/options.
export const FieldTypeSchema = z.enum(["bottomsheet", "pill", "text"]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FieldConfigSchema = z.object({
  enabled: z.boolean(),
  gender: z.enum(["all", "men", "women"]),
  type: FieldTypeSchema,
});
export type FieldConfig = z.infer<typeof FieldConfigSchema>;

export const FieldSettingsSchema = z.record(z.string(), FieldConfigSchema);
export type FieldSettings = z.infer<typeof FieldSettingsSchema>;
