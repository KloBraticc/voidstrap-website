import { getFeatured } from "./featured.js";

const MAX_BYTES = 64 * 1024 * 1024;

const fail = (status, extra = {}) => new Response(null, { status, headers: { "cache-control": "no-store", ...extra } });

const baseHeaders = () => ({
  "content-type": "video/webm",
  "accept-ranges": "bytes",
  "cache-control": "public, max-age=900",
  "x-content-type-options": "nosniff",
  "cross-origin-resource-policy": "same-origin"
});

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  return start <= end && start < size ? { start, end } : null;
}

function serve(bytes, range) {
  const size = bytes.byteLength;
  if (!range) return new Response(bytes, { status: 200, headers: { ...baseHeaders(), "content-length": String(size) } });
  const part = parseRange(range, size);
  if (!part) return fail(416, { "content-range": `bytes */${size}` });
  return new Response(bytes.slice(part.start, part.end + 1), {
    status: 206,
    headers: { ...baseHeaders(), "content-length": String(part.end - part.start + 1), "content-range": `bytes ${part.start}-${part.end}/${size}` }
  });
}

export async function onRequestGet(context) {
  const id = new URL(context.request.url).searchParams.get("id");
  if (!id || !/^\d{1,20}$/.test(id)) return fail(400);
  const range = context.request.headers.get("range");
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const keyUrl = `https://voidstrapp.pages.dev/cache/video/${id}.webm`;

  if (cache) {
    const hit = await cache.match(new Request(keyUrl, { headers: range ? { range } : {} }));
    if (hit) return hit;
  }

  let source;
  try {
    const res = await getFeatured(context);
    if (!res.ok) return fail(404);
    const featured = await res.json();
    if (featured.videoId !== id) return fail(404);
    source = featured.video;
  } catch {
    return fail(502);
  }
  if (!source) return fail(404);

  const upstream = await fetch(source, { redirect: "manual", signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (!upstream || upstream.status !== 200 || !upstream.body) return fail(502);
  const declared = Number(upstream.headers.get("content-length")) || 0;
  if (declared > MAX_BYTES) return fail(502);
  const bytes = await upstream.arrayBuffer().catch(() => null);
  if (!bytes || bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return fail(502);

  if (cache && context.waitUntil) {
    context.waitUntil(cache.put(new Request(keyUrl), new Response(bytes, { headers: { ...baseHeaders(), "content-length": String(bytes.byteLength) } })));
  }
  return serve(bytes, range);
}
