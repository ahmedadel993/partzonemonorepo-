import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ActivePageBlock, PageBlockTranslation } from "../types";

interface HeroConfig {
  backgroundImageUrl?: string;
  heroImageUrl?: string;
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

export async function HeroBlock({ block, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "home" });
  const trans = getTranslation(block.translations, locale);
  const config: HeroConfig = (() => {
    try { return JSON.parse(block.config); } catch { return {}; }
  })();

  const ctaHref = block.targetUrl ?? `/${locale}/search`;
  const headline = trans?.title ?? t("heroTitle");
  const subtitle = trans?.subtitle ?? t("heroSubtitle");
  const ctaText = trans?.ctaText ?? t("heroCta");

  const trustBadges = [
    t("trustOriginal"),
    t("trustShipping"),
    t("trustReturns"),
  ];

  return (
    <section
      className="relative min-h-[480px] md:min-h-[560px] flex items-center overflow-hidden bg-surface"
      aria-label="Hero"
    >
      {/* Background */}
      {config.backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.backgroundImageUrl}
          alt=""
          role="presentation"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-surface to-surface-alt" />
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div className="space-y-6 text-center md:text-start">
          <h1 className="text-3xl md:text-5xl font-bold text-text leading-tight">
            {headline}
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-fg font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              {ctaText}
            </Link>
          </div>

          {/* Trust badges */}
          <ul className="flex flex-wrap gap-4 justify-center md:justify-start mt-4" role="list">
            {trustBadges.map((label) => (
              <li
                key={label}
                className="flex items-center gap-1.5 text-sm text-text-muted"
              >
                <span className="text-accent font-bold">✓</span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Illustration side */}
        {config.heroImageUrl ? (
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.heroImageUrl}
              alt={headline}
              fetchPriority="high"
              className="w-full max-w-xs md:max-w-sm aspect-square object-cover rounded-2xl border border-border"
            />
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full max-w-sm aspect-square rounded-2xl bg-surface-alt border border-border flex items-center justify-center text-text-muted">
              <span className="text-xs opacity-40">[hero image]</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
