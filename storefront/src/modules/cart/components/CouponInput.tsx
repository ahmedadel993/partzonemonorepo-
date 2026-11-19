"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { validateCoupon } from "@/modules/marketing/actions/marketingActions";

interface Props {
  subTotal: number;
  onApplied: (code: string, discountAmount: number) => void;
  onRemoved: () => void;
}

export function CouponInput({ subTotal, onApplied, onRemoved }: Props) {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await validateCoupon(code.trim().toUpperCase(), subTotal);
      if (result.isValid && result.value != null) {
        const discount = result.discountType === "Percentage"
          ? parseFloat(((subTotal * result.value) / 100).toFixed(2))
          : result.value;
        setApplied({ code: code.trim().toUpperCase(), discount });
        onApplied(code.trim().toUpperCase(), discount);
      } else {
        setError(result.errorCode === "MIN_ORDER" ? t("couponMinNotMet") : t("couponInvalid"));
      }
    });
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError(null);
    onRemoved();
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/30">
        <div>
          <p className="text-sm font-medium text-success">{t("couponApplied", { code: applied.code })}</p>
          <p className="text-xs text-text-muted">{t("couponDiscount", { amount: applied.discount.toFixed(2), currency: tCommon("currency") })}</p>
        </div>
        <button onClick={handleRemove} className="text-xs text-text-muted hover:text-danger transition-colors">{t("couponRemove")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("couponPlaceholder")}
          className="flex-1 h-10 px-3 rounded-md bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          dir="ltr"
        />
        <button
          onClick={handleApply}
          disabled={isPending || !code.trim()}
          className="h-10 px-4 bg-accent text-accent-fg text-sm font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {t("couponApply")}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
