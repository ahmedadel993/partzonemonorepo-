"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCartStore } from "@/shared/stores/useCartStore";
import { placeOrder } from "@/modules/checkout/actions/checkoutActions";
import { clearCart } from "@/modules/cart/actions/cartActions";
import { AddressSelector } from "./AddressSelector";
import { CouponInput } from "@/modules/cart/components/CouponInput";
import type { Address } from "@/modules/auth/types";
import type { ShippingAddressInput } from "@/modules/checkout/types";

const SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 15;

interface Props {
  addresses: Address[];
}

export function CheckoutForm({ addresses }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { cart, setCart } = useCartStore();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddressInput | null>(
    addresses[0]
      ? { fullName: addresses[0].label, phone: "", addressLine1: addresses[0].streetLine1, addressLine2: addresses[0].streetLine2 ?? undefined, city: addresses[0].city, governorate: addresses[0].governorate, postalCode: addresses[0].postalCode }
      : null
  );
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subTotal = cart?.subTotal ?? 0;
  const afterDiscount = subTotal - discountAmount;
  const shippingFee = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) { setError("يرجى اختيار عنوان الشحن"); return; }
    if (!cart || cart.items.length === 0) { setError("السلة فارغة"); return; }
    setError(null);

    startTransition(async () => {
      const result = await placeOrder({
        shippingAddress,
        couponCode,
        discountAmount,
        notes: notes.trim() || undefined,
        items: cart.items.map((i) => ({
          productId: i.productId,
          sku: i.sku,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      await clearCart();
      setCart(null);
      router.push(`/${locale}/orders/${result.orderId}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Shipping address */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">١. عنوان الشحن</h2>
          <AddressSelector
            initialAddresses={addresses}
            onSelect={setShippingAddress}
            selectedId={null}
          />
        </section>

        {/* Order summary */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">٢. ملخص الطلب</h2>
          {!cart || cart.items.length === 0 ? (
            <p className="text-sm text-text-muted">السلة فارغة</p>
          ) : (
            <ul className="divide-y divide-border">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {item.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded shrink-0" />
                    : <div className="w-12 h-12 bg-surface-alt rounded shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text line-clamp-1">{item.name}</p>
                    <p className="text-xs text-text-muted font-mono" dir="ltr">{item.sku} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-text shrink-0" dir="ltr">{item.subTotal.toFixed(2)} ج.م</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Coupon */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">٣. كوبون الخصم</h2>
          <CouponInput
            subTotal={subTotal}
            onApplied={(code, amount) => { setCouponCode(code); setDiscountAmount(amount); }}
            onRemoved={() => { setCouponCode(undefined); setDiscountAmount(0); }}
          />
        </section>

        {/* Payment method */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">٤. طريقة الدفع</h2>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-accent bg-accent/5 cursor-pointer">
            <input type="radio" name="payment" defaultChecked readOnly className="accent-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-text">الدفع عند الاستلام</p>
              <p className="text-xs text-text-muted mt-0.5">ادفع نقداً عند استلام طلبك</p>
            </div>
          </label>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border opacity-50 cursor-not-allowed">
            <input type="radio" name="payment" disabled className="accent-[var(--color-accent)]" />
            <div>
              <p className="text-sm font-medium text-text">بطاقة ائتمانية / مدى</p>
              <span className="inline-block text-[10px] bg-surface-alt text-text-muted px-1.5 py-0.5 rounded font-medium mt-0.5">متاح قريباً</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">٥. ملاحظات (اختياري)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="أي تعليمات خاصة للتوصيل..."
            className="w-full px-3 py-2 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </section>
      </div>

      {/* Sidebar summary */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="bg-surface-alt rounded-xl p-5 space-y-4 border border-border">
          <h2 className="text-base font-semibold text-text">ملخص التكلفة</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">المجموع الفرعي</span>
              <span className="text-text font-medium" dir="ltr">{subTotal.toFixed(2)} ج.م</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>خصم الكوبون</span>
                <span dir="ltr">- {discountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">رسوم الشحن</span>
              <span className={shippingFee === 0 ? "text-success font-medium" : "text-text"}>
                {shippingFee === 0 ? "مجاناً" : `${shippingFee.toFixed(2)} ج.م`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-text-muted">شحن مجاني عند الطلب فوق {SHIPPING_THRESHOLD} ج.م</p>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-border font-semibold text-base">
            <span className="text-text">الإجمالي</span>
            <span className="text-accent" dir="ltr">{total.toFixed(2)} ج.م</span>
          </div>

          {error && <p role="alert" className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !cart || cart.items.length === 0 || !shippingAddress}
            className="w-full h-12 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPending ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
        </div>
      </aside>
    </form>
  );
}
