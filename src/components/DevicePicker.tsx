import { useMemo } from "react";
import {
  allDevices,
  CATEGORY_LABEL,
  groupByBrand,
  groupByCategory,
} from "../devices/catalog";
import type { Device } from "../devices/types";
import { useStore } from "../store";

export function DevicePicker() {
  const selectedIds = useStore((s) => s.selectedIds);
  const toggleDevice = useStore((s) => s.toggleDevice);
  const setSelected = useStore((s) => s.setSelected);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const collapsed = useStore((s) => s.collapsed);
  const toggleCollapsed = useStore((s) => s.toggleCollapsed);

  const q = search.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(() => {
    if (!searching) return allDevices;
    return allDevices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q),
    );
  }, [q, searching]);

  const categoryGroups = useMemo(() => groupByCategory(filtered), [filtered]);

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-800 overflow-y-auto bg-neutral-950/60">
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-neutral-500">
            Devices
          </span>
          <div className="flex gap-1 text-[10px] text-neutral-400">
            <button
              type="button"
              onClick={() => setSelected(allDevices.map((d) => d.id))}
              className="hover:text-neutral-200"
            >
              all
            </button>
            <span className="text-neutral-700">·</span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="hover:text-neutral-200"
            >
              none
            </button>
          </div>
        </div>
        <div className="px-3 pb-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices…"
            className="w-full px-2 py-1 text-sm rounded bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {categoryGroups.map(({ category, devices }) => {
        const catKey = `cat:${category}`;
        const catCollapsed = !searching && collapsed[catKey];

        return (
          <section key={category} className="py-1">
            <button
              type="button"
              onClick={() => toggleCollapsed(catKey)}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-300"
            >
              <span>
                {CATEGORY_LABEL[category]}
                <span className="ml-2 normal-case tracking-normal text-neutral-600">
                  {devices.length}
                </span>
              </span>
              <span
                className={`transition-transform ${catCollapsed ? "-rotate-90" : ""}`}
              >
                ▾
              </span>
            </button>

            {!catCollapsed && (
              <CategoryBody
                category={category}
                devices={devices}
                searching={searching}
                collapsed={collapsed}
                toggleCollapsed={toggleCollapsed}
                selectedIds={selectedIds}
                toggleDevice={toggleDevice}
              />
            )}
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="px-3 py-6 text-xs text-neutral-500">
          No devices match “{search}”.
        </div>
      )}
    </aside>
  );
}

function CategoryBody({
  category,
  devices,
  searching,
  collapsed,
  toggleCollapsed,
  selectedIds,
  toggleDevice,
}: {
  category: string;
  devices: Device[];
  searching: boolean;
  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;
  selectedIds: string[];
  toggleDevice: (id: string) => void;
}) {
  if (category === "phone") {
    const brandGroups = groupByBrand(devices);
    return (
      <>
        {brandGroups.map(({ brand, devices: brandDevices }) => {
          const key = `brand:${brand}`;
          const brandCollapsed = !searching && collapsed[key];
          return (
            <div key={brand} className="mt-1">
              <button
                type="button"
                onClick={() => toggleCollapsed(key)}
                className="w-full flex items-center justify-between px-5 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-200"
              >
                <span>
                  {brand}
                  <span className="ml-2 text-neutral-600">
                    {brandDevices.length}
                  </span>
                </span>
                <span
                  className={`transition-transform ${brandCollapsed ? "-rotate-90" : ""}`}
                >
                  ▾
                </span>
              </button>
              {!brandCollapsed && (
                <DeviceList
                  devices={brandDevices}
                  selectedIds={selectedIds}
                  toggleDevice={toggleDevice}
                  indent
                />
              )}
            </div>
          );
        })}
      </>
    );
  }
  return (
    <DeviceList
      devices={devices}
      selectedIds={selectedIds}
      toggleDevice={toggleDevice}
    />
  );
}

function DeviceList({
  devices,
  selectedIds,
  toggleDevice,
  indent,
}: {
  devices: Device[];
  selectedIds: string[];
  toggleDevice: (id: string) => void;
  indent?: boolean;
}) {
  return (
    <div>
      {devices.map((d) => {
        const on = selectedIds.includes(d.id);
        return (
          <label
            key={d.id}
            className={`flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-neutral-900 ${
              indent ? "pl-7 pr-3" : "px-3"
            } ${on ? "text-neutral-100" : "text-neutral-400"}`}
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => toggleDevice(d.id)}
              className="accent-indigo-500"
            />
            <span className="flex-1 truncate">{d.name}</span>
          </label>
        );
      })}
    </div>
  );
}
