"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { ProductSummary } from "@/modules/catalog/types";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

interface ProductListConfig {
  title?: string;
  tabs?: Array<{ label: string; filterKey?: string; filterValue?: string }>;
}

function getTranslation(
  translations: PageBlockTranslation[],
  locale: string
): PageBlockTranslation | undefined {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "ar");
}

const DEFAULT_TABS = [
  { label: "الأكثر مبيعاً" },
  { label: "العروض المميزة" },
  { label: "وصل حديثاً" },
];

interface Props {
  block: ActivePageBlock;
  products: ProductSummary[];
}

export function ProductListBlock({ block, products }: Props) {
  const locale = useLocale();
  const t = getTranslation(block.translations, locale);

  const config: ProductListConfig = (() => {
    try { return JSON.parse(block.config); } catch { return {}; }
  })();

  const title = t?.title ?? config.title ?? "منتجات مختارة لك";
  const tabs = config.tabs ?? DEFAULT_TABS;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-8 bg-surface-alt" aria-label={title}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none" role="tablist">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={activeTab === idx}
              onClick={() => setActiveTab(idx)}
              className={[
                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === idx
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-text-muted hover:text-text",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">لا توجد منتجات حالياً</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.slice(0, 10).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
