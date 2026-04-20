import { useEffect, useState } from "react";
import type { Device, HardwareFeature } from "../devices/types";

interface Props {
  device: Device;
  height: number;
  screenW: number;
  rotated: boolean;
}

function formatTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h.toString()}:${m.toString().padStart(2, "0")}`;
}

function useLiveTime(): string {
  const [t, setT] = useState(formatTime());
  useEffect(() => {
    const id = setInterval(() => setT(formatTime()), 15_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Clock/icons need to avoid overlapping a centered Dynamic Island / notch / hole-punch.
// We return the horizontal gap to leave in the middle.
function centerCutoutWidth(device: Device): number {
  const f = device.features.find(
    (x): x is Extract<HardwareFeature, { kind: "dynamic-island" | "notch" }> =>
      x.kind === "dynamic-island" || x.kind === "notch",
  );
  if (f) return f.widthPx + 16;
  const hp = device.features.find(
    (x): x is Extract<HardwareFeature, { kind: "hole-punch" }> =>
      x.kind === "hole-punch" && x.position === "top-center",
  );
  if (hp) return hp.diameterPx + 16;
  return 0;
}

export function StatusBar({ device, height, screenW, rotated }: Props) {
  const time = useLiveTime();
  if (height <= 0 || rotated) return null; // landscape status bars are tiny/hidden on iPhones

  const isApple = device.brand === "Apple";
  const cutout = centerCutoutWidth(device);
  const sideWidth = (screenW - cutout) / 2;

  // Vertical alignment: the clock typically sits slightly above the DI/notch on iPhone,
  // centered vertically with it on Android.
  const alignBottom = isApple && cutout > 0 ? false : false;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: screenW,
        height,
        pointerEvents: "none",
        zIndex: 6,
        color: "#fff",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15))",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily:
          isApple
            ? '-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif'
            : "Roboto, system-ui, sans-serif",
        fontSize: isApple ? 15 : 13,
        fontWeight: isApple ? 600 : 500,
        letterSpacing: isApple ? 0 : 0.1,
        display: "flex",
        alignItems: alignBottom ? "flex-end" : "center",
      }}
    >
      <div
        style={{
          width: sideWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: isApple ? 28 : 20,
        }}
      >
        <span className="tabular-nums">{time}</span>
      </div>
      <div style={{ width: cutout }} />
      <div
        style={{
          width: sideWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: isApple ? 6 : 8,
          paddingRight: isApple ? 22 : 16,
        }}
      >
        {isApple ? (
          <>
            <SignalBars />
            <Wifi />
            <Battery />
          </>
        ) : (
          <>
            <Wifi />
            <SignalBars />
            <Battery />
          </>
        )}
      </div>
    </div>
  );
}

function SignalBars() {
  return (
    <svg width={17} height={11} viewBox="0 0 17 11" fill="currentColor">
      <rect x={0} y={7} width={3} height={4} rx={0.5} />
      <rect x={5} y={5} width={3} height={6} rx={0.5} />
      <rect x={10} y={2} width={3} height={9} rx={0.5} />
      <rect x={14} y={0} width={3} height={11} rx={0.5} opacity={0.45} />
    </svg>
  );
}

function Wifi() {
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M1 4.5 A 10 10 0 0 1 15 4.5" />
      <path d="M3.5 7 A 6 6 0 0 1 12.5 7" />
      <path d="M6 9.5 A 2.5 2.5 0 0 1 10 9.5" />
      <circle cx={8} cy={11} r={0.9} fill="currentColor" stroke="none" />
    </svg>
  );
}

function Battery() {
  return (
    <svg width={26} height={12} viewBox="0 0 26 12" fill="none" stroke="currentColor">
      <rect x={0.5} y={0.5} width={22} height={11} rx={2.5} strokeWidth={1} opacity={0.5} />
      <rect x={2} y={2} width={18} height={8} rx={1.5} fill="currentColor" />
      <rect x={23.5} y={3.5} width={2} height={5} rx={1} fill="currentColor" opacity={0.5} />
    </svg>
  );
}
