import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";

function m() {
  return getZodMessages();
}

export const createUserSchema = z.object({
  email: z.string().min(1, () => m().required).email(() => m().emailInvalid),
  password: z.string().min(8, () => m().required),
  firstName: z.string().min(1, () => m().required).max(100),
  lastName: z.string().min(1, () => m().required).max(100),
  role: z.string().min(1, () => m().required),
});
export type CreateUserForm = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1, () => m().required).max(100),
  lastName: z.string().min(1, () => m().required).max(100),
  phoneNumber: z.string().optional().or(z.literal("")),
  role: z.string().min(1, () => m().required),
});
export type UpdateUserForm = z.infer<typeof updateUserSchema>;

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, () => m().required).max(100),
  lastName: z.string().min(1, () => m().required).max(100),
  phoneNumber: z.string().optional().or(z.literal("")),
});
export type UpdateCustomerForm = z.infer<typeof updateCustomerSchema>;
