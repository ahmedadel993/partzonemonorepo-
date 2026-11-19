import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";
import { slugRegex } from "../shared/validation";

function m() { return getZodMessages(); }

export const categorySchema = z.object({
  name: z.string().min(1, m().required).max(200),
  slug: z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
  imageUrl: z.string().url(m().urlInvalid).nullish().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
});

export type CategoryForm = z.infer<typeof categorySchema>;
