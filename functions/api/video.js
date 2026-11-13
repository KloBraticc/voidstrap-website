import { getFeatured } from "./featured.js";

const fail = (status) => new Response(null, { status, headers: { "cache-control": "no-store" } });

export async function onRequestGet(context) {
  let source;
  try {
    const res = await getFeatured(context);
    if (!res.ok) return fail(404);
    source = (await res.json()).video;
  } catch {
    return fail(502);
  }
  if (!source) return fail(404);
  const range = context.request.headers.get("range");
  const upstream = await fetch(source, { headers: range ? { range } : {}, redirect: "manual", signal: AbortSignal.timeout(15000) }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) return fail(502);
  const headers = new Headers({
    "content-type": "video/webm",
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=900",
    "x-content-type-options": "nosniff",
    "cross-origin-resource-policy": "same-origin"
  });
  for (const name of ["content-length", "content-range"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
