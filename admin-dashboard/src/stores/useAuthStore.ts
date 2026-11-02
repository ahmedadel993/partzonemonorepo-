import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  role: string | null;
  setAuth: (accessToken: string, userId: string, role: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,
      role: null,
      setAuth: (accessToken, userId, role) => {
        localStorage.setItem("pz_access_token", accessToken);
        set({ accessToken, userId, role });
      },
      clearAuth: () => {
        localStorage.removeItem("pz_access_token");
        set({ accessToken: null, userId: null, role: null });
      },
      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: "pz-auth",
      partialize: (state) => ({ userId: state.userId, role: state.role, accessToken: state.accessToken }),
    }
  )
);
