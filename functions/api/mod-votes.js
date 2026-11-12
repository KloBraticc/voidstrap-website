const MAX_BODY = 512;
const RATE_LIMIT_PER_MINUTE = 20;
const RATE_LIMIT_PER_DAY = 300;
const LIBRARY_URL = "https://raw.githubusercontent.com/KloBraticc/voidstrap-mods-library/index/index.json";
const MOD_ID = /^[0-9]{1,20}\/[a-z0-9][a-z0-9._-]{0,99}$/i;
const encoder = new TextEncoder();
const keyCache = new Map();

const json = (data, status = 200, cache = "no-store") => Response.json(data, {
  status,
  headers: {
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    ...(cache === "no-store" ? { "Vary": "*" } : {})
  }
});

const fail = (status, error) => json({ error }, status);

function networkOf(ip) {
  if (!ip) return null;
  if (!ip.includes(":")) return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) ? ip : null;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  if (left.length + right.length > 8 || [...left, ...right].some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  const full = [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
  return full.slice(0, 3).map((part) => part.padStart(4, "0")).join(":") + ":" + full[3].padStart(4, "0").slice(0, 2) + "00::/56";
}

async function hmac(secret, purpose, value) {
  let key = keyCache.get(secret);
  if (!key) {
    key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    keyCache.set(secret, key);
  }
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${purpose}\u0000${value}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function voterOf(request, env) {
  const network = networkOf(request.headers.get("CF-Connecting-IP"));
  return network ? hmac(env.VOTE_RATE_SECRET, "voter", network) : null;
}

async function getModIds(context) {
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(new URL("/cache/mod-vote-library", context.request.url));
  let response = cache && await cache.match(key);
  if (!response) {
    const upstream = await fetch(LIBRARY_URL, { cf: { cacheTtl: 300 } });
    if (!upstream.ok) throw new Error("Library unavailable");
    response = json(await upstream.json(), 200, "public, max-age=300");
    if (cache) context.waitUntil(cache.put(key, response.clone()));
  }
  const library = await response.json();
  const blocked = new Set((library.blocked || []).map((item) => typeof item === "string" ? item : item?.id));
  return new Set((library.mods || []).map((mod) => mod?.id).filter((id) => typeof id === "string" && !blocked.has(id)));
}

async function readBody(request) {
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY || !request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  const site = request.headers.get("Sec-Fetch-Site");
  return origin === new URL(request.url).origin && (!site || site === "same-origin");
}

async function rateLimited(env, voter, context) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const day = Math.floor(now / 86400000);
  const row = await env.MOD_VOTES.prepare(
    "INSERT INTO mod_vote_limits (client_hash, minute, attempts, day, day_attempts) VALUES (?, ?, 1, ?, 1) " +
    "ON CONFLICT (client_hash) DO UPDATE SET " +
    "attempts = CASE WHEN minute = excluded.minute THEN attempts + 1 ELSE 1 END, " +
    "minute = excluded.minute, " +
    "day_attempts = CASE WHEN day = excluded.day THEN day_attempts + 1 ELSE 1 END, " +
    "day = excluded.day " +
    "RETURNING attempts, day_attempts"
  ).bind(voter, minute, day).first();
  if (Math.random() < 0.02) {
    context.waitUntil(env.MOD_VOTES.prepare("DELETE FROM mod_vote_limits WHERE day < ?").bind(day - 1).run().catch(() => {}));
  }
  return !row || row.attempts > RATE_LIMIT_PER_MINUTE || row.day_attempts > RATE_LIMIT_PER_DAY;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.MOD_VOTES || !env.VOTE_RATE_SECRET) return fail(503, "Voting is unavailable.");
  try {
    const voter = await voterOf(request, env);
    const statements = [env.MOD_VOTES.prepare("SELECT mod_id, likes, dislikes FROM mod_vote_totals WHERE likes > 0 OR dislikes > 0")];
    if (voter) statements.push(env.MOD_VOTES.prepare("SELECT mod_id, vote FROM mod_votes WHERE voter_id = ?").bind(voter));
    const [totals, mine] = await env.MOD_VOTES.batch(statements);
    return json({
      totals: totals.results || [],
      votes: Object.fromEntries((mine?.results || []).map((row) => [row.mod_id, row.vote]))
    });
  } catch {
    return fail(503, "Voting is unavailable.");
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.MOD_VOTES || !env.VOTE_RATE_SECRET) return fail(503, "Voting is unavailable.");
  if (!sameOrigin(request) || !request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return fail(403, "Invalid request.");
  }
  try {
    const voter = await voterOf(request, env);
    if (!voter) return fail(403, "Voting is unavailable from this network.");
    if (await rateLimited(env, voter, context)) return fail(429, "Too many votes. Please try again later.");
    const body = await readBody(request);
    if (!body || typeof body.modId !== "string" || !MOD_ID.test(body.modId) || !Number.isInteger(body.vote) || ![-1, 0, 1].includes(body.vote)) {
      return fail(400, "Invalid request.");
    }
    if (!(await getModIds(context)).has(body.modId)) return fail(404, "Mod not found.");
    const write = body.vote === 0
      ? env.MOD_VOTES.prepare("DELETE FROM mod_votes WHERE mod_id = ? AND voter_id = ?").bind(body.modId, voter)
      : env.MOD_VOTES.prepare(
        "INSERT INTO mod_votes (mod_id, voter_id, vote) VALUES (?, ?, ?) ON CONFLICT (mod_id, voter_id) DO UPDATE SET vote = excluded.vote WHERE vote != excluded.vote"
      ).bind(body.modId, voter, body.vote);
    const [, totals] = await env.MOD_VOTES.batch([
      write,
      env.MOD_VOTES.prepare("SELECT likes, dislikes FROM mod_vote_totals WHERE mod_id = ?").bind(body.modId)
    ]);
    const row = totals.results?.[0];
    return json({ likes: Math.max(0, row?.likes || 0), dislikes: Math.max(0, row?.dislikes || 0), vote: body.vote });
  } catch {
    return fail(503, "Voting is unavailable.");
  }
}

export function onRequest() {
  return new Response(null, { status: 405, headers: { Allow: "GET, POST", "Cache-Control": "no-store" } });
}
