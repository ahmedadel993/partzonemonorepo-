import Link from "next/link";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

interface BannerConfig {
  imageUrl?: string;
}

function getTranslation(
  translations: PageBlockTranslation[],
  locale: string
): PageBlockTranslation | undefined {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "ar");
}

interface Props {
  block: ActivePageBlock;
  locale: string;
}

export function BannerSingleBlock({ block, locale }: Props) {
  const t = getTranslation(block.translations, locale);
  const config: BannerConfig = (() => {
    try { return JSON.parse(block.config); } catch { return {}; }
  })();
  const ctaHref = block.targetUrl ?? `/${locale}/search`;

  return (
    <section className="py-4 bg-bg" aria-label={t?.title ?? "Banner"}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link href={ctaHref} className="block rounded-xl overflow-hidden border border-border hover:border-accent transition-colors">
          {config.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.imageUrl} alt={t?.title ?? ""} className="w-full object-cover max-h-48" />
          ) : (
            <div className="h-36 bg-surface-alt flex items-center justify-center text-text-muted">
              <span className="text-sm opacity-40">[banner image]</span>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}
