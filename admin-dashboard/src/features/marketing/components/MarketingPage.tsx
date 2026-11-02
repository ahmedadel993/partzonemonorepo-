import { useState } from "react";
import { PageBlocksPanel } from "./PageBlocksPanel";
import { CouponsPanel } from "./CouponsPanel";

const TABS = [
  { id: "blocks" as const, label: "بلوكات الصفحة" },
  { id: "coupons" as const, label: "كوبونات الخصم" },
];

type TabId = (typeof TABS)[number]["id"];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("blocks");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">التسويق</h2>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === "blocks" && <PageBlocksPanel />}
        {activeTab === "coupons" && <CouponsPanel />}
      </div>
    </div>
  );
}
