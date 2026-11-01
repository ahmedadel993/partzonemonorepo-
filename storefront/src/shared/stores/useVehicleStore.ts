"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedVehicle {
  makeId: string;
  makeName: string;
  modelId: string;
  modelName: string;
  year: number;
}

interface VehicleState {
  selectedVehicle: SelectedVehicle | null;
  setVehicle: (vehicle: SelectedVehicle) => void;
  clearVehicle: () => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      selectedVehicle: null,
      setVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      clearVehicle: () => set({ selectedVehicle: null }),
    }),
    { name: "pz-vehicle" }
  )
);
