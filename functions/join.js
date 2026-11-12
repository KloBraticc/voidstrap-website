import { SITE, parse, lookup, fmt } from "./_lib/invite.js";

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
  const desc = invite ? [`${action} in ${name} on Roblox.`, playing ? `${playing} playing right now.` : "", "Opens straight in Voidstrap."].filter(Boolean).join(" ") : "This Voidstrap invite link is not valid.";
  const image = game?.thumb || game?.icon || `${SITE}/assets/img/shots/home.webp`;
  const canonical = `${SITE}/join${url.search}`;
  const out = new HTMLRewriter()
    .on("title", new SetText(invite ? `${title} | Voidstrap` : title))
    .on('meta[name="description"]', new SetAttr("content", desc))
    .on('meta[name="robots"]', new SetAttr("content", "noindex"))
    .on('meta[name="theme-color"]', new SetAttr("content", "#a77bff"))
    .on('link[rel="canonical"]', new SetAttr("href", canonical))
    .on('meta[property="og:url"]', new SetAttr("content", canonical))
    .on('meta[property="og:title"]', new SetAttr("content", title))
    .on('meta[name="twitter:title"]', new SetAttr("content", title))
    .on('meta[property="og:description"]', new SetAttr("content", desc))
    .on('meta[name="twitter:description"]', new SetAttr("content", desc))
    .on('meta[property="og:image"]', new SetAttr("content", image))
    .on('meta[name="twitter:image"]', new SetAttr("content", image))
    .on('meta[property="og:image:alt"]', new SetAttr("content", name || "Voidstrap"))
    .on('script[type="application/ld+json"]', { element: (el) => el.remove() })
    .transform(shell);
  const headers = new Headers(out.headers);
  headers.delete("cross-origin-embedder-policy");
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex");
  return new Response(out.body, { status: invite ? 200 : 400, headers });
}
