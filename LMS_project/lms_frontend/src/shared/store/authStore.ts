import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";

interface AuthState {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
        user: null,
        login: (userData: User) => set({ user: userData }),
        logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
    }
  )
);