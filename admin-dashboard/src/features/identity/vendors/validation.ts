import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";

function m() {
  return getZodMessages();
}

export const createVendorSchema = z.object({
  userId: z.string().uuid(m().required),
  companyName: z.string().min(1, m().required).max(200),
  taxId: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  commissionRate: z.number().min(0).max(1).default(0.1),
});
export type CreateVendorForm = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = z.object({
  companyName: z.string().min(1, m().required).max(200),
  taxId: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  commissionRate: z.number().min(0).max(1),
});
export type UpdateVendorForm = z.infer<typeof updateVendorSchema>;
