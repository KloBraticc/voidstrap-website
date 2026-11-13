const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": status === 200 ? "public, max-age=900" : "public, max-age=120",
      "x-content-type-options": "nosniff"
    }
  });

const CACHE_KEY = "https://voidstrapp.pages.dev/cache/featured-v2.json";
const TTL_MS = 15 * 60000;
let inflight = null;
let memo = null;

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function safeThumb(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".rbxcdn.com") ? url.href : null;
  } catch {
    return null;
  }
}

async function clipUrl(id) {
  const asset = await getJson(`https://assetdelivery.roblox.com/v2/assetId/${id}`);
  const location = asset.locations?.[0]?.location;
  if (!location) return null;
  const url = new URL(location);
  return url.protocol === "https:" && url.hostname === "fts.rbxcdn.com" ? url.href : null;
}

async function build() {
  try {
    const sorts = await getJson(`https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=${crypto.randomUUID()}`);
    const top = (sorts.sorts || []).find((s) => (s.sortId || "").includes("top-playing"));
    const games = (top?.games || []).filter((g) => !/brookhaven/i.test(g.name)).slice(0, 8);
    for (const game of games) {
      if (!/^\d{1,20}$/.test(String(game.universeId)) || !/^\d{1,20}$/.test(String(game.rootPlaceId))) continue;
      const media = await getJson(`https://games.roblox.com/v2/games/${game.universeId}/media`);
      const clip = (media.data || []).find((m) => m.assetType === "GamePreviewVideo" && m.videoId && m.approved);
      if (!clip || !/^\d{1,20}$/.test(String(clip.videoId))) continue;
      const video = await clipUrl(clip.videoId).catch(() => null);
      if (!video) continue;
      const thumbs = await getJson(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${game.universeId}&size=768x432&format=Webp&countPerUniverse=1`);
      const votes = game.totalUpVotes + game.totalDownVotes;
      return json({
        name: String(game.name || "").slice(0, 120),
        players: Number(game.playerCount) || 0,
        likes: votes ? Math.round((game.totalUpVotes / votes) * 100) : null,
        url: `https://www.roblox.com/games/${game.rootPlaceId}`,
        launch: `roblox://experiences/start?placeId=${game.rootPlaceId}`,
        thumbnail: safeThumb(thumbs.data?.[0]?.thumbnails?.[0]?.imageUrl),
        video
      });
    }
    return json({ error: "no trailer" }, 404);
  } catch {
    return json({ error: "unavailable" }, 502);
  }
}

export async function getFeatured(context) {
  const now = Date.now();
  if (memo && memo.until > now) return new Response(memo.body, memo.init);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(CACHE_KEY);
  const hit = cache && (await cache.match(key));
  if (hit) return hit;
  inflight ??= build().finally(() => { inflight = null; });
  const res = (await inflight).clone();
  memo = { body: await res.clone().text(), init: { status: res.status, headers: res.headers }, until: now + (res.ok ? TTL_MS : 120000) };
  if (cache && context.waitUntil) context.waitUntil(cache.put(key, res.clone()));
  return res;
}

export async function onRequestGet(context) {
  return getFeatured(context);
}
