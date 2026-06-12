import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "adm-libare-theme";

type ThemeMode = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => void;
};

function applyDomTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      setMode: (mode) => {
        applyDomTheme(mode);
        set({ mode });
      },
      toggle: () => {
        const next = get().mode === "dark" ? "light" : "dark";
        applyDomTheme(next);
        set({ mode: next });
      },
      hydrate: () => {
        applyDomTheme(get().mode);
      }
    }),
    { name: STORAGE_KEY }
  )
);
