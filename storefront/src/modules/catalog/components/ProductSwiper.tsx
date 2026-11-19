"use client";

import { useLocale, useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ProductCard } from "./ProductCard";
import type { ProductSummary } from "../types";

interface Props {
  title: string;
  products: ProductSummary[];
  viewAllHref?: string;
}

export function ProductSwiper({ title, products, viewAllHref }: Props) {
  const locale = useLocale();
  const t = useTranslations("home");
  const tCatalog = useTranslations("catalog");
  const dir = locale === "ar" ? "rtl" : "ltr";

  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">{title}</h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {t("viewAll")} ←
          </a>
        )}
      </div>
      <Swiper
        modules={[Navigation, A11y]}
        navigation
        dir={dir}
        spaceBetween={12}
        breakpoints={{
          0:   { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="!pb-2"
        a11y={{ prevSlideMessage: tCatalog("viewSwiperPrev"), nextSlideMessage: tCatalog("viewSwiperNext") }}
      >
        {products.map((p, i) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} priority={i < 2} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
