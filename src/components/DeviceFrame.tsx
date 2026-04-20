import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { computeLayout } from "../devices/context";
import type { Device, SafeArea } from "../devices/types";
import {
  captureSnapshot,
  getSnapshot,
  registerIframe,
  subscribe,
} from "../snapshots";
import { useStore } from "../store";
import { BrowserChrome } from "./BrowserChrome";
import { HardwareOverlay } from "./HardwareOverlay";
import { SafeAreaOverlay } from "./SafeAreaOverlay";
import { StatusBar } from "./StatusBar";

// CSS custom properties we inject into same-origin iframes so dev sites can
// opt into realistic safe-area values even though env() inside an iframe is 0.
// Devs use: `padding-top: max(env(safe-area-inset-top), var(--restest-safe-top, 0px));`
function injectSafeAreaVars(
  iframe: HTMLIFrameElement,
  insets: SafeArea,
): void {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return;
    const id = "__restest_safe_area_style__";
    let style = doc.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = id;
      doc.head.appendChild(style);
    }
    style.textContent = `:root {
  --restest-safe-top: ${insets.top}px;
  --restest-safe-right: ${insets.right}px;
  --restest-safe-bottom: ${insets.bottom}px;
  --restest-safe-left: ${insets.left}px;
}`;
  } catch {
    // cross-origin — access denied, silently ignore
  }
}

interface Props {
  device: Device;
  url: string;
  zoomOverride?: number; // if set, ignore store zoom (used by focus mode)
}

function rotateSafeArea(sa: SafeArea, rotated: boolean): SafeArea {
  if (!rotated) return sa;
  return { top: sa.left, right: sa.top, bottom: sa.right, left: sa.bottom };
}

function buildIframeUrl(url: string, proxy: boolean): string {
  if (!url) return "about:blank";
  if (!proxy) return url;
  return `http://localhost:5180/proxy?url=${encodeURIComponent(url)}`;
}

// How long a frame must sit off-screen before we capture a snapshot and tear
// down its iframe. Gives scroll-pause time before reclaiming memory.
const OFFSCREEN_DWELL_MS = 3000;

// Eagerness of mounting: iframe becomes "near" this far outside the viewport.
// Small value = more aggressive memory reclamation, more reload churn.
const NEAR_ROOT_MARGIN = "200px";

