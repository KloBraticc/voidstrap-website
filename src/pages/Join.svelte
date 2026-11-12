<script>
  import Button from "../components/Button.svelte";
  import { links } from "../data/site.js";

  let data = $state(null);
  let failed = $state(false);
  let opened = $state(false);

  const compact = (n) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
  const labels = { server: ["Live server", "Join my server"], private: ["Private server", "Join my private server"], game: [null, "Play with me"] };

  function open() {
    if (!data?.deeplink) return;
    opened = true;
    location.href = data.deeplink;
  }

  $effect(() => {
    let alive = true;
    let timer;
    fetch("/api/join" + location.search, { signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (!d?.deeplink) return (failed = true);
        data = d;
        document.title = `${labels[d.kind][1]} in ${d.game?.name || "Roblox"} | Voidstrap`;
        timer = setTimeout(open, 700);
      })
      .catch(() => alive && (failed = true));
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  });
</script>

<div class="aura" aria-hidden="true"><i></i><i></i><i></i></div>


<main class="join">
  {#if failed}
    <div class="empty">
      <h1>Invite unavailable</h1>
      <p>This invite link is broken or has expired. Ask your friend for a fresh one.</p>
      <Button variant="solid" href="/">Return home</Button>
    </div>
  {:else}
    <p class="eyebrow">{data ? "You were invited to" : "Loading invite"}</p>
    <div class="featured" class:skeleton={!data}>
      {#if data?.game?.thumb}<img class="poster" src={data.game.thumb} alt="" draggable="false" />{/if}
      <div class="shade"></div>
      {#if data}
        <div class="info">
          <div class="pills">{#if labels[data.kind][0]}<span class="pill">{#if data.kind === "server"}<i class="live"></i>{/if}{labels[data.kind][0]}</span>{/if}{#each data.game?.genres ?? [] as genre}<span class="pill">{genre}</span>{/each}</div>
          <div class="title">
            {#if data.game?.icon}<img class="icon" src={data.game.icon} alt="" draggable="false" />{/if}
            <div>
              <h3>{data.game?.name || `Place ${data.placeId}`}</h3>
              {#if data.game?.creator}<span class="by">by {data.game.creator}</span>{/if}
            </div>
          </div>
          {#if data.game}
            <div class="stats">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.4 3.4 0 0 1 0 6.4M18.5 14.7c1.6.8 2.7 2.6 3 5.3" /></svg>{compact(data.game.playing)} playing</span>
              <span><i class="dot"></i>{compact(data.game.visits)} visits</span>
            </div>
          {/if}
          <div class="actions">
            <button class="play" type="button" onclick={open}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 4.5v15l12-7.5z" /></svg>{labels[data.kind][1]}</button>
            <a class="open" href="https://www.roblox.com/games/{data.placeId}" rel="noopener noreferrer" aria-label="View game page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg></a>
          </div>
        </div>
      {/if}
    </div>
    <div class="foot">
      <p>{opened ? "Roblox should be opening now. Nothing happened?" : "Don't have Voidstrap yet?"}</p>
      <Button href={links.releases} variant="chip" icon="download">Download Voidstrap</Button>
    </div>
  {/if}
</main>

<style>
  .aura { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .aura i { position: absolute; width: 70vmax; height: 70vmax; border-radius: 50%; filter: blur(90px); opacity: .55; will-change: transform; }
  .aura i:nth-child(1) { top: -30vmax; left: -20vmax; background: radial-gradient(circle, #7c4dff 0%, transparent 65%); animation: drift-a 22s ease-in-out infinite alternate; }
  .aura i:nth-child(2) { bottom: -35vmax; right: -25vmax; background: radial-gradient(circle, #c4a7ff 0%, transparent 65%); opacity: .35; animation: drift-b 26s ease-in-out infinite alternate; }
  .aura i:nth-child(3) { top: 20%; left: 35%; width: 50vmax; height: 50vmax; background: radial-gradient(circle, #3b2a8f 0%, transparent 65%); animation: drift-c 30s ease-in-out infinite alternate; }
  @keyframes drift-a { to { transform: translate(30vw, 25vh) scale(1.15); } }
  @keyframes drift-b { to { transform: translate(-35vw, -20vh) scale(.9); } }
  @keyframes drift-c { to { transform: translate(-25vw, 15vh) scale(1.2); } }
  @media (prefers-reduced-motion: reduce) { .aura i { animation: none; } }
  .join { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 4rem 1.5rem 4rem; }
  .eyebrow { margin: 0 0 1rem; font: 800 .85rem var(--display); font-stretch: 88%; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
  .featured { position: relative; height: clamp(340px, 42vw, 520px); border-radius: 14px; overflow: hidden; background: #0b0b0d; border: 1px solid var(--line); user-select: none; }
  .skeleton { background: linear-gradient(100deg, #0e0e11 30%, #16161a 50%, #0e0e11 70%) 0 0 / 300% 100%; animation: shimmer 1.4s linear infinite; }
  @keyframes shimmer { to { background-position: -150% 0; } }
  .poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,0) 75%), linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 50%); }
  .info { position: absolute; left: 2.6rem; right: 2.6rem; bottom: 2.4rem; }
  .pills { display: flex; flex-wrap: wrap; gap: .45rem; }
  .pill { display: inline-flex; align-items: center; gap: .45rem; padding: .3rem .8rem; border-radius: 999px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.2); backdrop-filter: blur(6px); font-size: .8rem; font-weight: 600; color: #fff; }
  .live { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pulse 1.6s ease infinite; }
  @keyframes pulse { 50% { opacity: .35; } }
  .title { display: flex; align-items: center; gap: .9rem; margin: .8rem 0 .5rem; min-width: 0; }
  .title > div { min-width: 0; }
  .icon { width: 58px; height: 58px; border-radius: 10px; flex: none; border: 1px solid rgba(255,255,255,.15); }
  h3 { margin: 0; font: 700 clamp(1.8rem, 3vw, 2.6rem) var(--sans); line-height: 1.15; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .by { font-size: .95rem; color: rgba(255,255,255,.75); }
  .stats { display: flex; gap: 1rem; font-size: .95rem; color: rgba(255,255,255,.87); }
  .stats span { display: inline-flex; align-items: center; gap: .4rem; }
  .stats svg { width: 16px; height: 16px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
  .actions { display: flex; gap: .6rem; margin-top: 1.4rem; }
  .play, .open { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; height: 42px; border-radius: 6px; text-decoration: none; font: 600 1rem var(--sans); border: 0; cursor: pointer; }
  .play { padding: 0 1.6rem; background: #c4a7ff; color: #1a1124; }
  .play:hover, .play:active { background: #d3bcff; }
  .open { width: 42px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); color: #fff; }
  .open:hover, .open:active { background: rgba(255,255,255,.2); }
  .play svg, .open svg { width: 17px; height: 17px; }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 1.2rem; padding: 1rem 1.2rem; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); }
  .foot p { margin: 0; color: var(--muted); }
  .empty { min-height: 60svh; display: grid; place-content: center; justify-items: center; text-align: center; gap: .6rem; }
  .empty h1 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: -.03em; }
  .empty p { margin: 0 0 1.2rem; color: var(--muted); }
  @media (max-width: 560px) {
    .join { padding: 2.5rem 1rem 3rem; }
    .info { left: 1.4rem; right: 1.4rem; bottom: 1.4rem; }
    .icon { width: 46px; height: 46px; }
  }
</style>
