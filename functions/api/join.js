import { parse, lookup } from "../_lib/invite.js";

export async function onRequest({ request }) {
  const invite = parse(new URL(request.url));
  const game = invite ? await lookup(invite.placeId) : null;
  return new Response(JSON.stringify(invite ? { ...invite, game } : { error: "invalid" }), {
    status: invite ? 200 : 400,
    headers: { "content-type": "application/json", "cache-control": invite ? "public, max-age=120" : "no-store", "x-content-type-options": "nosniff" }
  });
}
