import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";
import { slugRegex } from "../shared/validation";

function m() { return getZodMessages(); }

export const brandSchema = z.object({
  name: z.string().min(1, m().required).max(200),
  slug: z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
  logoUrl: z.string().url(m().urlInvalid).nullish().or(z.literal("")),
});

export type BrandForm = z.infer<typeof brandSchema>;
