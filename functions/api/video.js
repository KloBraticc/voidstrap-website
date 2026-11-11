const HEADERS = { "content-type": "video/webm", "cache-control": "public, max-age=86400", "accept-ranges": "bytes" };

async function load(id) {
  const asset = await fetch(`https://assetdelivery.roblox.com/v2/assetId/${id}`).then((r) => r.json());
  const location = asset.locations?.[0]?.location;
  if (!location || new URL(location).hostname !== "fts.rbxcdn.com") return null;
  const clip = await fetch(location);
  if (!clip.ok) return null;
  return new Response(await clip.arrayBuffer(), { headers: HEADERS });
}

export async function onRequest({ request }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,20}$/.test(id)) return new Response("bad id", { status: 400 });
  try {
    const key = new Request(`https://voidstrapp.pages.dev/clip/${id}.webm`);
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const range = request.headers.get("range");
    const lookup = new Request(key.url, range ? { headers: { range } } : {});
    let hit = cache && (await cache.match(lookup));
    if (hit) return hit;
    const full = await load(id);
    if (!full) return new Response("not found", { status: 404 });
    if (!cache) return full;
    await cache.put(key, full);
    hit = await cache.match(lookup);
    return hit || new Response("unavailable", { status: 502 });
  } catch {
    return new Response("unavailable", { status: 502 });
  }
}
