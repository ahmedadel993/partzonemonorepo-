"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
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
}

export function AddToCartButton({ product, className }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { setCart, openDrawer } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className ?? "text-xs px-3 py-1.5 bg-surface-alt text-text-muted rounded font-medium"}`}>
        نفذت الكمية
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
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/products`)}`);
        return;
      }

      setCart(result);
      setAdded(true);
      openDrawer();
      setTimeout(() => setAdded(false), 1500);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={`أضف ${product.name} للسلة`}
      className={[
        "active:scale-95 transition-all",
        isPending ? "opacity-70 cursor-wait" : "",
        added ? "bg-success text-white" : "",
        className ?? "text-xs px-3 py-1.5 bg-accent text-accent-fg rounded font-medium hover:bg-accent-hover",
      ].join(" ")}
    >
      {added ? "✓ تمت الإضافة" : isPending ? "..." : "أضف للسلة"}
    </button>
  );
}
