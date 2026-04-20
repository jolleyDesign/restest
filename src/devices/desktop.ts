import type { Device } from "./types";

const desktopBezel = {
  radius: 8,
  thickness: 4,
  color: "#1a1a22",
};

const make = (
  id: string,
  name: string,
  width: number,
  height: number,
  dpr = 1,
): Device => ({
  id,
  name,
  brand: "Generic",
  category: "desktop",
  viewport: { width, height },
  dpr,
  bezel: desktopBezel,
  safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
  features: [],
  supportsRotation: false,
});

export const desktop: Device[] = [
  make("laptop-1280", "Laptop 1280", 1280, 800),
  make("laptop-1440", "Laptop 1440", 1440, 900, 2),
  make("desktop-1920", "Desktop 1920", 1920, 1080),
  make("desktop-2560", "Desktop 2560", 2560, 1440),
  make("ultrawide-3440", "Ultrawide 3440", 3440, 1440),
];
