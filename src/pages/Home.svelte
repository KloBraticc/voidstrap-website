<script>
  import Button from "../components/Button.svelte";
  import Topbar from "../components/Topbar.svelte";
  import FeaturedGame from "../components/FeaturedGame.svelte";
  import ModsShowcase from "../components/ModsShowcase.svelte";
  import InstallCommands from "../components/InstallCommands.svelte";
  import { links, platforms } from "../data/site.js";

  const nav = [
    ["Home", "#top"],
    ["Features", "#features"],
    ["Mods", "#mods"]
  ];
  let installDialog;
  let ready = $state(false);

  $effect(() => {
    const img = new Image();
    const done = () => (ready = true);
    const timer = setTimeout(done, 2500);
    img.src = "/assets/img/hero.webp";
    img.decode().then(done, done).finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  });
</script>

<div class="frame" id="top">
  <Topbar />

  <section class="hero" class:ready>
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="hero-inner">
      <p class="tag">Another day of a Bloxstrap fork, <em>just with way more control.</em></p>
      <div class="cta">
        <Button variant="solid" icon="download" href={links.releases}>Download</Button>
        <Button variant="ghost" icon="terminal" onclick={() => installDialog.showModal()}>Install command</Button>
      </div>
      <div class="chips">
        <Button icon="github" href={links.github}>GitHub</Button>
        <Button icon="pr" href={links.contributors}>Contributors</Button>
      </div>
      <ul class="meta">
        {#each platforms as p}<li><img src="/assets/img/platforms/{p}.svg" alt={p} width="14" height="14" draggable="false" /></li>{/each}
      </ul>
    </div>
  </section>

  <section class="featured-wrap" id="features">
    <FeaturedGame />
  </section>

  <section class="block" id="mods">
    <ModsShowcase />
  </section>

  <section class="banner-wrap">
    <div class="banner">
      <img src="/assets/img/brand/voidstrap-256.webp" alt="" width="96" height="96" draggable="false" />
      <p><b>Total FastFlag control</b>, a growing <b>mods library</b> and custom <b>themes</b> on Windows, macOS, Linux and Android. <b>Completely free.</b></p>
      <a class="get-it" href={links.releases} rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1zM4 17a1 1 0 0 1 1 1v1h14v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" /></svg>Download</a>
    </div>
  </section>

  <footer>
    <div class="socials">
      <a href={links.github} rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg></a>
      <a href={links.discord} rel="noopener noreferrer" aria-label="Discord"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg></a>
      <a href="https://x.com/VoidstrapDev" rel="noopener noreferrer" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" /></svg></a>
      <a href="https://www.youtube.com/@ReallLivvyy" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z" /></svg></a>
    </div>
    <div class="fbar">
      <span class="fcopy"><img src="/assets/img/brand/voidstrap-256.webp" alt="" width="28" height="28" draggable="false" />&copy; {new Date().getFullYear()} Voidstrap</span>
      <nav class="flinks">
        <a href={links.releases} rel="noopener noreferrer">Download</a>
        <a href={links.wiki} rel="noopener noreferrer">Wiki</a>
        <a href={links.github} rel="noopener noreferrer">Source code</a>
        <a href={links.contributors} rel="noopener noreferrer">Contributors</a>
        <a href="/mods">Mods library</a>
        <a href={links.github + "/blob/main/LICENSE.BLOXSTRAP"} rel="noopener noreferrer">License</a>
      </nav>
    </div>
  </footer>
</div>

<InstallCommands bind:dialog={installDialog} />

<style>
  .frame { width: 100%; margin: 0; min-height: 100svh; position: relative; }


  .featured-wrap { padding: 5rem 1.5rem 2rem; }
  .hero { position: relative; min-height: clamp(540px, calc(100vh - 64px), 1020px); min-height: clamp(540px, calc(100svh - 64px), 1020px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3rem 1.5rem; overflow: hidden; contain: layout paint; }
  .hero-bg { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,11,13,.35) 0%, rgba(11,11,13,.55) 55%, var(--bg) 100%), radial-gradient(ellipse at center, rgba(11,11,13,0) 30%, rgba(11,11,13,.75) 100%), url("/assets/img/hero.webp") center / cover no-repeat; }
  .hero-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1200px; }
  .tag, .cta, .chips { opacity: 0; animation: rise .8s cubic-bezier(.2,.8,.2,1) forwards; }
  .hero:not(.ready) :is(.tag, .cta, .chips, .meta) { animation-play-state: paused; }
  .hero-bg { opacity: 0; transition: opacity .6s ease; }
  .hero.ready .hero-bg { opacity: 1; }
  .tag { animation-delay: .26s; }
  .cta { animation-delay: .34s; }
  .chips { animation-delay: .42s; }
  .meta { opacity: 0; animation: slide-up .7s cubic-bezier(.2,.8,.2,1) .5s forwards; }
  @keyframes slide-up { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
  @keyframes rise { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
  .tag { font-family: Roboto, var(--sans); font-size: 1.15rem; font-weight: 300; letter-spacing: .01em; color: rgba(255,255,255,.88); margin: .5rem 0 1.6rem; user-select: none; -webkit-user-select: none; pointer-events: none; cursor: default; }
  .tag em { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: 1.12em; color: #d6d6da; }
  .cta { display: flex; gap: .6rem; flex-wrap: wrap; justify-content: center; }
  .chips { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; margin-top: 1.2rem; }
  .meta { list-style: none; display: flex; gap: 1.1rem; padding: 0; margin: 1.8rem 0 0; align-items: center; flex-wrap: wrap; justify-content: center; user-select: none; -webkit-user-select: none; }
  .meta img { pointer-events: none; -webkit-user-drag: none; }
  .meta img { opacity: .55; display: block; }

  .block { padding: 4rem 24px; overflow-x: clip; }
  .split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 3.5rem; padding: 0 3rem; align-items: center; max-width: 1280px; margin: 0 auto; }
  .split.rev { grid-template-columns: 1fr 1.05fr; }
  h2 { font-size: clamp(2.2rem, 4.6vw, 3.6rem); line-height: 1.02; letter-spacing: -.035em; margin: 0 0 1.2rem; }
  .hl { color: var(--accent); }
  .split p { color: #b4b4bb; max-width: 54ch; }
  .mono { font-family: var(--mono); font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; color: #6f6f76; }

  .picker { border: 1px solid var(--line); background: var(--panel); padding: 1.2rem; display: grid; gap: .9rem; min-width: 0; }
  .tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: .35rem; }
  .tabs button { font-family: var(--mono); font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; background: transparent; color: var(--muted); border: 0; border-radius: 6px; padding: .48rem .5rem; cursor: pointer; white-space: nowrap; text-align: center; }
  .tabs button:hover, .tabs button:active { background: var(--accent); color: #0c0c0d; }
  .tabs button.on { background: #fff; color: #0c0c0d; }
  .tabs button.on:hover, .tabs button.on:active { background: var(--accent); color: #0c0c0d; }
  .cmd { display: flex; border: 1px solid var(--line); background: #0c0c0d; min-width: 0; }
  .cmd code { flex: 1; min-width: 0; padding: .9rem 1rem; font: .8rem var(--mono); overflow-x: auto; white-space: nowrap; color: #e3d6ff; }
  .picker small { color: var(--muted); }

  .banner-wrap { padding: 4rem 1.5rem 3rem; }
  .banner { position: relative; max-width: 1184px; margin: 0 auto; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2.2rem; padding: 2.2rem 3rem; border-radius: 16px; overflow: hidden; isolation: isolate; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); user-select: none; }
  .banner::before { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(14,14,17,.92) 0%, rgba(14,14,17,.6) 60%, rgba(14,14,17,.35) 100%), url("/assets/img/banner.webp") center / cover no-repeat; }
  .banner p { margin: 0; max-width: 60ch; font-size: 1.15rem; line-height: 1.45; color: rgba(255,255,255,.85); }
  .banner b { color: #fff; font-weight: 600; }
  .banner img { width: 96px; height: 96px; filter: drop-shadow(0 6px 16px rgba(0,0,0,.35)); }
  .get-it { display: inline-flex; align-items: center; gap: .6rem; padding: 1rem 2.4rem; border-radius: 999px; border: 2px solid rgba(255,255,255,.7); background: rgba(255,255,255,.16); color: #fff; text-decoration: none; font: 800 1.5rem var(--display); font-stretch: 88%; letter-spacing: .03em; text-transform: uppercase; }
  .get-it:hover, .get-it:active { background: rgba(255,255,255,.26); }
  .get-it svg { width: 22px; height: 22px; }
  @media (max-width: 860px) { .banner { grid-template-columns: 1fr; justify-items: center; text-align: center; padding: 2rem 1.5rem; gap: 1.4rem; } }
  footer { background: var(--bg); padding: 2.6rem 2rem 2rem; user-select: none; }
  .socials { display: flex; justify-content: center; gap: 2.2rem; margin-bottom: 1.8rem; }
  .socials a { color: #fff; }
  .socials a:hover, .socials a:active { color: var(--accent); }
  .socials svg { width: 22px; height: 22px; }
  .fbar { max-width: 1280px; margin: 0 auto; padding: 0 3rem; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1.2rem 2rem; font-size: 1rem; }
  .fcopy { justify-self: start; display: inline-flex; align-items: center; gap: .7rem; color: #e8e8ea; }
  .flinks { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem 1.6rem; }
  .flinks a { color: #e8e8ea; text-decoration: none; }
  .flinks a:hover, .flinks a:active { color: var(--accent); }
  @media (max-width: 1100px) { .fbar { grid-template-columns: 1fr; justify-items: center; text-align: center; } .fcopy { justify-self: center; } }

  @media (max-width: 860px) {
    .block, footer { padding-inline: 0; }
    .split, .split.rev { grid-template-columns: 1fr; padding: 0 1.5rem; text-align: center; }
    .split p { margin-inline: auto; }
  }
</style>
