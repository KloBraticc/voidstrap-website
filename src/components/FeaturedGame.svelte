<script>
  let game = $state(null);
  let playing = $state(false);
  const canPlay = typeof document !== "undefined" && document.createElement("video").canPlayType('video/webm; codecs="vp9, opus"') !== "";

  $effect(() => {
    fetch("/api/featured")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.video) game = d; })
      .catch(() => {});
  });

  const compact = (n) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
</script>

{#if game}
  <div class="featured">
    {#if game.thumbnail}<img class="poster" src={game.thumbnail} alt="" draggable="false" />{/if}
    {#if canPlay}<video class:on={playing} src={game.video} autoplay muted loop playsinline preload="auto" disablepictureinpicture disableremoteplayback ontimeupdate={(e) => { if (e.currentTarget.currentTime > 0.05 && e.currentTarget.videoWidth) playing = true; }} onerror={() => (playing = false)}></video>{#if !playing}<div class="loading" aria-hidden="true"><i></i></div>{/if}{/if}
    <div class="shade"></div>
    <div class="info">
      <span class="pill">Most played right now</span>
      <h3>{game.name}</h3>
      <div class="stats">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.4 3.4 0 0 1 0 6.4M18.5 14.7c1.6.8 2.7 2.6 3 5.3" /></svg>{compact(game.players)}</span>
        {#if game.likes !== null}<span><i class="dot"></i>{game.likes}%</span>{/if}
      </div>
      <div class="actions">
        <a class="play" href={game.launch}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 4.5v15l12-7.5z" /></svg>Play</a>
        <a class="open" href={game.url} rel="noopener noreferrer" aria-label="View game page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg></a>
      </div>
    </div>
  </div>
{/if}

<style>
  .featured { position: relative; max-width: 1280px; height: clamp(320px, 38vw, 480px); margin: 0 auto; border-radius: 14px; overflow: hidden; background: #0b0b0d; user-select: none; }
  .poster, video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  video { opacity: 0; transition: opacity .6s ease; pointer-events: none; }
  video.on { opacity: 1; }
  .loading { position: absolute; inset: 0; display: grid; place-items: center; background: #0b0b0d; }
  .loading i { width: 34px; height: 34px; border-radius: 50%; border: 3px solid rgba(255,255,255,.15); border-top-color: #c4a7ff; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,0) 75%), linear-gradient(0deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 50%); }
  .info { position: absolute; left: 2.6rem; right: 2.6rem; bottom: 2.4rem; }
  .pill { display: inline-block; padding: .3rem .8rem; border-radius: 999px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.2); backdrop-filter: blur(6px); font-size: .8rem; font-weight: 600; color: #fff; }
  h3 { margin: .7rem 0 .4rem; font: 700 clamp(1.8rem, 3vw, 2.6rem) var(--sans); color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stats { display: flex; gap: 1rem; font-size: .95rem; color: rgba(255,255,255,.87); }
  .stats span { display: inline-flex; align-items: center; gap: .4rem; }
  .stats svg { width: 16px; height: 16px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
  .actions { display: flex; gap: .6rem; margin-top: 1.4rem; }
  .play, .open { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; height: 42px; border-radius: 6px; text-decoration: none; font-weight: 600; }
  .play { padding: 0 1.6rem; background: #c4a7ff; color: #1a1124; }
  .play:hover, .play:active { background: #d3bcff; }
  .open { width: 42px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); color: #fff; }
  .open:hover, .open:active { background: rgba(255,255,255,.2); }
  .play svg, .open svg { width: 17px; height: 17px; }
  @media (max-width: 560px) { .info { left: 1.4rem; right: 1.4rem; bottom: 1.4rem; } }
</style>
