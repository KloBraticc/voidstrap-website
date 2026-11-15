const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": status === 200 ? "public, max-age=900" : "public, max-age=120",
      "x-content-type-options": "nosniff"
    }
  });

const CACHE_KEY = "https://voidstrapp.pages.dev/cache/featured-v3.json";
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

const ID = /^\d{1,20}$/;
const SCAN = 40;
const BATCH = 8;

async function trailerId(game) {
  const media = await getJson(`https://games.roblox.com/v2/games/${game.universeId}/media`).catch(() => null);
  const clip = (media?.data || []).find((m) => m.assetType === "GamePreviewVideo" && m.approved && ID.test(String(m.videoId)));
  return clip ? String(clip.videoId) : null;
}

async function build() {
  try {
    const sorts = await getJson(`https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=${crypto.randomUUID()}`);
    const top = (sorts.sorts || []).find((s) => (s.sortId || "").includes("top-playing"));
    const games = (top?.games || [])
      .filter((g) => !/brookhaven/i.test(g.name) && ID.test(String(g.universeId)) && ID.test(String(g.rootPlaceId)))
      .sort((a, b) => (Number(b.playerCount) || 0) - (Number(a.playerCount) || 0))
      .slice(0, SCAN);
    for (let i = 0; i < games.length; i += BATCH) {
      const batch = games.slice(i, i + BATCH);
      const ids = await Promise.all(batch.map(trailerId));
      for (let j = 0; j < batch.length; j++) {
        if (!ids[j]) continue;
        const game = batch[j];
        const video = await clipUrl(ids[j]).catch(() => null);
        if (!video) continue;
        return respond(game, ids[j], video);
      }
    }
    return json({ error: "no trailer" }, 404);
  } catch {
    return json({ error: "unavailable" }, 502);
  }
}

async function respond(game, videoId, video) {
  const thumbs = await getJson(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${game.universeId}&size=768x432&format=Webp&countPerUniverse=1`).catch(() => null);
  const up = Number(game.totalUpVotes) || 0;
  const votes = up + (Number(game.totalDownVotes) || 0);
  return json({
    name: String(game.name || "").slice(0, 120),
    players: Number(game.playerCount) || 0,
    likes: votes ? Math.round((up / votes) * 100) : null,
    url: `https://www.roblox.com/games/${game.rootPlaceId}`,
    launch: `roblox://experiences/start?placeId=${game.rootPlaceId}`,
    thumbnail: safeThumb(thumbs?.data?.[0]?.thumbnails?.[0]?.imageUrl),
    videoId,
    video
  });
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
