import { useState } from "react";
import { BrandsPanel } from "./BrandsPanel";
import { ProductsPanel } from "./ProductsPanel";
import { CategoriesPanel } from "./CategoriesPanel";
import { VehiclesPanel } from "./VehiclesPanel";
import { useLanguage } from "@/contexts/LanguageContext";

type Tab = "products" | "brands" | "categories" | "vehicles";

export default function CatalogPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("products");

  const TABS: { id: Tab; label: string }[] = [
    { id: "products",   label: t("catalogTabProducts") },
    { id: "brands",     label: t("catalogTabBrands") },
    { id: "categories", label: t("catalogTabCategories") },
    { id: "vehicles",   label: t("catalogTabVehicles") },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2",
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "products"   && <ProductsPanel />}
      {tab === "brands"     && <BrandsPanel />}
      {tab === "categories" && <CategoriesPanel />}
      {tab === "vehicles"   && <VehiclesPanel />}
    </div>
  );
}

