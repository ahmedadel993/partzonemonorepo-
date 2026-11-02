"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { ProductSummary } from "../types";
import { AddToCartButton } from "@/modules/cart/components/AddToCartButton";

const CONDITION_LABELS: Record<string, string> = {
  Original: "أصلي",
  Aftermarket: "بديل",
  Used: "مستعمل",
};

interface Props {
  product: ProductSummary;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: Props) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(priority);

  // MOTION 2: Intersection Observer scroll-reveal
  useEffect(() => {
    if (priority) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={ref}
      className={[
        "group relative bg-product-bg rounded-lg overflow-hidden border border-border",
        "transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
    >
      {/* Product image */}
      <Link href={`/${locale}/products/${product.slug}`} className="block aspect-square overflow-hidden bg-product-bg">
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
              className="opacity-20"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </Link>

      {/* Condition badge */}
      <span className="absolute top-2 start-2 px-2 py-0.5 text-xs font-medium rounded bg-black/60 text-white backdrop-blur-sm">
        {CONDITION_LABELS[product.condition] ?? product.condition}
      </span>

      {/* Out of stock overlay */}
      {product.stock === 0 && (
        <span className="absolute top-2 end-2 px-2 py-0.5 text-xs font-medium rounded bg-danger/80 text-white">
          نفد المخزون
        </span>
      )}

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-text-muted font-mono leading-none" dir="ltr">
          {product.sku}
        </p>
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="block text-sm font-medium text-product-text leading-snug line-clamp-2 hover:text-accent transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-xs text-text-muted">{product.brandName}</p>

        {/* Price + CTA row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-accent font-semibold text-sm" dir="ltr">
            {product.priceAmount.toFixed(2)}{" "}
            <span className="text-xs font-normal">{product.priceCurrency}</span>
          </span>
          <AddToCartButton
            product={{
              id: product.id,
              sku: product.sku,
              name: product.name,
              price: product.priceAmount,
              stock: product.stock,
              imageUrl: product.primaryImageUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}
