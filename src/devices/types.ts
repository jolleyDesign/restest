export type DeviceCategory = "phone" | "tablet" | "foldable" | "desktop";

export type Brand =
  | "Apple"
  | "Samsung"
  | "Google"
  | "Microsoft"
  | "Generic";

export type HardwareFeature =
  | {
      kind: "notch";
      widthPx: number;
      heightPx: number;
      radius: number;
    }
  | {
      kind: "dynamic-island";
      widthPx: number;
      heightPx: number;
      topOffsetPx: number;
    }
  | {
      kind: "hole-punch";
      diameterPx: number;
      position: "top-center" | "top-left" | "top-right";
      topOffsetPx: number;
    }
  | {
      kind: "home-indicator";
      widthPx: number;
      heightPx: number;
      bottomOffsetPx: number;
    };

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Device {
  id: string;
  name: string;
  brand: Brand;
  category: DeviceCategory;
  viewport: { width: number; height: number };
  dpr: number;
  userAgent?: string;
  bezel: {
    radius: number;
    thickness: number;
    color: string;
  };
  safeArea: SafeArea;
  features: HardwareFeature[];
  supportsRotation: boolean;
}
