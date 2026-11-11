<script>
  import Button from "./Button.svelte";
  import { links } from "../data/site.js";

  const drawer = [
    ["Explore", [
      ["Home", "/#top", "Back to the top and the quick download buttons.", 0],
      ["Features", "/#features", "Everything Voidstrap adds on top of Roblox.", 3],
      ["Customize", "/#features", "Themes, fonts, cursors and launcher looks.", 2],
      ["Mods", "/#mods", "Sandboxed mods that add widgets, pages and more.", 9]
    ]],
    ["Resources", [
      ["Download", links.releases, "Grab the latest release for your system.", 4],
      ["Wiki", links.wiki, "Guides, settings and troubleshooting.", 5],
      ["Mods library", "/mods", "Browse and publish community mods.", 10]
    ]],
    ["Community", [
      ["GitHub", links.github, "Source code, issues and pull requests.", 6],
      ["Discord", links.discord, "Chat with the community and get help.", 11],
      ["Contributors", links.contributors, "The people who build Voidstrap.", 1]
    ]]
  ];
  let menuOpen = $state(false);
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (menuOpen = false)} />

<div class="topwrap">
  <header class="topbar">
    <div class="actions">
      <span class="get"><Button href={links.releases} variant="solid" icon="download">Download</Button></span>
      <button class="menu" aria-expanded={menuOpen} aria-controls="drawer" onclick={() => (menuOpen = !menuOpen)}>
        <span class="bars" class:x={menuOpen}><i></i><i></i><i></i></span>
        <span>Menu</span>
      </button>
    </div>
  </header>

  {#if menuOpen}
    <button class="scrim" aria-label="Close menu" onclick={() => (menuOpen = false)}></button>
    <div class="mega" id="drawer">
      {#each drawer as [group, items], g}
        <div class="group" class:wide={g === 0}>
          <h4>{group}</h4>
          <div class="items">
            {#each items as [label, href, desc, art]}
              <a class="item" {href} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} onclick={() => (menuOpen = false)}>
                <img src="/assets/img/menu/c{art}.svg" ondragstart={(e) => e.preventDefault()} alt="" width="44" height="44" loading="lazy" draggable="false" />
                <span><b>{label}</b><small>{desc}</small></span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
      <p class="credit">These icons are SVG images made with AI assistance. All credit for the original characters and artwork goes to their owners.</p>
    </div>
  {/if}
</div>

<style>
  .topwrap { position: relative; z-index: 20; }
  .topbar { position: relative; top: 0; z-index: 20; display: flex; align-items: center; gap: 1.5rem; height: 64px; justify-content: center; padding: 0 1rem; background: rgba(10,10,12,.96); backdrop-filter: blur(14px) saturate(1.2); border-bottom: 1px solid rgba(255,255,255,.06); }
  .actions { display: flex; align-items: center; gap: .6rem; }
  .menu { display: inline-flex; align-items: center; gap: .6rem; padding: .7rem 1.2rem; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.22); border-radius: 6px; backdrop-filter: blur(8px); color: #fff; cursor: pointer; font: 800 .95rem var(--display); font-stretch: 88%; letter-spacing: .03em; text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,.3); }
  .menu:hover { background: rgba(255,255,255,.18); }
  .bars { position: relative; display: block; width: 18px; height: 14px; }
  .bars i { position: absolute; left: 0; width: 100%; height: 2px; background: #fff; border-radius: 2px; transition: transform .28s cubic-bezier(.4,0,.2,1), width .25s cubic-bezier(.4,0,.2,1), opacity .2s ease; }
  .bars i:nth-child(1) { top: 0; }
  .bars i:nth-child(2) { top: 6px; }
  .bars i:nth-child(3) { top: 12px; }
  .bars:not(.x) i:nth-child(2) { width: 70%; }
  .bars:not(.x) i:nth-child(3) { width: 45%; }
  .menu:hover .bars:not(.x) i { width: 100%; }
  .bars.x i:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .bars.x i:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .bars.x i:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .scrim { position: fixed; inset: 0; z-index: 18; background: rgba(0,0,0,.35); border: 0; padding: 0; cursor: default; }
  .mega { user-select: none; -webkit-user-select: none; position: absolute; top: 72px; left: 50%; z-index: 19; width: min(1220px, calc(100% - 28px)); max-height: calc(100vh - 88px); overflow-y: auto; transform: translateX(-50%); display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem 2rem; padding: 1.6rem 1.8rem 1.2rem; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; box-shadow: 0 24px 60px rgba(0,0,0,.55); animation: mega-in .18s ease-out; }
  .group h4 { margin: 0 0 1rem; font: 500 1rem var(--sans); color: var(--accent); }
  .items { display: grid; gap: 1.1rem; }
  .wide .items { grid-template-columns: 1fr 1fr; gap: 1.1rem 1.6rem; }
  .item { display: flex; gap: 1rem; align-items: flex-start; text-decoration: none; padding: .35rem; margin: -.35rem; border-radius: 6px; }
  .item:hover { background: rgba(255,255,255,.05); }
  .item img { width: 44px; height: 44px; flex: none; object-fit: contain; }
  .item span { display: grid; gap: .25rem; }
  .item b { font: 600 1.1rem var(--sans); color: #fff; }
  .item small { font-size: .95rem; line-height: 1.45; color: #a9a9b2; }
  .credit { grid-column: 1 / -1; margin: .4rem 0 0; font-size: .78rem; color: #6f6f78; }
  @keyframes mega-in { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @media (max-width: 900px) { .mega { grid-template-columns: 1fr; } .wide .items { grid-template-columns: 1fr; } }
</style>
