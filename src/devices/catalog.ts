import type { Brand, Device, DeviceCategory } from "./types";
import { iphones } from "./iphones";
import { androids } from "./androids";
import { tablets } from "./tablets";
import { foldables } from "./foldables";
import { desktop } from "./desktop";

export const allDevices: Device[] = [
  ...iphones,
  ...androids,
  ...tablets,
  ...foldables,
  ...desktop,
];

export const devicesById = new Map(allDevices.map((d) => [d.id, d]));

export const defaultSelectedIds = [
  "iphone-17-pro",
  "iphone-17-pro-max",
  "iphone-se-3",
  "pixel-9-pro",
  "galaxy-s25-ultra",
  "ipad-air",
  "pixel-10-pro-fold",
  "laptop-1440",
  "desktop-1920",
];

export const CATEGORY_ORDER: DeviceCategory[] = [
  "phone",
  "tablet",
  "foldable",
  "desktop",
];

export const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  phone: "Phones",
  tablet: "Tablets",
  foldable: "Foldables",
  desktop: "Desktop",
};

export const BRAND_ORDER: Brand[] = [
  "Apple",
  "Google",
  "Samsung",
  "Microsoft",
  "Generic",
];

export interface BrandGroup {
  brand: Brand;
  devices: Device[];
}

export function groupByBrand(devices: Device[]): BrandGroup[] {
  const map = new Map<Brand, Device[]>();
  for (const d of devices) {
    const arr = map.get(d.brand) ?? [];
    arr.push(d);
    map.set(d.brand, arr);
  }
  return BRAND_ORDER.filter((b) => map.has(b)).map((brand) => ({
    brand,
    devices: map.get(brand)!,
  }));
}

export function groupByCategory(
  devices: Device[],
): { category: DeviceCategory; devices: Device[] }[] {
  const map = new Map<DeviceCategory, Device[]>();
  for (const d of devices) {
    const arr = map.get(d.category) ?? [];
    arr.push(d);
    map.set(d.category, arr);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
    category,
    devices: map.get(category)!,
  }));
}
