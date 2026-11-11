export async function onRequest({ request }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^\d{1,20}$/.test(id)) return new Response("bad id", { status: 400 });
  try {
    const asset = await fetch(`https://assetdelivery.roblox.com/v2/assetId/${id}`).then((r) => r.json());
    const location = asset.locations?.[0]?.location;
    if (!location || new URL(location).hostname !== "fts.rbxcdn.com") return new Response("not found", { status: 404 });
    const clip = await fetch(location);
    if (!clip.ok) return new Response("unavailable", { status: 502 });
    return new Response(clip.body, { headers: { "content-type": "video/webm", "cache-control": "public, max-age=86400" } });
  } catch {
    return new Response("unavailable", { status: 502 });
  }
}
