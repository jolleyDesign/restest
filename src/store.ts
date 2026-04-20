import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSelectedIds } from "./devices/catalog";
import { invalidateAll } from "./snapshots";

export type Orientation = "portrait" | "landscape";

interface Store {
  url: string;
  setUrl: (url: string) => void;

  selectedIds: string[];
  toggleDevice: (id: string) => void;
  setSelected: (ids: string[]) => void;

  zoom: number;
  setZoom: (z: number) => void;

  showHardware: boolean;
  toggleHardware: () => void;

  showSafeArea: boolean;
  toggleSafeArea: () => void;

  proxyMode: boolean;
  toggleProxy: () => void;

  context: "browser" | "pwa" | "fullscreen";
  setContext: (c: "browser" | "pwa" | "fullscreen") => void;

  orientations: Record<string, Orientation>;
  setOrientation: (id: string, o: Orientation) => void;

  reloadTick: number;
  reloadAll: () => void;

  search: string;
  setSearch: (q: string) => void;

  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;

  focusedDeviceId: string | null;
  setFocusedDevice: (id: string | null) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      url: "",
      setUrl: (url) => {
        invalidateAll();
        set({ url });
      },

      selectedIds: defaultSelectedIds,
      toggleDevice: (id) =>
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((x) => x !== id)
            : [...s.selectedIds, id],
        })),
      setSelected: (ids) => set({ selectedIds: ids }),

      zoom: 0.5,
      setZoom: (zoom) => set({ zoom }),

      showHardware: true,
      toggleHardware: () => set((s) => ({ showHardware: !s.showHardware })),

      showSafeArea: false,
      toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),

      proxyMode: false,
      toggleProxy: () => set((s) => ({ proxyMode: !s.proxyMode })),

      context: "pwa",
      setContext: (context) => set({ context }),

      orientations: {},
      setOrientation: (id, o) =>
        set((s) => ({ orientations: { ...s.orientations, [id]: o } })),

      reloadTick: 0,
      reloadAll: () =>
        set((s) => {
          invalidateAll();
          return { reloadTick: s.reloadTick + 1 };
        }),

      search: "",
      setSearch: (search) => set({ search }),

      collapsed: {},
      toggleCollapsed: (key) =>
        set((s) => ({
          collapsed: { ...s.collapsed, [key]: !s.collapsed[key] },
        })),

      focusedDeviceId: null,
      setFocusedDevice: (focusedDeviceId) => set({ focusedDeviceId }),
    }),
    {
      name: "restest-store",
      version: 3,
      partialize: (s) => ({
        url: s.url,
        selectedIds: s.selectedIds,
        zoom: s.zoom,
        showHardware: s.showHardware,
        showSafeArea: s.showSafeArea,
        proxyMode: s.proxyMode,
        context: s.context,
        orientations: s.orientations,
        collapsed: s.collapsed,
      }),
    },
  ),
);
