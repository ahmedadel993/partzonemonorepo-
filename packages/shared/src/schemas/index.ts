import { z } from "zod";

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default("EGP"),
});
export type Money = z.infer<typeof MoneySchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const SlugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a valid slug");

export const PartConditionSchema = z.enum(["Original", "Aftermarket", "Used"]);
export type PartCondition = z.infer<typeof PartConditionSchema>;

export const UserRoleSchema = z.enum([
  "Customer",
  "Admin",
  "Vendor",
  "ContentManager",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const BindingTypeSchema = z.enum([
  "None",
  "Category",
  "Brand",
  "Product",
  "VehicleMake",
  "VehicleModel",
  "Url",
]);
export type BindingType = z.infer<typeof BindingTypeSchema>;
