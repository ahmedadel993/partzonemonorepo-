import type { Lang } from "./translations";

const messages = {
  ar: {
    required: "مطلوب",
    slugInvalid: "lowercase، أرقام، شرطات فقط",
    urlInvalid: "رابط غير صالح",
    selectBrand: "اختر الماركة",
    selectCategory: "اختر الفئة",
    pricePositive: "السعر > 0",
    diffNotZero: "يجب ألّا يكون الفرق صفراً",
    configRequired: "Config مطلوب",
    typeRequired: "النوع مطلوب",
    codeRequired: "الكود مطلوب",
    valuePositive: "القيمة يجب أن تكون موجبة",
    startRequired: "تاريخ البداية مطلوب",
    endRequired: "تاريخ الانتهاء مطلوب",
    keyInvalid: "أحرف صغيرة وأرقام وشرطة سفلية فقط",
    emailInvalid: "بريد إلكتروني غير صالح",
  },
  en: {
    required: "Required",
    slugInvalid: "Lowercase, numbers, hyphens only",
    urlInvalid: "Invalid URL",
    selectBrand: "Select a brand",
    selectCategory: "Select a category",
    pricePositive: "Price must be > 0",
    diffNotZero: "Difference must not be zero",
    configRequired: "Config is required",
    typeRequired: "Type is required",
    codeRequired: "Code is required",
    valuePositive: "Value must be positive",
    startRequired: "Start date is required",
    endRequired: "End date is required",
    keyInvalid: "Lowercase letters, numbers, underscores only",
    emailInvalid: "Invalid email address",
  },
} as const;

export type ZodMessageKey = keyof (typeof messages)["en"];

function getCurrentLang(): Lang {
  if (typeof localStorage === "undefined") return "ar";
  try {
    const stored = localStorage.getItem("admin-lang");
    if (stored === "ar" || stored === "en") return stored;
  } catch {}
  return "ar";
}

export function getZodMessages(): (typeof messages)["en"] {
  return messages[getCurrentLang()];
}
