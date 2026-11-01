"use client";

import { useState } from "react";
import type { ProductImage } from "../types";

interface Props {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-product-bg rounded-lg flex items-center justify-center text-text-muted">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" className="opacity-20">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image with MOTION 2 cross-fade */}
      <div className="relative aspect-square bg-product-bg rounded-lg overflow-hidden">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.altText || productName}
            className={[
              "absolute inset-0 w-full h-full object-cover",
              "transition-opacity duration-400 ease-in-out",
              i === active ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`صورة ${i + 1}`}
              className={[
                "w-16 h-16 shrink-0 rounded overflow-hidden bg-product-bg border-2 transition-colors",
                i === active ? "border-accent" : "border-transparent hover:border-border",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
