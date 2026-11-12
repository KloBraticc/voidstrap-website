<p align="center">
  <img src="public/assets/img/brand/voidstrap-256.webp" width="96" alt="Voidstrap logo" />
</p>

<h1 align="center">Voidstrap Website</h1>

<p align="center">
  The source of <a href="https://voidstrapp.pages.dev">voidstrapp.pages.dev</a>, the home of
  <a href="https://github.com/KloBraticc/Voidstrap">Voidstrap</a>.
</p>

<p align="center">
  <a href="https://voidstrapp.pages.dev">Website</a> ·
  <a href="https://wiki.voidstrapp.pages.dev">Wiki</a> ·
  <a href="https://github.com/KloBraticc/Voidstrap">Voidstrap</a>
</p>

## Stack

- [Svelte 5](https://svelte.dev) and [Vite 6](https://vite.dev) for the site
- A tiny [Rust](https://www.rust-lang.org) preview server built on [axum](https://github.com/tokio-rs/axum)
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com)

No frameworks on top, no trackers beyond Cloudflare's cookie free analytics, and no external fonts or scripts.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

The finished site lands in `dist/`.

## Mod voting

The mod library uses a dedicated Cloudflare D1 database through the `MOD_VOTES` Pages binding, with `migrations/0001_mod_votes.sql` and `migrations/0002_mod_votes_network_identity.sql` applied, and a strong random `VOTE_RATE_SECRET` Pages secret. Each network gets one vote per mod: the server identifies voters by a keyed hash of their network address, so switching browsers or clearing storage does not grant another vote. Raw IP addresses and locations are never stored or returned.

A page load makes one request for all totals and the visitor's own votes. If the API is unavailable, the page shows the last saved counts and disables voting.

Every `/api` route is rate limited per network in `functions/api/_middleware.js`, and repeat offenders are blocked for 15 minutes.

## Preview like production

The Rust server serves `dist/` with the exact same headers and redirects as Cloudflare, read straight from `public/_headers` and `public/_redirects`.

```bash
npm run build
cd server
cargo run --release
```

Then open `http://localhost:8080`. Set `PORT` to use a different port.

## Layout

| Path | What lives there |
| --- | --- |
| `src/pages` | The home page and the not found page |
| `src/components` | Buttons, the animated logo, the hero backdrop and the vine |
| `src/data` | Site text, links and download data |
| `public/assets` | Fonts and images |
| `public/_headers` | Security and cache headers |
| `public/_redirects` | Old links and short links |
| `public/install.sh` | The Linux quick installer |
| `public/quick-install.ps1` | The Windows quick installer |
| `server` | The Rust preview server |
| `wiki` | The [wiki](https://wiki.voidstrapp.pages.dev), built with Astro Starlight |

## Security

Every page is served with a strict Content Security Policy, HSTS preload, cross origin isolation and a locked down Permissions Policy. See `public/_headers`.

Found a security problem? Please report it privately through [GitHub security advisories](https://github.com/KloBraticc/Voidstrap/security/advisories/new) instead of opening an issue.

## Contributing

Issues and pull requests are welcome. Keep changes small and focused, and run `npm run build` before opening a pull request.

## License

[MIT](license)
