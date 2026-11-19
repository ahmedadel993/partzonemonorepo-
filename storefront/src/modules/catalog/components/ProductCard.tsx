"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { ProductSummary } from "../types";
import { AddToCartButton } from "@/modules/cart/components/AddToCartButton";

interface Props {
  product: ProductSummary;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: Props) {
  const locale = useLocale();
  const t = useTranslations("catalog");
  const tCommon = useTranslations("common");
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(priority);

  const conditionLabels: Record<string, string> = {
    Original:    t("conditionOriginal"),
    Aftermarket: t("conditionAftermarket"),
    Used:        t("conditionUsed"),
  };

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
      {/* Product image with hover add-to-cart overlay */}
      <div className="relative">
        <Link href={`/${locale}/products/${product.slug}`} className="block aspect-square overflow-hidden bg-product-bg">
          {product.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-surface-alt">
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="text-text-muted opacity-50"
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-xs text-text-muted opacity-50">{tCommon("noImage")}</span>
            </div>
          )}
        </Link>
        {/* On-hover add-to-cart icon overlay */}
        {product.stock > 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 rounded-t-lg pointer-events-none group-hover:pointer-events-auto">
            <AddToCartButton
              product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: product.priceAmount,
                stock: product.stock,
                imageUrl: product.primaryImageUrl,
              }}
              iconOnly
            />
          </div>
        )}
      </div>

      {/* Condition badge */}
      <span className="absolute top-2 start-2 px-2 py-0.5 text-xs font-medium rounded bg-black/60 text-white backdrop-blur-sm">
        {conditionLabels[product.condition] ?? product.condition}
      </span>

      {/* Out of stock overlay */}
      {product.stock === 0 && (
        <span className="absolute top-2 end-2 px-2 py-0.5 text-xs font-medium rounded bg-danger/80 text-white">
          {t("outOfStock")}
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
