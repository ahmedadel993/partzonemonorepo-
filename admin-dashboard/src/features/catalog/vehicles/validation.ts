import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";
import { slugRegex } from "../shared/validation";

function m() { return getZodMessages(); }

export const makeSchema = z.object({
  name: z.string().min(1, m().required).max(200),
  slug: z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
});
export type MakeForm = z.infer<typeof makeSchema>;

export const makeEditSchema = z.object({
  name: z.string().min(1, m().required).max(200),
});
export type MakeEditForm = z.infer<typeof makeEditSchema>;

export const modelSchema = z.object({
  name: z.string().min(1, m().required).max(200),
  slug: z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
});
export type ModelForm = z.infer<typeof modelSchema>;

export const modelEditSchema = z.object({
  name: z.string().min(1, m().required).max(200),
});
export type ModelEditForm = z.infer<typeof modelEditSchema>;
