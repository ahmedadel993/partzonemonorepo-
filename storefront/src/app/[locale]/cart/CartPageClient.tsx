"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/shared/stores/useCartStore";
import { getCart } from "@/modules/cart/actions/cartActions";
import { CartItemRow } from "@/modules/cart/components/CartItemRow";
import { CouponInput } from "@/modules/cart/components/CouponInput";

interface Props { locale: string }

export function CartPageClient({ locale }: Props) {
  const { cart, setCart } = useCartStore();
  const [loading, setLoading] = useState(!cart);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (cart) { setLoading(false); return; }
    getCart().then((c) => { setCart(c); setLoading(false); });
  }, [cart, setCart]);

  const SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 15;
  const subTotal = cart?.subTotal ?? 0;
  const afterDiscount = subTotal - discountAmount;
  const shippingFee = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shippingFee;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-surface-alt rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted opacity-30" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <div>
          <p className="text-lg font-semibold text-text">سلتك فارغة</p>
          <p className="text-sm text-text-muted mt-1">أضف منتجات لتبدأ التسوق</p>
        </div>
        <Link href={`/${locale}`} className="h-11 px-6 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors inline-flex items-center">
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items */}
      <div className="lg:col-span-2 space-y-1">
        {cart.items.map((item) => <CartItemRow key={item.id} item={item} />)}

        <div className="pt-6">
          <h2 className="text-sm font-medium text-text mb-3">كوبون الخصم</h2>
          <CouponInput
            subTotal={subTotal}
            onApplied={(_, amount) => setDiscountAmount(amount)}
            onRemoved={() => setDiscountAmount(0)}
          />
        </div>
      </div>

      {/* Summary sidebar */}
      <aside className="bg-surface-alt rounded-xl p-5 space-y-4 border border-border lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-base font-semibold text-text">ملخص الطلب</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">المجموع الفرعي</span>
            <span className="text-text" dir="ltr">{subTotal.toFixed(2)} ج.م</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>الخصم</span>
              <span dir="ltr">- {discountAmount.toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-text-muted">رسوم الشحن (تقديرية)</span>
            <span className={shippingFee === 0 ? "text-success" : "text-text"}>
              {shippingFee === 0 ? "مجاناً" : `${shippingFee.toFixed(2)} ج.م`}
            </span>
          </div>
          {shippingFee > 0 && (
            <p className="text-xs text-text-muted">شحن مجاني عند الطلب فوق {SHIPPING_THRESHOLD} ج.م</p>
          )}
        </div>

        <div className="flex justify-between pt-3 border-t border-border font-semibold">
          <span className="text-text">الإجمالي</span>
          <span className="text-accent" dir="ltr">{total.toFixed(2)} ج.م</span>
        </div>

        <Link
          href={`/${locale}/checkout`}
          className="w-full h-11 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors flex items-center justify-center text-sm"
        >
          متابعة للدفع
        </Link>
        <Link
          href={`/${locale}`}
          className="w-full h-9 border border-border text-text text-sm rounded-lg hover:bg-surface-alt transition-colors flex items-center justify-center"
        >
          متابعة التسوق
        </Link>
      </aside>
    </div>
  );
}
