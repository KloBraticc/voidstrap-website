import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

async function htmlFiles(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
		else if (entry.name.endsWith('.html')) out.push(path);
	}
	return out;
}

const hashes = new Set();
for (const file of await htmlFiles(dist)) {
	const html = await readFile(file, 'utf8');
	for (const [, body] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
		if (body.trim()) hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
	}
}

const csp = [
	"default-src 'none'",
	"base-uri 'none'",
	"form-action 'none'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"img-src 'self' data:",
	"font-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	`script-src 'self' 'wasm-unsafe-eval' ${[...hashes].join(' ')}`,
	"connect-src 'self'",
	"worker-src 'self'",
	"manifest-src 'self'",
	'upgrade-insecure-requests',
].join('; ');

const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 0
  X-Permitted-Cross-Domain-Policies: none
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Origin-Agent-Cluster: ?1
  Permissions-Policy: accelerometer=(), autoplay=(), bluetooth=(), browsing-topics=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), hid=(), magnetometer=(), microphone=(), midi=(), payment=(), serial=(), usb=(), xr-spatial-tracking=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/pagefind/*
  Cache-Control: public, max-age=3600

/hero.webp
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
`;

await writeFile(join(dist, '_headers'), headers);
console.log(`headers written with ${hashes.size} script hashes`);
