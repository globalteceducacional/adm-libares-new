import { create } from "zustand";
import { persist } from "zustand/middleware";

type LayoutState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (value: boolean) => void;
  closeMobileSidebar: () => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false })
    }),
    { name: "adm-libare-layout", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) }
  )
);
