import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBrands } from "../actions/catalogActions";

interface Props {
  locale: string;
}

export async function BrandsStripSection({ locale }: Props) {
  const [brands, t] = await Promise.all([
    getBrands(),
    getTranslations({ locale, namespace: "home" }),
  ]);
  if (brands.length === 0) return null;

  return (
    <section className="bg-surface-alt py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">{t("shopByBrand")}</h2>
          <Link
            href={`/${locale}/brands`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {t("viewAll")} ←
          </Link>
        </div>
        <div
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/${locale}/brands/${brand.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden group-hover:border-accent transition-colors">
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <span className="text-sm font-bold text-text-muted group-hover:text-accent transition-colors">
                    {brand.name.slice(0, 2)}
                  </span>
                )}
              </div>
              <span className="text-xs text-text-muted group-hover:text-text transition-colors text-center max-w-[64px] truncate">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
