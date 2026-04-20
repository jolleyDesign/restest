import type { Device, HardwareFeature } from "../devices/types";

interface Props {
  device: Device;
  width: number;
  height: number;
  rotated: boolean;
}

export function HardwareOverlay({ device, width, height, rotated }: Props) {
  const color = device.bezel.color;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {device.features.map((f, i) => (
        <FeatureShape
          key={i}
          feature={f}
          color={color}
          width={width}
          height={height}
          rotated={rotated}
        />
      ))}
    </svg>
  );
}

function FeatureShape({
  feature,
  color,
  width,
  height,
  rotated,
}: {
  feature: HardwareFeature;
  color: string;
  width: number;
  height: number;
  rotated: boolean;
}) {
  switch (feature.kind) {
    case "notch": {
      const x = (width - feature.widthPx) / 2;
      return (
        <rect
          x={x}
          y={rotated ? undefined : 0}
          {...(rotated
            ? { x: 0, y: (height - feature.widthPx) / 2, width: feature.heightPx, height: feature.widthPx }
            : { width: feature.widthPx, height: feature.heightPx })}
          rx={feature.radius}
          ry={feature.radius}
          fill={color}
        />
      );
    }
    case "dynamic-island": {
      if (rotated) {
        return (
          <rect
            x={feature.topOffsetPx}
            y={(height - feature.widthPx) / 2}
            width={feature.heightPx}
            height={feature.widthPx}
            rx={feature.heightPx / 2}
            ry={feature.heightPx / 2}
            fill={color}
          />
        );
      }
      return (
        <rect
          x={(width - feature.widthPx) / 2}
          y={feature.topOffsetPx}
          width={feature.widthPx}
          height={feature.heightPx}
          rx={feature.heightPx / 2}
          ry={feature.heightPx / 2}
          fill={color}
        />
      );
    }
    case "hole-punch": {
      const r = feature.diameterPx / 2;
      let cx: number, cy: number;
      if (rotated) {
        cx = feature.topOffsetPx + r;
        cy =
          feature.position === "top-center"
            ? height / 2
            : feature.position === "top-left"
              ? height - (r + 12)
              : r + 12;
      } else {
        cy = feature.topOffsetPx + r;
        cx =
          feature.position === "top-center"
            ? width / 2
            : feature.position === "top-left"
              ? r + 12
              : width - (r + 12);
      }
      return <circle cx={cx} cy={cy} r={r} fill={color} />;
    }
    case "home-indicator": {
      const w = feature.widthPx;
      const h = feature.heightPx;
      if (rotated) {
        return (
          <rect
            x={width - feature.bottomOffsetPx - h}
            y={(height - w) / 2}
            width={h}
            height={w}
            rx={h / 2}
            ry={h / 2}
            fill="#ffffff"
            opacity={0.75}
          />
        );
      }
      return (
        <rect
          x={(width - w) / 2}
          y={height - feature.bottomOffsetPx - h}
          width={w}
          height={h}
          rx={h / 2}
          ry={h / 2}
          fill="#ffffff"
          opacity={0.75}
        />
      );
    }
  }
}
