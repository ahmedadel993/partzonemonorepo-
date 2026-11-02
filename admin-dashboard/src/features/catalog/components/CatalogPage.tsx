import { useState } from "react";
import { BrandsPanel } from "./BrandsPanel";
import { ProductsPanel } from "./ProductsPanel";
import { CategoriesPanel } from "./CategoriesPanel";
import { VehiclesPanel } from "./VehiclesPanel";

type Tab = "products" | "brands" | "categories" | "vehicles";

const TABS: { id: Tab; label: string }[] = [
  { id: "products",   label: "المنتجات" },
  { id: "brands",     label: "الماركات" },
  { id: "categories", label: "الفئات" },
  { id: "vehicles",   label: "المركبات" },
];

export default function CatalogPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div dir="rtl">
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

