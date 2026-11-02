"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { CartIconButton } from "@/shared/ui/CartIconButton";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="shrink-0">
            {/* [LOGO PLACEHOLDER — awaiting partzone-logo.png] */}
            <span className="text-accent font-bold text-xl">PartZone</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <input
              type="search"
              placeholder={t("search")}
              aria-label={t("search")}
              className="w-full h-10 px-4 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Choose car button */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-md border border-border text-text-muted text-sm hover:border-accent hover:text-text transition-colors"
          >
            {t("chooseCar")}
          </button>

          {/* Cart icon with badge — opens drawer */}
          <CartIconButton label={t("cart")} />
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
