const WINDOW_MS = 60000;
const LIMITS = {
  "/api/mod-votes:GET": 40,
  "/api/mod-votes:POST": 20,
  "/api/featured:GET": 30,
  "/api/video:GET": 90
};
const GLOBAL_LIMIT = 150;
const BAN_AFTER = 5;
const BAN_MS = 15 * 60000;
const MAX_ENTRIES = 50000;
const hits = new Map();
const strikes = new Map();
const banned = new Map();

const deny = (status, retry) => new Response(JSON.stringify({ error: status === 429 ? "Too many requests. Please slow down." : "Request blocked." }), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...(retry ? { "Retry-After": String(retry) } : {})
  }
});

function clientKey(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip.includes(":")) return ip;
  return ip.toLowerCase().split(":").slice(0, 4).join(":");
}

function count(key, limit, now) {
  let list = hits.get(key);
  if (!list) {
    if (hits.size >= MAX_ENTRIES) hits.clear();
    list = [];
    hits.set(key, list);
  }
  while (list.length && now - list[0] > WINDOW_MS) list.shift();
  if (list.length >= limit) return Math.ceil((WINDOW_MS - (now - list[0])) / 1000);
  list.push(now);
  return 0;
}

function strike(client, now) {
  const value = (strikes.get(client) || 0) + 1;
  if (strikes.size >= MAX_ENTRIES) strikes.clear();
  strikes.set(client, value);
  if (value >= BAN_AFTER) {
    if (banned.size >= MAX_ENTRIES) banned.clear();
    banned.set(client, now + BAN_MS);
    strikes.delete(client);
  }
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method === "HEAD" ? "GET" : request.method;
  const route = `${url.pathname.replace(/\/+$/, "")}:${method}`;
  const limit = LIMITS[route];
  if (!limit) return deny(method === "GET" || method === "POST" ? 404 : 405);
  if (url.search.length > 256 || url.pathname.length > 64 || (request.headers.get("Cookie") || "").length > 4096) return deny(400);
  const client = clientKey(request);
  if (!client) return deny(403);
  const now = Date.now();
  const until = banned.get(client);
  if (until && until > now) return deny(429, Math.ceil((until - now) / 1000));
  if (until) banned.delete(client);
  const retry = count(`g:${client}`, GLOBAL_LIMIT, now) || count(`${route}:${client}`, limit, now);
  if (retry) {
    strike(client, now);
    return deny(429, retry);
  }
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.delete("Server");
  headers.delete("X-Powered-By");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Robots-Tag", "noindex");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
