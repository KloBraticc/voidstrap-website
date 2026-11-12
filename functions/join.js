import { SITE, parse, lookup, fmt } from "./_lib/invite.js";
import { vividColor } from "./_lib/color.js";

class SetAttr {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { el.setAttribute(this.attr, this.value); }
}
class SetText {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const invite = parse(url);
  const [shell, game] = await Promise.all([
    env.ASSETS.fetch(new URL("/", url)),
    invite ? lookup(invite.placeId) : null
  ]);
  const name = game?.name || (invite ? `Place ${invite.placeId}` : null);
  const action = !invite ? null : invite.kind === "server" ? "Join my server" : invite.kind === "private" ? "Join my private server" : "Play with me";
  const playing = fmt(game?.playing);
  const title = invite ? `${action} in ${name}` : "Invite unavailable | Voidstrap";
  const summary = (game?.description || "").replace(/\s+/g, " ").trim();
  const desc = summary ? (summary.length > 340 ? summary.slice(0, 339).trimEnd() + "…" : summary) : invite ? [`${action} in ${name} on Roblox.`, playing ? `${playing} playing right now.` : "", "Opens straight in Voidstrap."].filter(Boolean).join(" ") : "This Voidstrap invite link is not valid.";
  const image = game?.thumb || game?.icon || `${SITE}/assets/img/shots/home.webp`;
  const color = (game?.thumb && (await vividColor(game.thumb.replace(/\/768\/432\//, "/256/144/")))) || "#a77bff";
  const genres = game?.genres?.length ? game.genres.join(" · ") : "";
  const kindLabel = invite?.kind === "server" ? "Live server" : invite?.kind === "private" ? "Private server" : "";
  const siteName = ["Voidstrap", kindLabel, genres].filter(Boolean).join("  •  ");
  const oembed = new URLSearchParams();
  if (invite) oembed.set("placeId", invite.placeId);
  if (game?.creator) oembed.set("creator", game.creator);
  if (game) { oembed.set("playing", String(game.playing ?? 0)); oembed.set("visits", String(game.visits ?? 0)); }
  const canonical = `${SITE}/join${url.search}`;
  const out = new HTMLRewriter()
    .on("title", new SetText(invite ? `${title} | Voidstrap` : title))
    .on('meta[name="description"]', new SetAttr("content", desc))
    .on('meta[name="robots"]', new SetAttr("content", "noindex"))
    .on('meta[name="theme-color"]', new SetAttr("content", color))
    .on('link[rel="canonical"]', new SetAttr("href", canonical))
    .on('meta[property="og:url"]', new SetAttr("content", canonical))
    .on('meta[property="og:title"]', new SetAttr("content", title))
    .on('meta[name="twitter:title"]', new SetAttr("content", title))
    .on('meta[property="og:description"]', new SetAttr("content", desc))
    .on('meta[name="twitter:description"]', new SetAttr("content", desc))
    .on('meta[property="og:image"]', new SetAttr("content", image))
    .on('meta[name="twitter:image"]', new SetAttr("content", image))
    .on('meta[property="og:image:alt"]', new SetAttr("content", name || "Voidstrap"))
    .on('meta[property="og:site_name"]', new SetAttr("content", siteName))
    .on('script[type="application/ld+json"]', { element: (el) => el.remove() })
    .on("head", { element: (el) => el.append(`<link rel="alternate" type="application/json+oembed" href="${SITE}/oembed?${oembed.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`, { html: true }) })
    .transform(shell);
  const headers = new Headers(out.headers);
  headers.delete("cross-origin-embedder-policy");
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex");
  return new Response(out.body, { status: invite ? 200 : 400, headers });
}
