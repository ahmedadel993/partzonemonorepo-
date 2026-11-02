"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartIconButton } from "@/shared/ui/CartIconButton";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { VehiclePickerModal } from "@/shared/ui/VehiclePickerModal";
import { useVehicleStore } from "@/shared/stores/useVehicleStore";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { selectedVehicle, clearVehicle } = useVehicleStore();

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim())
                  router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
              }}
              placeholder={t("search")}
              aria-label={t("search")}
              className="w-full h-10 px-4 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Choose car / selected vehicle chip */}
          {selectedVehicle ? (
            <div className="hidden sm:flex items-center gap-1 h-10 px-3 rounded-md border border-accent bg-accent/5 text-text text-sm">
              <span className="truncate max-w-[140px]">
                {selectedVehicle.makeName} {selectedVehicle.modelName}
              </span>
              <button
                type="button"
                onClick={clearVehicle}
                aria-label="مسح الاختيار"
                className="text-text-muted hover:text-danger transition-colors ms-1 text-base leading-none"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-md border border-border text-text-muted text-sm hover:border-accent hover:text-text transition-colors"
            >
              {t("chooseCar")}
            </button>
          )}

          {/* Account icon */}
          <Link href={`/${locale}/account`} aria-label="حسابي" className="text-text-muted hover:text-text transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>

          {/* Cart icon with badge — opens drawer */}
          <CartIconButton label={t("cart")} />
        </div>
      </header>
      <CartDrawer />
      <VehiclePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        locale={locale}
      />
    </>
  );
}
