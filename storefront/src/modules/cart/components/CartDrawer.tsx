"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCartStore } from "@/shared/stores/useCartStore";
import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const locale = useLocale();
  const router = useRouter();
  const { isDrawerOpen, closeDrawer, cart, itemCount } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    if (isDrawerOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        className={[
          "fixed top-0 end-0 z-50 h-full w-full max-w-sm bg-surface border-s border-border shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text">
            سلة المشتريات {count > 0 && <span className="text-text-muted font-normal">({count})</span>}
          </h2>
          <button onClick={closeDrawer} aria-label="إغلاق" className="p-2 rounded hover:bg-surface-alt transition-colors text-text-muted hover:text-text text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted opacity-40" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p className="text-text-muted text-sm">سلتك فارغة</p>
              <button onClick={closeDrawer} className="text-sm text-accent hover:underline">ابدأ التسوق</button>
            </div>
          ) : (
            cart.items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="shrink-0 border-t border-border px-4 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">المجموع الفرعي</span>
              <span className="font-semibold text-text" dir="ltr">{cart.subTotal.toFixed(2)} ج.م</span>
            </div>
            <button
              onClick={() => { closeDrawer(); router.push(`/${locale}/checkout`); }}
              className="w-full h-11 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors text-sm"
            >
              إتمام الطلب
            </button>
            <button
              onClick={() => { closeDrawer(); router.push(`/${locale}/cart`); }}
              className="w-full h-9 border border-border text-text text-sm rounded-lg hover:bg-surface-alt transition-colors"
            >
              عرض السلة الكاملة
            </button>
          </div>
        )}
      </div>
    </>
  );
}
