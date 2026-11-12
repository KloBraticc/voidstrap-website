import { SITE, fmt } from "./_lib/invite.js";

const clean = (value, max) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);

export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams;
  const placeId = /^\d{1,20}$/.test(q.get("placeId") || "") ? q.get("placeId") : null;
  const playing = Number(q.get("playing"));
  const visits = Number(q.get("visits"));
  const author = [clean(q.get("creator"), 60) && `by ${clean(q.get("creator"), 60)}`, Number.isFinite(playing) && q.has("playing") ? `${fmt(playing)} playing` : "", Number.isFinite(visits) && q.has("visits") ? `${fmt(visits)} visits` : ""].filter(Boolean).join("  •  ");
  const body = {
    version: "1.0",
    type: "link",
    provider_name: "Voidstrap game invite",
    provider_url: SITE,
    ...(author ? { author_name: author, author_url: placeId ? `https://www.roblox.com/games/${placeId}` : SITE } : {})
  };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json+oembed; charset=utf-8", "cache-control": "public, max-age=300", "x-content-type-options": "nosniff" }
  });
}
