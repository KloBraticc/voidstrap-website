import { getFeatured } from "./featured.js";

const MAX_BYTES = 40 * 1024 * 1024;
const HEADERS = {
  "content-type": "video/webm",
  "cache-control": "public, max-age=86400",
  "accept-ranges": "bytes",
  "x-content-type-options": "nosniff",
  "cross-origin-resource-policy": "same-origin"
};

const plain = (text, status) => new Response(text, { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });

async function featuredVideoId(context) {
  try {
    const response = await getFeatured(context);
    if (!response.ok) return null;
    const data = await response.json();
    return new URL(data.video, "https://voidstrapp.pages.dev").searchParams.get("id");
  } catch {
    return null;
  }
}

async function load(id) {
  const assetResponse = await fetch(`https://assetdelivery.roblox.com/v2/assetId/${id}`, { signal: AbortSignal.timeout(6000) });
  if (!assetResponse.ok) return null;
  const asset = await assetResponse.json();
  const location = asset.locations?.[0]?.location;
  if (!location) return null;
  const target = new URL(location);
  if (target.protocol !== "https:" || target.hostname !== "fts.rbxcdn.com") return null;
  const clip = await fetch(target, { redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!clip.ok || !clip.body) return null;
  if (Number(clip.headers.get("content-length") || 0) > MAX_BYTES) return null;
  const reader = clip.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new Response(new Blob(chunks), { headers: { ...HEADERS, "content-length": String(size) } });
}

export async function onRequestGet(context) {
  const { request } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,20}$/.test(id)) return plain("bad id", 400);
  try {
    const key = new Request(`https://voidstrapp.pages.dev/clip/${id}.webm`);
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const range = request.headers.get("range");
    const lookup = new Request(key.url, range ? { headers: { range } } : {});
    let hit = cache && (await cache.match(lookup));
    if (hit) return hit;
    if (id !== (await featuredVideoId(context))) return plain("not found", 404);
    const full = await load(id);
    if (!full) return plain("not found", 404);
    if (!cache) return full;
    await cache.put(key, full);
    hit = await cache.match(lookup);
    return hit || plain("unavailable", 502);
  } catch {
    return plain("unavailable", 502);
  }
}
