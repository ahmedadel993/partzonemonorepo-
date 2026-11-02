import Link from "next/link";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

interface BannerDoubleConfig {
  leftImageUrl?: string;
  rightImageUrl?: string;
  leftUrl?: string;
  rightUrl?: string;
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

export function BannerDoubleBlock({ block, locale }: Props) {
  const t = getTranslation(block.translations, locale);
  const config: BannerDoubleConfig = (() => {
    try { return JSON.parse(block.config); } catch { return {}; }
  })();

  return (
    <section className="py-4 bg-bg" aria-label={t?.title ?? "Banners"}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 gap-3">
        {[
          { url: config.leftUrl ?? `/${locale}/search`, img: config.leftImageUrl },
          { url: config.rightUrl ?? `/${locale}/search`, img: config.rightImageUrl },
        ].map((banner, i) => (
          <Link
            key={i}
            href={banner.url}
            className="block rounded-xl overflow-hidden border border-border hover:border-accent transition-colors"
          >
            {banner.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.img} alt="" role="presentation" className="w-full object-cover max-h-40" />
            ) : (
              <div className="h-32 bg-surface-alt flex items-center justify-center text-text-muted">
                <span className="text-xs opacity-40">[banner {i + 1}]</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
