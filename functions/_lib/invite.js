export const SITE = "https://voidstrapp.pages.dev";
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const fmt = (n) => (Number.isFinite(n) ? new Intl.NumberFormat("en-US", { notation: n >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n) : null);

function safeThumb(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".rbxcdn.com") ? url.href : null;
  } catch {
    return null;
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(5000), cf: { cacheTtl: 300, cacheEverything: true } });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function lookup(placeId) {
  try {
    const { universeId } = await getJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    if (!universeId) return null;
    const [games, thumbs, icons] = await Promise.allSettled([
      getJson(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
      getJson(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=1&size=768x432&format=Png&isCircular=false`),
      getJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=256x256&format=Png&isCircular=false`)
    ]);
    const game = games.status === "fulfilled" ? games.value?.data?.[0] : null;
    if (!game) return null;
    return {
      name: game.name,
      creator: game.creator?.name,
      verified: !!game.creator?.hasVerifiedBadge,
      description: typeof game.description === "string" ? game.description.trim() : "",
      playing: game.playing,
      visits: game.visits,
      maxPlayers: game.maxPlayers,
      rootPlaceId: game.rootPlaceId,
      genres: [...new Set([game.genre_l1, game.genre_l2].filter((g) => typeof g === "string" && g.trim()).map((g) => g.trim().slice(0, 40)))].slice(0, 2).concat(!game.genre_l1 && game.genre && game.genre !== "All" ? [String(game.genre).slice(0, 40)] : []),
      thumb: thumbs.status === "fulfilled" ? safeThumb(thumbs.value?.data?.[0]?.thumbnails?.[0]?.imageUrl) : null,
      icon: icons.status === "fulfilled" ? safeThumb(icons.value?.data?.[0]?.imageUrl) : null
    };
  } catch {
    return null;
  }
}

export function parse(url) {
  const q = url.searchParams;
  const placeId = ((q.get("placeId") || q.get("placeid") || "").match(/^\s*(\d{1,20})/) || [])[1] || "";
  if (!/^\d{1,20}$/.test(placeId) || placeId === "0") return null;
  const job = ((q.get("gameInstanceId") || q.get("jobId") || "").match(/[0-9a-f-]{36}/i) || [])[0] || "";
  const access = ((q.get("accessCode") || "").match(/[0-9a-f-]{36}/i) || [])[0] || "";
  const launchData = (q.get("launchData") || "").slice(0, 200);
  let deeplink = `roblox://experiences/start?placeId=${placeId}`;
  let kind = "game";
  if (GUID.test(job)) {
    deeplink += `&gameInstanceId=${job.toLowerCase()}`;
    kind = "server";
  } else if (GUID.test(access)) {
    deeplink += `&accessCode=${access.toLowerCase()}`;
    kind = "private";
  }
  if (launchData) deeplink += `&launchData=${encodeURIComponent(launchData)}`;
  return { placeId, deeplink, kind };
}

