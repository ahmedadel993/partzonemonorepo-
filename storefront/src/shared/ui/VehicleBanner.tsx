"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useVehicleStore } from "@/shared/stores/useVehicleStore";

export function VehicleBanner() {
  const selectedVehicle = useVehicleStore((s) => s.selectedVehicle);
  const clearVehicle = useVehicleStore((s) => s.clearVehicle);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("catalog");

  if (!selectedVehicle?.modelId) return null;

  const makeName = searchParams.get("makeName") ?? selectedVehicle.makeName;
  const modelName = searchParams.get("modelName") ?? selectedVehicle.modelName;

  const handleClear = () => {
    clearVehicle();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("vehicleModelId");
    params.delete("makeName");
    params.delete("modelName");
    const qs = params.toString();
    router.push(pathname + (qs ? `?${qs}` : ""));
  };

  return (
    <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h1m6-1V8a1 1 0 011-1h2l3 3v6l-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m1-11v4h3" />
        </svg>
        <span className="text-text font-medium">
          {t("filteringByVehicle", { make: makeName, model: modelName })}
        </span>
      </div>
      <button
        onClick={handleClear}
        className="text-xs text-text-muted hover:text-text border border-border rounded-lg px-3 py-1.5 hover:border-accent transition-colors shrink-0"
      >
        {t("clearVehicle")}
      </button>
    </div>
  );
}
