import { z } from "zod";
import { getZodMessages } from "@/i18n/zodMessages";
import { slugRegex } from "../shared/validation";

function m() { return getZodMessages(); }

export const productSchema = z.object({
  sku:           z.string().min(1, m().required).max(100),
  oemNumber:     z.string().max(100),
  slug:          z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
  nameAr:        z.string().min(1, m().required).max(300),
  descriptionAr: z.string().max(2000),
  nameEn:        z.string().max(300),
  condition:     z.enum(["Original", "Aftermarket", "Used"]),
  brandId:       z.string().uuid(m().selectBrand),
  categoryId:    z.string().uuid(m().selectCategory),
  priceAmount:   z.coerce.number().min(0.01, m().pricePositive),
  priceCurrency: z.string().min(1),
  stock:         z.coerce.number().int().min(0),
});

export type ProductForm = z.infer<typeof productSchema>;

export const editProductSchema = z.object({
  slug:          z.string().min(1, m().required).max(200).regex(slugRegex, m().slugInvalid),
  nameAr:        z.string().min(1, m().required).max(300),
  descriptionAr: z.string().max(2000),
  nameEn:        z.string().max(300),
  condition:     z.enum(["Original", "Aftermarket", "Used"]),
  brandId:       z.string().uuid(m().selectBrand),
  categoryId:    z.string().uuid(m().selectCategory),
  priceAmount:   z.coerce.number().min(0.01, m().pricePositive),
  priceCurrency: z.string().min(1),
});

export type EditProductForm = z.infer<typeof editProductSchema>;
