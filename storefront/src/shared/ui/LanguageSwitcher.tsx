"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/shared/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="h-10 px-3 rounded-md border border-border text-text-muted text-sm font-medium hover:border-accent hover:text-text transition-colors shrink-0"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "ع"}
    </button>
  );
}
