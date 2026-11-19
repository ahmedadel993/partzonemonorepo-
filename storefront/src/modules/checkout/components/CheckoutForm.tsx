"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCartStore } from "@/shared/stores/useCartStore";
import { placeOrder } from "@/modules/checkout/actions/checkoutActions";
import { getCart, clearCart } from "@/modules/cart/actions/cartActions";
import { AddressSelector } from "./AddressSelector";
import { CouponInput } from "@/modules/cart/components/CouponInput";
import type { Address } from "@/modules/auth/types";
import type { ShippingAddressInput } from "@/modules/checkout/types";
import type { PaymentMethodOption } from "@/modules/checkout/actions/checkoutActions";

const SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 15;

interface Props {
  addresses: Address[];
  paymentMethods?: PaymentMethodOption[];
}

export function CheckoutForm({ addresses, paymentMethods = [] }: Props) {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { cart, setCart } = useCartStore();

  useEffect(() => {
    if (!cart) {
      getCart().then((c) => { if (c) setCart(c); });
    }
  }, [cart, setCart]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddressInput | null>(
    addresses[0]
      ? { fullName: addresses[0].label, phone: "", addressLine1: addresses[0].streetLine1, addressLine2: addresses[0].streetLine2 ?? undefined, city: addresses[0].city, governorate: addresses[0].governorate, postalCode: addresses[0].postalCode }
      : null
  );
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedPaymentKey, setSelectedPaymentKey] = useState<string>(
    paymentMethods.find((m) => !m.isComingSoon)?.key ?? "cash_on_delivery"
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currency = tCommon("currency");
  const subTotal = cart?.subTotal ?? 0;
  const afterDiscount = subTotal - discountAmount;
  const shippingFee = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) { setError(t("errorNoAddress")); return; }
    if (!cart || cart.items.length === 0) { setError(t("errorEmptyCart")); return; }
    setError(null);

    startTransition(async () => {
      const result = await placeOrder({
        shippingAddress,
        couponCode,
        discountAmount,
        paymentMethod: selectedPaymentKey,
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
      router.push(`/${locale}/orders/${result.orderId}?new=1`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Shipping address */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">{t("stepShipping")}</h2>
          <AddressSelector
            initialAddresses={addresses}
            onSelect={setShippingAddress}
            selectedId={null}
          />
        </section>

        {/* Order summary */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">{t("stepSummary")}</h2>
          {!cart || cart.items.length === 0 ? (
            <p className="text-sm text-text-muted">{t("errorEmptyCart")}</p>
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
                  <span className="text-sm font-semibold text-text shrink-0" dir="ltr">{item.subTotal.toFixed(2)} {currency}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Coupon */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">{t("stepCoupon")}</h2>
          <CouponInput
            subTotal={subTotal}
            onApplied={(code, amount) => { setCouponCode(code); setDiscountAmount(amount); }}
            onRemoved={() => { setCouponCode(undefined); setDiscountAmount(0); }}
          />
        </section>

        {/* Payment method */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">{t("stepPayment")}</h2>
          {paymentMethods.length === 0 ? (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-accent bg-accent/5 cursor-pointer">
              <input type="radio" name="payment" defaultChecked readOnly className="accent-[var(--color-accent)]" />
              <div>
                <p className="text-sm font-medium text-text">{t("cashOnDelivery")}</p>
                <p className="text-xs text-text-muted mt-0.5">{t("cashOnDeliveryDesc")}</p>
              </div>
            </label>
          ) : (
            paymentMethods.map((pm) => {
              const isSelected = selectedPaymentKey === pm.key;
              const disabled = pm.isComingSoon;
              return (
                <label
                  key={pm.id}
                  className={[
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    disabled
                      ? "border-border opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-accent bg-accent/5 cursor-pointer"
                      : "border-border cursor-pointer hover:border-accent/50",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.key}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => setSelectedPaymentKey(pm.key)}
                    className="accent-[var(--color-accent)]"
                  />
                  {pm.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pm.iconUrl} alt={pm.labelAr} className="w-6 h-6 object-contain shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text">{pm.labelAr}</p>
                    {pm.isComingSoon && (
                      <span className="inline-block text-[10px] bg-surface-alt text-text-muted px-1.5 py-0.5 rounded font-medium mt-0.5">{t("comingSoon")}</span>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text border-b border-border pb-3">{t("stepNotes")}</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t("notesPlaceholder")}
            className="w-full px-3 py-2 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </section>
      </div>

      {/* Sidebar summary */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="bg-surface-alt rounded-xl p-5 space-y-4 border border-border">
          <h2 className="text-base font-semibold text-text">{t("costSummary")}</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">{t("subtotal")}</span>
              <span className="text-text font-medium" dir="ltr">{subTotal.toFixed(2)} {currency}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>{t("couponDiscount")}</span>
                <span dir="ltr">- {discountAmount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">{t("shipping")}</span>
              <span className={shippingFee === 0 ? "text-success font-medium" : "text-text"}>
                {shippingFee === 0 ? t("free") : `${shippingFee.toFixed(2)} ${currency}`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-text-muted">{t("freeShippingThreshold", { amount: SHIPPING_THRESHOLD, currency })}</p>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-border font-semibold text-base">
            <span className="text-text">{t("total")}</span>
            <span className="text-accent" dir="ltr">{total.toFixed(2)} {currency}</span>
          </div>

          {error && <p role="alert" className="text-xs text-danger bg-danger/10 px-3 py-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !cart || cart.items.length === 0 || !shippingAddress}
            className="w-full h-12 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPending ? t("submitting") : t("submit")}
          </button>
        </div>
      </aside>
    </form>
  );
}
