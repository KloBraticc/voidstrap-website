export async function onRequest({ request }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,20}$/.test(id)) return new Response("bad id", { status: 400 });
  try {
    const asset = await fetch(`https://assetdelivery.roblox.com/v2/assetId/${id}`).then((r) => r.json());
    const location = asset.locations?.[0]?.location;
    if (!location || new URL(location).hostname !== "fts.rbxcdn.com") return new Response("not found", { status: 404 });
    const range = request.headers.get("range");
    const clip = await fetch(location, range && /^bytes=\d*-\d*$/.test(range) ? { headers: { range } } : {});
    if (!clip.ok) return new Response("unavailable", { status: 502 });
    const headers = { "content-type": "video/webm", "cache-control": "public, max-age=86400", "accept-ranges": "bytes" };
    for (const key of ["content-length", "content-range"]) {
      const value = clip.headers.get(key);
      if (value) headers[key] = value;
    }
    return new Response(clip.body, { status: clip.status, headers });
  } catch {
    return new Response("unavailable", { status: 502 });
  }
}
