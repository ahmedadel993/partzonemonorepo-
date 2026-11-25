import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
});
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const addressSchema = z.object({
  label: z.string().min(1),
  streetLine1: z.string().min(1),
  streetLine2: z.string().optional(),
  city: z.string().min(1),
  governorate: z.string().min(1),
  postalCode: z.string().min(1),
  isDefault: z.boolean(),
});
export type AddressForm = z.infer<typeof addressSchema>;
