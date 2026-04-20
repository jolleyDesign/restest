import { toPng } from "html-to-image";

const iframeRefs = new Map<string, HTMLIFrameElement>();
const snapshots = new Map<string, string>();
const subscribers = new Set<() => void>();

export function registerIframe(
  id: string,
  el: HTMLIFrameElement | null,
): void {
  if (el) iframeRefs.set(id, el);
  else iframeRefs.delete(id);
}

export function getSnapshot(id: string): string | undefined {
  return snapshots.get(id);
}

export function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function emit(): void {
  for (const fn of subscribers) fn();
}

export function invalidateAll(): void {
  snapshots.clear();
  emit();
}

export function invalidate(id: string): void {
  if (snapshots.delete(id)) emit();
}

export async function captureSnapshot(id: string): Promise<void> {
  const el = iframeRefs.get(id);
  if (!el) return;
  let doc: Document | null = null;
  try {
    doc = el.contentDocument;
  } catch {
    // cross-origin — can't read
    return;
  }
  if (!doc || !doc.documentElement) return;

  const width = el.clientWidth;
  const height = el.clientHeight;
  if (width === 0 || height === 0) return;

  try {
    const dataURL = await toPng(doc.documentElement, {
      width,
      height,
      cacheBust: false,
      pixelRatio: 1,
      skipFonts: true,
    });
    snapshots.set(id, dataURL);
    emit();
  } catch {
    // capture failed (cross-origin resources, taint, etc.) — leave as-is
  }
}
