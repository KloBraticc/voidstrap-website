async function inflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decodePng(buf) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (view.getUint32(0) !== 0x89504e47) return null;
  let pos = 8, width = 0, height = 0, depth = 0, type = 0, interlace = 0;
  const parts = [];
  while (pos + 8 <= buf.length) {
    const len = view.getUint32(pos);
    const tag = String.fromCharCode(...buf.subarray(pos + 4, pos + 8));
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (tag === "IHDR") {
      width = view.getUint32(pos + 8);
      height = view.getUint32(pos + 12);
      depth = data[8];
      type = data[9];
      interlace = data[12];
    } else if (tag === "IDAT") parts.push(data);
    else if (tag === "IEND") break;
    pos += 12 + len;
  }
  const channels = { 2: 3, 6: 4 }[type];
  if (!channels || depth !== 8 || interlace || !width || width * height > 600000) return null;
  const joined = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { joined.set(p, o); o += p.length; }
  const raw = await inflate(joined);
  const stride = width * channels;
  const out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y ? out[(y - 1) * stride + x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { pixels: out, channels };
}

export async function vividColor(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), cf: { cacheTtl: 86400, cacheEverything: true } });
    if (!res.ok) return null;
    const png = await decodePng(new Uint8Array(await res.arrayBuffer()));
    if (!png) return null;
    const buckets = new Map();
    const { pixels, channels } = png;
    for (let i = 0; i < pixels.length; i += channels * 2) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const sat = max ? (max - min) / max : 0;
      if (max < 50 || sat < 0.25) continue;
      let hue = 0;
      if (max !== min) {
        hue = max === r ? (g - b) / (max - min) : max === g ? 2 + (b - r) / (max - min) : 4 + (r - g) / (max - min);
        hue = ((hue * 60) + 360) % 360;
      }
      const key = Math.round(hue / 15);
      const weight = sat * (max / 255);
      const e = buckets.get(key) || { w: 0, r: 0, g: 0, b: 0 };
      e.w += weight; e.r += r * weight; e.g += g * weight; e.b += b * weight;
      buckets.set(key, e);
    }
    let best = null;
    for (const e of buckets.values()) if (!best || e.w > best.w) best = e;
    if (!best || best.w < 1) return null;
    const hex = (v) => Math.round(v / best.w).toString(16).padStart(2, "0");
    return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`;
  } catch {
    return null;
  }
}
