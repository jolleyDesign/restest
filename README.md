# ResTest

A responsive testing tool that renders any URL inside realistic device frames — iPhones, Androids, tablets, foldables, and desktop — side by side in a single grid.

Built with React 19, Vite, Tailwind v4, and Zustand. A small Hono proxy strips frame-blocking headers (`X-Frame-Options`, CSP, etc.) so arbitrary pages can be loaded in iframes.

## Getting started

```bash
npm install
npm run dev      # Vite dev server
npm run proxy    # Hono proxy on http://localhost:5180
```

Open the app, paste a URL, and pick devices from the sidebar.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run proxy` — run the header-stripping proxy (`server/proxy.ts`)
- `npm run lint` — run ESLint

## Project layout

- `src/components/` — UI: toolbar, device picker, grid, device frames, overlays
- `src/devices/` — device catalog (iPhones, Androids, tablets, foldables, desktop)
- `src/store.ts` — Zustand store
- `src/snapshots.ts` — capture device frames as images via `html-to-image`
- `server/proxy.ts` — Hono proxy that fetches a target URL and strips headers that block iframe embedding

## Proxy

`GET /proxy?url=<target>` fetches the target, strips frame/CSP headers, rewrites the `<base href>` so relative assets resolve, and returns the response. Only `http(s)` URLs are allowed.
