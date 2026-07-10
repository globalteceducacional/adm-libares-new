import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NAV_GROUPS } from "../features/layout/config/navigation";

function buildDefaultExpandedGroups(): Record<string, boolean> {
  return Object.fromEntries(
    NAV_GROUPS.map((group) => [group.id, group.defaultExpanded ?? true])
  );
}

type LayoutState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  expandedGroups: Record<string, boolean>;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (value: boolean) => void;
  closeMobileSidebar: () => void;
  toggleGroupExpanded: (groupId: string) => void;
  setGroupExpanded: (groupId: string, expanded: boolean) => void;
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      expandedGroups: buildDefaultExpandedGroups(),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleGroupExpanded: (groupId) =>
        set((s) => ({
          expandedGroups: {
            ...s.expandedGroups,
            [groupId]: !s.expandedGroups[groupId]
          }
        })),
      setGroupExpanded: (groupId, expanded) =>
        set((s) => ({
          expandedGroups: { ...s.expandedGroups, [groupId]: expanded }
        }))
    }),
    {
      name: "adm-libare-layout",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        expandedGroups: s.expandedGroups
      })
    }
  )
);
