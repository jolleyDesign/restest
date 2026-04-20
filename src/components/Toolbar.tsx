import { useEffect, useState } from "react";
import { useStore } from "../store";

export function Toolbar() {
  const url = useStore((s) => s.url);
  const setUrl = useStore((s) => s.setUrl);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const showHardware = useStore((s) => s.showHardware);
  const toggleHardware = useStore((s) => s.toggleHardware);
  const showSafeArea = useStore((s) => s.showSafeArea);
  const toggleSafeArea = useStore((s) => s.toggleSafeArea);
  const proxyMode = useStore((s) => s.proxyMode);
  const toggleProxy = useStore((s) => s.toggleProxy);
  const context = useStore((s) => s.context);
  const setContext = useStore((s) => s.setContext);
  const reloadAll = useStore((s) => s.reloadAll);

  const [draft, setDraft] = useState(url);

  useEffect(() => setDraft(url), [url]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let next = draft.trim();
    if (next && !/^https?:\/\//i.test(next)) next = `http://${next}`;
    setUrl(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="font-semibold tracking-tight text-neutral-100 mr-2">
        restest
      </div>

      <form onSubmit={submit} className="flex-1 min-w-[260px] flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="http://localhost:3000 or https://example.com"
          className="flex-1 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
        >
          Load
        </button>
        <button
          type="button"
          onClick={reloadAll}
          className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm"
          title="Reload all devices"
        >
          ↻
        </button>
      </form>

      <div
        className="inline-flex rounded border border-neutral-800 bg-neutral-900 p-0.5"
        title="Rendering context — mimics how the site behaves in a mobile browser, installed PWA, or fullscreen/immersive app."
      >
        <Seg active={context === "browser"} onClick={() => setContext("browser")}>
          Browser
        </Seg>
        <Seg active={context === "pwa"} onClick={() => setContext("pwa")}>
          PWA
        </Seg>
        <Seg
          active={context === "fullscreen"}
          onClick={() => setContext("fullscreen")}
        >
          Fullscreen
        </Seg>
      </div>

      <Toggle label="Hardware" on={showHardware} onClick={toggleHardware} />
      <Toggle
        label="Safe area"
        on={showSafeArea}
        onClick={toggleSafeArea}
        title="Show dashed hardware safe-area bands for debugging"
      />
      <Toggle
        label="Proxy"
        on={proxyMode}
        onClick={toggleProxy}
        title="Route through local proxy (requires `npm run proxy`)"
      />

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        Zoom
        <input
          type="range"
          min={0.25}
          max={1}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="accent-indigo-500"
        />
        <span className="tabular-nums w-10 text-neutral-400">
          {Math.round(zoom * 100)}%
        </span>
      </label>
    </div>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  on,
  onClick,
  title,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
        on
          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}
