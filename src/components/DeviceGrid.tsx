import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { devicesById } from "../devices/catalog";
import { useStore } from "../store";
import { DeviceFrame } from "./DeviceFrame";

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

export function DeviceGrid() {
  const selectedIds = useStore((s) => s.selectedIds);
  const url = useStore((s) => s.url);
  const setZoom = useStore((s) => s.setZoom);
  const focusedDeviceId = useStore((s) => s.focusedDeviceId);
  const setFocusedDevice = useStore((s) => s.setFocusedDevice);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panReadyRef = useRef(false);
  const panningRef = useRef(false);
  const [panReady, setPanReady] = useState(false);
  const [panning, setPanning] = useState(false);

  const devices = useMemo(
    () =>
      selectedIds
        .map((id) => devicesById.get(id))
        .filter((d): d is NonNullable<typeof d> => !!d),
    [selectedIds],
  );

  const focusedDevice = focusedDeviceId
    ? devicesById.get(focusedDeviceId)
    : null;

  // ESC exits focus mode
  useEffect(() => {
    if (!focusedDevice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedDevice(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedDevice, setFocusedDevice]);

  // Compute fit-to-viewport zoom when focus mode is active
  const [focusZoom, setFocusZoom] = useState(1);
  useLayoutEffect(() => {
    if (!focusedDevice) return;
    const el = scrollRef.current;
    if (!el) return;

    const recompute = () => {
      if (!focusedDevice) return;
      const padding = 80;
      const availableW = el.clientWidth - padding;
      const availableH = el.clientHeight - padding - 40; // reserve room for title bar
      const t = focusedDevice.bezel.thickness;
      const w = focusedDevice.viewport.width + t * 2;
      const h = focusedDevice.viewport.height + t * 2;
      const z = Math.min(availableW / w, availableH / h);
      setFocusZoom(Math.max(0.1, Math.min(2, z)));
    };
    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [focusedDevice]);

  // Ctrl/Cmd + wheel = zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      const z = useStore.getState().zoom;
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * factor));
      setZoom(Number(next.toFixed(3)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  // Space to enter pan-ready, and mousedown/move/up to drag-pan
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isTyping = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        t.isContentEditable
      );
    };

    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isTyping(e.target)) return;
      // Prevent the browser's native space-bar page scroll on every keydown,
      // including auto-repeats while the key is held during a pan.
      e.preventDefault();
      if (e.repeat) return;
      panReadyRef.current = true;
      setPanReady(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      panReadyRef.current = false;
      panningRef.current = false;
      setPanReady(false);
      setPanning(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!panReadyRef.current || e.button !== 0) return;
      panningRef.current = true;
      setPanning(true);
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
      e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!panningRef.current) return;
      el.scrollLeft = scrollLeft - (e.clientX - startX);
      el.scrollTop = scrollTop - (e.clientY - startY);
    };
    const onMouseUp = () => {
      if (!panningRef.current) return;
      panningRef.current = false;
      setPanning(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (devices.length === 0 && !focusedDevice) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        No devices selected. Pick some from the sidebar.
      </div>
    );
  }

  const cursor = panning ? "grabbing" : panReady ? "grab" : "auto";

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto p-6 select-none relative"
      style={{ cursor }}
    >
      <div
        className="flex flex-wrap items-start gap-8"
        style={{
          pointerEvents: panReady ? "none" : "auto",
          display: focusedDevice ? "none" : undefined,
        }}
      >
        {devices.map((d) => (
          <DeviceFrame key={d.id} device={d} url={url} />
        ))}
      </div>
      {focusedDevice && (
        <div className="flex items-center justify-center min-h-full">
          <DeviceFrame
            key={`focus-${focusedDevice.id}`}
            device={focusedDevice}
            url={url}
            zoomOverride={focusZoom}
          />
        </div>
      )}
      <HintPill panReady={panReady} focused={!!focusedDevice} />
    </div>
  );
}

function HintPill({
  panReady,
  focused,
}: {
  panReady: boolean;
  focused: boolean;
}) {
  const text = focused
    ? "Esc to exit focus"
    : panReady
      ? "Drag to pan"
      : "⌘/Ctrl + scroll: zoom  ·  Space + drag: pan";
  return (
    <div
      className="pointer-events-none fixed bottom-3 right-4 text-[11px] text-neutral-500 bg-neutral-900/80 border border-neutral-800 rounded px-2 py-1"
      style={{ opacity: panReady || focused ? 1 : 0.6 }}
    >
      {text}
    </div>
  );
}
