import type { CSSProperties } from "react";
import type { SafeArea } from "../devices/types";

interface Props {
  safeArea: SafeArea;
  rotated: boolean;
}

export function SafeAreaOverlay({ safeArea, rotated }: Props) {
  const sa = rotated
    ? {
        top: safeArea.left,
        right: safeArea.top,
        bottom: safeArea.right,
        left: safeArea.bottom,
      }
    : safeArea;

  const band: CSSProperties = {
    position: "absolute",
    background: "rgba(239, 68, 68, 0.22)",
    borderColor: "rgba(239, 68, 68, 0.65)",
    borderStyle: "dashed",
    borderWidth: 0,
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9,
      }}
    >
      {sa.top > 0 && (
        <div style={{ ...band, top: 0, left: 0, right: 0, height: sa.top, borderBottomWidth: 1 }} />
      )}
      {sa.bottom > 0 && (
        <div style={{ ...band, bottom: 0, left: 0, right: 0, height: sa.bottom, borderTopWidth: 1 }} />
      )}
      {sa.left > 0 && (
        <div style={{ ...band, top: 0, bottom: 0, left: 0, width: sa.left, borderRightWidth: 1 }} />
      )}
      {sa.right > 0 && (
        <div style={{ ...band, top: 0, bottom: 0, right: 0, width: sa.right, borderLeftWidth: 1 }} />
      )}
    </div>
  );
}
