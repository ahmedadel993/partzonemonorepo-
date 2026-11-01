"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
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

        {/* Cart */}
        <Link
          href={`/${locale}/cart`}
          aria-label={t("cart")}
          className="relative p-2 rounded hover:bg-surface-alt transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </Link>
      </div>
    </header>
  );
}
