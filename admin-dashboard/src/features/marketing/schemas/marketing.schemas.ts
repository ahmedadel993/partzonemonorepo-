import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";

function m() { return getZodMessages(); }

export const pageBlockFormSchema = z.object({
  type: z.string().min(1, m().typeRequired),
  sortOrder: z.coerce.number().min(0),
  config: z.string().min(2, m().configRequired),
  bindingType: z.string().min(1),
  targetId: z.string().optional(),
  targetUrl: z.string().optional(),
  activeFrom: z.string().optional(),
  activeTo: z.string().optional(),
  arTitle: z.string().optional(),
  arSubtitle: z.string().optional(),
  arCtaText: z.string().optional(),
  enTitle: z.string().optional(),
  enSubtitle: z.string().optional(),
  enCtaText: z.string().optional(),
});

export type PageBlockFormValues = z.infer<typeof pageBlockFormSchema>;

export const couponFormSchema = z.object({
  code: z.string().min(1, m().codeRequired).max(50),
  discountType: z.string().min(1),
  value: z.coerce.number().positive(m().valuePositive),
  minOrderAmount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().min(0),
  perUserLimit: z.coerce.number().min(0),
  validFrom: z.string().min(1, m().startRequired),
  validTo: z.string().min(1, m().endRequired),
  isActive: z.boolean(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;
