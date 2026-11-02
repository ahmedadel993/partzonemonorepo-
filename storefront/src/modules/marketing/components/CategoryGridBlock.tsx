"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { Category } from "@/modules/catalog/types";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

function getTranslation(
  translations: PageBlockTranslation[],
  locale: string
): PageBlockTranslation | undefined {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "ar");
}

function CategoryCard({ category, locale }: { category: Category; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // MOTION 2: scroll-reveal
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
    >
      <Link
        href={`/${locale}/categories/${category.slug}`}
        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface border border-border hover:border-accent transition-colors min-w-[90px]"
      >
        <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center">
          {/* [CATEGORY IMAGE PLACEHOLDER] */}
          <span className="text-text-muted text-xs opacity-40">📦</span>
        </div>
        <span className="text-xs text-text text-center leading-tight line-clamp-2">{category.name}</span>
      </Link>
    </div>
  );
}

interface Props {
  block: ActivePageBlock;
  categories: Category[];
}

export function CategoryGridBlock({ block, categories }: Props) {
  const locale = useLocale();
  const t = getTranslation(block.translations, locale);
  const title = t?.title ?? "تصفح حسب التصنيف";

  if (categories.length === 0) return null;

  return (
    <section className="py-8 bg-bg" aria-label={title}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
          {categories.slice(0, 12).map((cat) => (
            <CategoryCard key={cat.id} category={cat} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
