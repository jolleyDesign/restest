import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

const BLOCKED_REQ_HEADERS = new Set([
  "host",
  "origin",
  "referer",
  "cookie",
  "connection",
  "accept-encoding",
]);

const STRIP_RES_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
  "strict-transport-security",
  "content-encoding",
  "content-length",
]);

app.get("/", (c) =>
  c.text(
    "restest proxy is running. GET /proxy?url=<target> to fetch with frame-blocking headers stripped.",
  ),
);

app.get("/proxy", async (c) => {
  const target = c.req.query("url");
  if (!target) return c.text("missing ?url=", 400);

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return c.text("invalid url", 400);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return c.text("only http(s) urls are allowed", 400);
  }

  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => {
    if (!BLOCKED_REQ_HEADERS.has(k.toLowerCase())) headers[k] = v;
  });
  headers["user-agent"] =
    headers["user-agent"] ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      headers,
      redirect: "follow",
    });
  } catch (err) {
    return c.text(`upstream fetch failed: ${(err as Error).message}`, 502);
  }

  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!STRIP_RES_HEADERS.has(k.toLowerCase())) resHeaders.set(k, v);
  });
  resHeaders.set("access-control-allow-origin", "*");

  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    const text = await upstream.text();
    const base = `<base href="${parsed.origin}${parsed.pathname.replace(/[^/]*$/, "")}">`;
    const injected = text.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n${base}`);
    resHeaders.set("content-type", contentType);
    return new Response(injected, {
      status: upstream.status,
      headers: resHeaders,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
});

const port = 5180;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`restest proxy listening on http://localhost:${info.port}`);
});
