"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Brand, Category } from "../types";

interface Props {
  brands: Brand[];
  categories: Category[];
  current: {
    brandId?: string;
    categoryId?: string;
    condition?: string;
    q?: string;
  };
}

export function FilterBar({ brands, categories, current }: Props) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();

  const CONDITIONS = [
    { value: "", label: t("allConditions") },
    { value: "Original",    label: t("conditionOriginal") },
    { value: "Aftermarket", label: t("conditionAftermarket") },
    { value: "Used",        label: t("conditionUsed") },
  ];

  function push(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
      {/* Search */}
      <input
        type="search"
        defaultValue={current.q ?? ""}
        placeholder={t("searchPlaceholder")}
        className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        onKeyDown={(e) => {
          if (e.key === "Enter") push("q", (e.target as HTMLInputElement).value);
        }}
      />

      {/* Brand + Category selects */}
      <div className="flex flex-wrap gap-3">
        <select
          value={current.brandId ?? ""}
          onChange={(e) => push("brandId", e.target.value)}
          className="flex-1 min-w-[140px] bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">{t("allBrands")}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={current.categoryId ?? ""}
          onChange={(e) => push("categoryId", e.target.value)}
          className="flex-1 min-w-[140px] bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Condition tabs */}
      <div className="flex gap-2 border-t border-border pt-3">
        {CONDITIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => push("condition", value)}
            className={[
              "px-4 py-1.5 text-sm rounded transition-colors",
              (current.condition ?? "") === value
                ? "bg-accent text-accent-fg font-medium"
                : "text-text-muted hover:text-text",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
