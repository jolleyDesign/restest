import type { Device } from "../devices/types";

interface Props {
  device: Device;
  statusBarHeight: number;
  addressBarHeight: number;
  bottomToolbarHeight: number;
  homeIndicatorHeight: number;
  screenW: number;
  screenH: number;
  url: string;
}

const BG = "rgba(28, 28, 32, 0.95)";
const BORDER = "rgba(255,255,255,0.06)";

export function BrowserChrome({
  device,
  statusBarHeight,
  addressBarHeight,
  bottomToolbarHeight,
  homeIndicatorHeight,
  screenW,
  url,
}: Props) {
  const isApple = device.brand === "Apple";

  let host = "";
  try {
    host = url ? new URL(url).host : "";
  } catch {
    host = url.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  }

  return (
    <>
      {addressBarHeight > 0 && (
        <div
          style={{
            position: "absolute",
            top: statusBarHeight,
            left: 0,
            width: screenW,
            height: addressBarHeight,
            background: BG,
            borderBottom: `1px solid ${BORDER}`,
            color: "#d4d4d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            zIndex: 5,
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              maxWidth: screenW * 0.8,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              fontSize: 12,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Lock />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                opacity: host ? 1 : 0.5,
              }}
            >
              {host || "New Tab"}
            </span>
          </div>
        </div>
      )}

      {bottomToolbarHeight > 0 && isApple && (
        <div
          style={{
            position: "absolute",
            bottom: homeIndicatorHeight,
            left: 0,
            width: screenW,
            height: bottomToolbarHeight,
            background: BG,
            borderTop: `1px solid ${BORDER}`,
            color: "#d4d4d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 5,
          }}
        >
          <NavBtn glyph="‹" />
          <NavBtn glyph="›" />
          <NavBtn glyph="⇪" />
          <NavBtn glyph="▢" />
          <NavBtn glyph="⊟" />
        </div>
      )}
    </>
  );
}

function Lock() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function NavBtn({ glyph }: { glyph: string }) {
  return <div style={{ opacity: 0.7, fontSize: 18, lineHeight: 1 }}>{glyph}</div>;
}
