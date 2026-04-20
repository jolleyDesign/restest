import type { Device } from "./types";

const tabletBezel = (radius = 28) => ({
  radius,
  thickness: 28,
  color: "#0a0a0e",
});

export const tablets: Device[] = [
  {
    id: "ipad-mini-6",
    name: "iPad mini (6th gen)",
    brand: "Apple",
    category: "tablet",
    viewport: { width: 744, height: 1133 },
    dpr: 2,
    bezel: tabletBezel(32),
    safeArea: { top: 24, right: 0, bottom: 20, left: 0 },
    features: [
      { kind: "home-indicator", widthPx: 220, heightPx: 5, bottomOffsetPx: 6 },
    ],
    supportsRotation: true,
  },
  {
    id: "ipad-air",
    name: 'iPad Air 11"',
    brand: "Apple",
    category: "tablet",
    viewport: { width: 820, height: 1180 },
    dpr: 2,
    bezel: tabletBezel(28),
    safeArea: { top: 24, right: 0, bottom: 20, left: 0 },
    features: [
      { kind: "home-indicator", widthPx: 260, heightPx: 5, bottomOffsetPx: 6 },
    ],
    supportsRotation: true,
  },
  {
    id: "ipad-pro-13",
    name: 'iPad Pro 13"',
    brand: "Apple",
    category: "tablet",
    viewport: { width: 1024, height: 1366 },
    dpr: 2,
    bezel: tabletBezel(22),
    safeArea: { top: 24, right: 0, bottom: 20, left: 0 },
    features: [
      { kind: "home-indicator", widthPx: 300, heightPx: 5, bottomOffsetPx: 6 },
    ],
    supportsRotation: true,
  },
  {
    id: "galaxy-tab-s9",
    name: "Galaxy Tab S9",
    brand: "Samsung",
    category: "tablet",
    viewport: { width: 800, height: 1280 },
    dpr: 2,
    bezel: tabletBezel(24),
    safeArea: { top: 24, right: 0, bottom: 20, left: 0 },
    features: [
      { kind: "home-indicator", widthPx: 240, heightPx: 4, bottomOffsetPx: 6 },
    ],
    supportsRotation: true,
  },
];
