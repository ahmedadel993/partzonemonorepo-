"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVehicleMakes, getVehicleModelsByMake } from "@/modules/catalog/actions/catalogActions";
import { useVehicleStore } from "@/shared/stores/useVehicleStore";
import type { VehicleMake, VehicleModel } from "@/modules/catalog/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function VehiclePickerModal({ isOpen, onClose, locale }: Props) {
  const router = useRouter();
  const { setVehicle } = useVehicleStore();

  const [step, setStep] = useState<"make" | "model">("make");
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep("make");
    setSelectedMake(null);
    setModels([]);
    setLoadingMakes(true);
    getVehicleMakes().then((data) => {
      setMakes(data);
      setLoadingMakes(false);
    });
  }, [isOpen]);

  const handleMakeSelect = async (make: VehicleMake) => {
    setSelectedMake(make);
    setLoadingModels(true);
    setStep("model");
    const data = await getVehicleModelsByMake(make.id);
    setModels(data);
    setLoadingModels(false);
  };

  const handleModelSelect = (model: VehicleModel) => {
    setVehicle({
      makeId: selectedMake!.id,
      makeName: selectedMake!.name,
      modelId: model.id,
      modelName: model.name,
      year: 0,
    });
    onClose();
    router.push(`/${locale}/search?vehicleModelId=${model.id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {step === "model" && (
              <button
                type="button"
                onClick={() => { setStep("make"); setSelectedMake(null); setModels([]); }}
                className="text-text-muted hover:text-text transition-colors text-sm"
              >
                ←
              </button>
            )}
            <h2 className="font-semibold text-text">
              {step === "make" ? "اختر الماركة" : `موديلات ${selectedMake?.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4">
          {step === "make" && (
            loadingMakes ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-12 bg-surface-alt rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {makes.map((make) => (
                  <button
                    key={make.id}
                    type="button"
                    onClick={() => handleMakeSelect(make)}
                    className="flex items-center justify-center h-12 rounded-lg border border-border bg-surface-alt hover:border-accent hover:bg-accent/5 text-sm font-medium text-text transition-colors"
                  >
                    {make.name}
                  </button>
                ))}
              </div>
            )
          )}

          {step === "model" && (
            loadingModels ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-11 bg-surface-alt rounded-lg animate-pulse" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <p className="text-center text-text-muted py-8 text-sm">لا توجد موديلات متاحة</p>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelSelect(model)}
                    className="w-full text-right h-11 px-4 rounded-lg border border-border bg-surface-alt hover:border-accent hover:bg-accent/5 text-sm font-medium text-text transition-colors"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