export function DeviceFrame({ device, url, zoomOverride }: Props) {
  const storeZoom = useStore((s) => s.zoom);
  const zoom = zoomOverride ?? storeZoom;
  const setFocusedDevice = useStore((s) => s.setFocusedDevice);
  const focusedDeviceId = useStore((s) => s.focusedDeviceId);
  const isFocused = focusedDeviceId === device.id;
  const showHardware = useStore((s) => s.showHardware);
  const showSafeArea = useStore((s) => s.showSafeArea);
  const proxyMode = useStore((s) => s.proxyMode);
  const context = useStore((s) => s.context);
  const reloadTick = useStore((s) => s.reloadTick);
  const orientation = useStore((s) => s.orientations[device.id]) ?? "portrait";
  const setOrientation = useStore((s) => s.setOrientation);

  const snapshot = useSyncExternalStore(
    subscribe,
    () => getSnapshot(device.id),
    () => undefined,
  );

  const rotated = orientation === "landscape" && device.supportsRotation;
  const screenW = rotated ? device.viewport.height : device.viewport.width;
  const screenH = rotated ? device.viewport.width : device.viewport.height;

  const layout = computeLayout(device, context, rotated);
  const hwRotated = rotateSafeArea(device.safeArea, rotated);

  const t = device.bezel.thickness;
  const frameW = screenW + t * 2;
  const frameH = screenH + t * 2;

  const iframeX = layout.insets.left;
  const iframeY = layout.insets.top;
  const iframeW = screenW - layout.insets.left - layout.insets.right;
  const iframeH = screenH - layout.insets.top - layout.insets.bottom;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setIframeRef = (el: HTMLIFrameElement | null) => {
    iframeRef.current = el;
    registerIframe(device.id, el);
  };

  // Whether the IntersectionObserver has decided to keep the iframe mounted.
  // Focus mode bypasses this; see `isLive` below.
  const [nearViewport, setNearViewport] = useState(false);
  const isLive = nearViewport || isFocused;

  // Re-inject safe-area vars whenever the hardware insets change (device swap, rotation).
  useEffect(() => {
    if (iframeRef.current) injectSafeAreaVars(iframeRef.current, hwRotated);
  }, [hwRotated.top, hwRotated.right, hwRotated.bottom, hwRotated.left]);

  // Viewport-aware mount/unmount with dwell. When near the viewport, ensure
  // the iframe is live. When off-screen for longer than OFFSCREEN_DWELL_MS,
  // capture a snapshot of the current DOM and unmount.
  useEffect(() => {
    if (isFocused) return; // focus mode bypasses this logic
    const el = containerRef.current;
    if (!el) return;

    let teardownTimer: number | null = null;
    const clearTeardown = () => {
      if (teardownTimer !== null) {
        window.clearTimeout(teardownTimer);
        teardownTimer = null;
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            clearTeardown();
            setNearViewport(true);
          } else {
            clearTeardown();
            teardownTimer = window.setTimeout(() => {
              // Kick off snapshot synchronously (the DOM clone happens before
              // the first internal await), then unmount. The snapshot resolves
              // in the background and notifies subscribers.
              void captureSnapshot(device.id);
              setNearViewport(false);
              teardownTimer = null;
            }, OFFSCREEN_DWELL_MS);
          }
        }
      },
      { rootMargin: NEAR_ROOT_MARGIN },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTeardown();
    };
  }, [device.id, isFocused]);

  const iframeSrc = buildIframeUrl(url, proxyMode);

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ width: frameW * zoom }}
    >
      <div className="flex items-center justify-between w-full text-xs text-neutral-400 px-1">
        <span className="font-medium text-neutral-200 truncate" title={device.name}>
          {device.name}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span
            className="tabular-nums"
            title={`screen ${screenW}×${screenH} · viewport ${iframeW}×${iframeH}`}
          >
            {iframeW}×{iframeH}
          </span>
          {device.supportsRotation && (
            <button
              type="button"
              className="rounded p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 inline-flex items-center justify-center"
              onClick={() =>
                setOrientation(device.id, rotated ? "portrait" : "landscape")
              }
              title="Rotate"
              aria-label="Rotate"
            >
              <RotateIcon />
            </button>
          )}
          <button
            type="button"
            className="rounded p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 inline-flex items-center justify-center"
            onClick={() => setFocusedDevice(isFocused ? null : device.id)}
            title={isFocused ? "Exit focus" : "Focus this device"}
            aria-label={isFocused ? "Exit focus" : "Focus"}
          >
            {isFocused ? <ShrinkIcon /> : <ExpandIcon />}
          </button>
        </span>
      </div>

      <div
        ref={containerRef}
        style={{ width: frameW * zoom, height: frameH * zoom, flexShrink: 0 }}
      >
        <div
          style={{
            width: frameW,
            height: frameH,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            background: device.bezel.color,
            borderRadius: device.bezel.radius,
            position: "relative",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: t,
              left: t,
              width: screenW,
              height: screenH,
              overflow: "hidden",
              borderRadius: Math.max(0, device.bezel.radius - t),
              background: "#18181d",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: iframeY,
                left: iframeX,
                width: iframeW,
                height: iframeH,
                overflow: "hidden",
                background: snapshot
                  ? `#fff url(${snapshot}) center/cover no-repeat`
                  : "repeating-linear-gradient(45deg, #f3f4f6 0 8px, #e5e7eb 8px 16px)",
              }}
            >
              {isLive && (
                <iframe
                  key={`${device.id}-${reloadTick}-${orientation}`}
                  ref={setIframeRef}
                  src={iframeSrc}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  style={{
                    width: iframeW,
                    height: iframeH,
                    border: 0,
                    display: "block",
                  }}
                  title={device.name}
                  onLoad={(e) =>
                    injectSafeAreaVars(e.currentTarget, hwRotated)
                  }
                />
              )}
            </div>

            {layout.statusBar.visible && (
              <StatusBar
                device={device}
                height={layout.statusBar.height}
                screenW={screenW}
                rotated={rotated}
              />
            )}

            {context === "browser" && (
              <BrowserChrome
                device={device}
                statusBarHeight={layout.statusBar.height}
                addressBarHeight={layout.addressBar.height}
                bottomToolbarHeight={layout.bottomToolbar.height}
                homeIndicatorHeight={hwRotated.bottom}
                screenW={screenW}
                screenH={screenH}
                url={url}
              />
            )}

            {showSafeArea && (
              <SafeAreaOverlay safeArea={device.safeArea} rotated={rotated} />
            )}
            {showHardware && (
              <HardwareOverlay
                device={device}
                width={screenW}
                height={screenH}
                rotated={rotated}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RotateIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8V3h5" />
      <path d="M21 8V3h-5" />
      <path d="M3 16v5h5" />
      <path d="M21 16v5h-5" />
    </svg>
  );
}

function ShrinkIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v5H3" />
      <path d="M16 3v5h5" />
      <path d="M8 21v-5H3" />
      <path d="M16 21v-5h5" />
    </svg>
  );
}
