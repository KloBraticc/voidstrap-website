<script>
  import VineLogo from "../components/VineLogo.svelte";
  import Button from "../components/Button.svelte";
  import ScrollVine from "../components/ScrollVine.svelte";
  import HeroBackdrop from "../components/HeroBackdrop.svelte";
  import VineShot from "../components/VineShot.svelte";
  import { links, packages, platforms } from "../data/site.js";

  const guess = () => {
    const p = (navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
    if (p.includes("mac")) return "macos";
    if (p.includes("linux") && !/android/i.test(navigator.userAgent)) return "auto";
    return "windows";
  };

  let pkg = $state(guess());
  let copied = $state(false);
  const current = $derived(packages.find((p) => p.id === pkg));

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.cmd);
      copied = true;
      setTimeout(() => (copied = false), 1400);
    } catch {}
  }

  const nav = [
    ["Home", "#top"],
    ["Features", "#features"],
    ["Install", "#install"]
  ];
</script>

<ScrollVine sections={[
  { id: "top", label: "Home" },
  { id: "features", label: "Features" },
  { id: "custom", label: "Customize" },
  { id: "install", label: "Get started" }
]} />

<div class="frame" id="top">
  <header class="topbar">
    <a class="brand" href="#top" aria-label="Voidstrap home"><img src="/assets/img/brand/voidstrap-256.webp" alt="" width="22" height="22" fetchpriority="high" decoding="async" /></a>
    <nav>
      {#each nav as [label, href], i}
        <a {href} class="nav-item" class:active={i === 0}>{label}</a>
      {/each}
      <span class="sep"></span>
      <a href={links.github} rel="noopener noreferrer">GitHub</a>
    </nav>
    <div class="right">
      <a href={links.wiki} class="wiki">Wiki</a>
      <a href={links.discord} rel="noopener noreferrer" aria-label="Discord" class="ico">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
      </a>
    </div>
  </header>

  <section class="hero">
    <HeroBackdrop />
    <div class="hero-inner">
      <div class="logo"><VineLogo /></div>
      <p class="tag">Another day of a Bloxstrap fork, <em>just with way more control.</em></p>
      <div class="cta">
        <Button variant="solid" icon="download" href={links.releases}>Download</Button>
        <Button variant="ghost" href="#install">Install command</Button>
      </div>
      <div class="chips">
        <Button icon="github" href={links.github}>GitHub</Button>
        <Button icon="pr" href={links.contributors}>Contributors</Button>
      </div>
      <ul class="meta">
        {#each platforms as p}<li><img src="/assets/img/platforms/{p}.svg" alt={p} width="14" height="14" /></li>{/each}
      </ul>
    </div>
  </section>

  <section class="block" id="features">
    <div class="split">
      <div>
        <h2>Introducing <span class="hl">Voidstrap</span></h2>
        <p>An open-source Bloxstrap fork with more control. Tweak FastFlags, use custom themes, and install mods.</p>
      </div>
      <VineShot src="/assets/img/shots/home.webp" alt="The Voidstrap app home screen" width="1071" height="693" />
    </div>
  </section>

  <section class="block" id="custom">
    <div class="split rev">
      <VineShot src="/assets/img/shots/custom.webp" alt="Voidstrap customization settings" width="802" height="632" />
      <div>
        <h2>The most advanced <span class="hl">customization.</span></h2>
        <p>Themes, overlays, fonts, cursors, and mods built right in. Set up your client how you want, and keep it that way after every update.</p>
      </div>
    </div>
  </section>

  <section class="block" id="install">
    <div class="solo">
      <div class="picker">
        <div class="tabs" role="radiogroup" aria-label="Package">
          {#each packages as p}
            <button role="radio" aria-checked={pkg === p.id} class:on={pkg === p.id} onclick={() => (pkg = p.id)}>{p.label}</button>
          {/each}
        </div>
        <div class="cmd">
          <code>{current.cmd}</code>
          <button class="copy" onclick={copy}>{copied ? "Copied" : "Copy"}</button>
        </div>
        <small>{current.note}</small>
        <small>On Android? Get the APK from the <a href={links.releases} rel="noopener noreferrer">latest release</a>.</small>
      </div>
    </div>
  </section>

  <footer>
    <div class="fbar mono">
      <span class="love">Voidstrap team made with love <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></span>
    </div>
  </footer>
</div>

<style>
  .frame { width: 100%; margin: 0; min-height: 100vh; position: relative; }
  .topbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; height: 46px; background: rgba(17,17,19,.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
  .brand { display: grid; place-items: center; width: 46px; height: 100%; border-right: 1px solid var(--line); }
  .topbar nav { display: flex; align-items: center; gap: .25rem; padding-left: .75rem; flex: 1; overflow-x: auto; }
  .topbar nav a { font-family: var(--mono); font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; color: var(--muted); padding: .3rem .55rem; white-space: nowrap; border-radius: 6px; }
  .topbar nav a:hover { background: var(--accent); color: #0c0c0d; }
  .topbar nav a.active { background: #fff; color: #0c0c0d; }
  .topbar nav a.active:hover { background: var(--accent); color: #0c0c0d; }
  .sep { width: 1px; height: 46px; background: var(--line); margin: 0 .5rem; }
  .right { display: flex; height: 100%; align-items: center; }
  .wiki { font-family: var(--mono); font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; color: var(--muted); padding: .3rem .55rem; margin-right: .5rem; white-space: nowrap; border-radius: 6px; }
  .wiki:hover { background: var(--accent); color: #0c0c0d; }
  .ico { display: grid; place-items: center; width: 46px; height: 100%; color: var(--muted); border-left: 1px solid var(--line); }
  .ico svg { width: 16px; }
  .ico:hover { color: #fff; }

  .hero { position: relative; min-height: clamp(540px, calc(100vh - 46px), 1020px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem 1.5rem; border-bottom: 1px solid var(--line); overflow: hidden; contain: layout paint; }
  .hero-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1200px; }
  .logo { width: min(1060px, 100%); height: clamp(260px, 42svh, 390px); }
  .tag { font-family: var(--display); font-size: clamp(1.35rem, 2.6vw, 2rem); font-weight: 700; margin: .5rem 0 1.6rem; letter-spacing: -.02em; }
  .tag em { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: 1.08em; color: #d6d6da; }
  .cta { display: flex; gap: .6rem; flex-wrap: wrap; justify-content: center; }
  .chips { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; margin-top: 1.2rem; }
  .meta { list-style: none; display: flex; gap: 1.1rem; padding: 0; margin: 1.8rem 0 0; align-items: center; flex-wrap: wrap; justify-content: center; }
  .meta img { opacity: .55; display: block; }

  .block { padding: 4rem 88px 4rem 24px; overflow-x: clip; }
  .split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 3.5rem; padding: 0 3rem; align-items: center; max-width: 1280px; margin: 0 auto; }
  .split.rev { grid-template-columns: 1fr 1.05fr; }
  .solo { max-width: 760px; margin: 0 auto; padding: 0 1.5rem; }
  h2 { font-size: clamp(2.2rem, 4.6vw, 3.6rem); line-height: 1.02; letter-spacing: -.035em; margin: 0 0 1.2rem; }
  .hl { color: var(--accent); }
  .split p { color: #b4b4bb; max-width: 54ch; }
  .mono { font-family: var(--mono); font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; color: #6f6f76; }

  .picker { border: 1px solid var(--line); background: var(--panel); padding: 1.2rem; display: grid; gap: .9rem; min-width: 0; }
  .tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: .35rem; }
  .tabs button { font-family: var(--mono); font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; background: transparent; color: var(--muted); border: 0; border-radius: 6px; padding: .48rem .5rem; cursor: pointer; white-space: nowrap; text-align: center; }
  .tabs button:hover { background: var(--accent); color: #0c0c0d; }
  .tabs button.on { background: #fff; color: #0c0c0d; }
  .tabs button.on:hover { background: var(--accent); color: #0c0c0d; }
  .cmd { display: flex; border: 1px solid var(--line); background: #0c0c0d; min-width: 0; }
  .cmd code { flex: 1; min-width: 0; padding: .9rem 1rem; font: .8rem var(--mono); overflow-x: auto; white-space: nowrap; color: #e3d6ff; }
  .copy { font: .64rem var(--mono); letter-spacing: .12em; text-transform: uppercase; background: #fff; color: #0c0c0d; border: 0; padding: 0 1.1rem; cursor: pointer; flex-shrink: 0; transition: background .15s; }
  .copy:hover { background: var(--accent); }
  .picker small { color: var(--muted); }

  footer { border-top: 1px solid var(--line); padding: 0 88px 0 24px; }
  .fbar { display: flex; justify-content: center; padding: 1.4rem 1.5rem; }
  .love { display: inline-flex; align-items: center; gap: .45rem; }
  .love svg { width: 13px; height: 13px; color: #e25563; }

  @media (max-width: 860px) {
    .block, footer { padding-inline: 0; }
    .split, .split.rev { grid-template-columns: 1fr; padding: 0 1.5rem; text-align: center; }
    .split p { margin-inline: auto; }
  }
  @media (max-width: 640px) {
    .nav-item, .sep { display: none; }
    .solo { padding: 0 1rem; }
    .picker { padding: .95rem; }
    .tabs { display: grid; grid-template-columns: repeat(2, 1fr); gap: .35rem; }
    .tabs button { width: 100%; text-align: center; padding: .55rem .5rem; }
    .cmd { flex-direction: column; }
    .cmd code { padding: .8rem .85rem; font-size: .74rem; }
    .copy { width: 100%; padding: .7rem 1rem; border-top: 1px solid var(--line); }
  }
</style>
