"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { addToCart } from "@/modules/cart/actions/cartActions";
import { useCartStore } from "@/shared/stores/useCartStore";

interface Props {
  product: {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
  };
  className?: string;
  iconOnly?: boolean;
}

export function AddToCartButton({ product, className, iconOnly }: Props) {
  const locale = useLocale();
  const t = useTranslations("cart");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const { setCart, openDrawer } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className ?? "text-xs px-3 py-1.5 bg-surface-alt text-text-muted rounded font-medium"}`}>
        {tCatalog("outOfStock")}
      </button>
    );
  }

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCart({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });

      if (result === null) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname || `/${locale}`)}`);
        return;
      }

      setCart(result);
      setAdded(true);
      openDrawer();
      setTimeout(() => setAdded(false), 1500);
    });
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={t("addToCartAriaLabel", { name: product.name })}
        className={[
          "w-10 h-10 rounded-full bg-white text-text flex items-center justify-center shadow-md",
          "active:scale-95 transition-all hover:bg-accent hover:text-accent-fg",
          isPending ? "opacity-70 cursor-wait" : "",
          added ? "bg-success text-white" : "",
        ].join(" ")}
      >
        {added ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={t("addToCartAriaLabel", { name: product.name })}
      className={[
        "active:scale-95 transition-all",
        isPending ? "opacity-70 cursor-wait" : "",
        added ? "bg-success text-white" : "",
        className ?? "text-xs px-3 py-1.5 bg-accent text-accent-fg rounded font-medium hover:bg-accent-hover",
      ].join(" ")}
    >
      {added ? t("addedToCart") : isPending ? "..." : t("addToCart")}
    </button>
  );
}
