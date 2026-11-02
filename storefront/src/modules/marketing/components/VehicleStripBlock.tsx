"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { VehicleMake } from "@/modules/catalog/types";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

function getTranslation(
  translations: PageBlockTranslation[],
  locale: string
): PageBlockTranslation | undefined {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "ar");
}

interface Props {
  block: ActivePageBlock;
  makes: VehicleMake[];
}

export function VehicleStripBlock({ block, makes }: Props) {
  const locale = useLocale();
  const t = getTranslation(block.translations, locale);
  const title = t?.title ?? "اختر ماركة سيارتك";

  if (makes.length === 0) return null;

  return (
    <section className="py-8 bg-surface-alt" aria-label={title}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
        <div
          className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {makes.map((make) => (
            <Link
              key={make.id}
              href={`/${locale}/search?makeId=${make.id}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg bg-surface border border-border hover:border-accent transition-colors min-w-[80px]"
            >
              <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-muted text-xs">
                {/* [MAKE LOGO PLACEHOLDER] */}
                {make.name.slice(0, 2)}
              </div>
              <span className="text-xs text-text-muted text-center leading-tight">{make.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
