<script>
  import { onMount } from "svelte";
  import Topbar from "../components/Topbar.svelte";

  const repo = "KloBraticc/voidstrap-mods-library";
  const raw = `https://raw.githubusercontent.com/${repo}`;

  let mods = $state([]);
  let commit = $state("main");
  let status = $state("loading");
  let query = $state("");
  let sort = $state("featured");
  let sortOpen = $state(false);
  const sortOptions = [["featured", "Featured"], ["updated", "Recently updated"], ["name", "Name"]];
  const pick = (v) => { sort = v; sortOpen = false; };

  const sorters = {
    featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || Number(b.verified) - Number(a.verified) || Number(b.trusted) - Number(a.trusted) || a.name.localeCompare(b.name),
    updated: (a, b) => new Date(b.updated) - new Date(a.updated),
    name: (a, b) => a.name.localeCompare(b.name)
  };

  const shown = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const list = mods.filter((m) => !q || [m.name, m.description, m.login, ...(m.tags || [])].join(" ").toLowerCase().includes(q));
    return [...list].sort(sorters[sort]);
  });

  const POWERFUL = ["native", "files", "web", "clipboard"];

  let selectedId = $state(new URLSearchParams(location.search).get("mod"));
  const selected = $derived(selectedId ? mods.find((m) => m.id === selectedId) : null);
  const size = (b) => (b < 1024 ? b + " B" : (b / 1024).toFixed(1).replace(/\.0$/, "") + " KB");

  function open(e, m) {
    e.preventDefault();
    history.pushState(null, "", "/mods?mod=" + encodeURIComponent(m.id));
    selectedId = m.id;
    scrollTo({ top: 0, behavior: "instant" });
  }

  function close(e) {
    e.preventDefault();
    history.pushState(null, "", "/mods");
    selectedId = null;
  }

  const date = (iso) => new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });

  onMount(async () => {
    addEventListener("popstate", () => (selectedId = new URLSearchParams(location.search).get("mod")));
    try {
      const r = await fetch(`${raw}/index/index.json`, { cache: "no-cache" });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      commit = data.commit || "main";
      const blocked = new Set((data.blocked || []).map((b) => (typeof b === "string" ? b : b.id)));
      mods = (data.mods || []).filter((m) => !blocked.has(m.id));
      status = "ready";
    } catch {
      status = "error";
    }
  });
</script>

{#snippet icon(m)}{#if m.icon}<img src="{raw}/{commit}/mods/{m.name}/{m.icon}" alt="" loading="lazy" draggable="false" />{:else}<svg viewBox="32.0 -458.0 416 416" fill="currentColor" aria-hidden="true"><path d="M271 -458Q296 -458 314.0 -441.0Q332 -424 333 -400V-396H380Q394 -396 404.0 -387.0Q414 -378 416 -365L417 -362V-281H375Q364 -281 355.0 -274.0Q346 -267 344 -255V-250Q344 -239 351.0 -230.0Q358 -221 370 -219H417V-141Q417 -126 407.0 -115.5Q397 -105 383 -104H333V-101Q332 -78 316.5 -61.5Q301 -45 278 -42H271Q246 -42 228.0 -59.0Q210 -76 208 -100V-104H161Q148 -104 138.0 -112.5Q128 -121 126 -134L125 -138V-188H122Q99 -189 82.5 -204.5Q66 -220 63 -243V-250Q63 -275 80.0 -293.0Q97 -311 122 -312L125 -313V-359Q125 -373 133.5 -383.0Q142 -393 155 -395L158 -396H208V-399Q210 -422 225.5 -438.5Q241 -455 263 -458ZM271 -427Q259 -427 250.0 -419.0Q241 -411 240 -399V-365H161Q157 -365 156 -361V-281H125Q113 -281 104.0 -272.5Q95 -264 94.0 -251.5Q93 -239 101.5 -229.5Q110 -220 122 -219H156V-141Q156 -136 160 -136L240 -135V-104Q239 -92 248.0 -82.5Q257 -73 269.5 -72.5Q282 -72 291.5 -80.5Q301 -89 302 -101V-135H380Q384 -135 385 -139V-188H371Q347 -189 330.5 -206.0Q314 -223 313 -247V-254Q314 -278 331.0 -294.5Q348 -311 371 -312H385V-359Q385 -362 383 -364H381L302 -365V-396Q302 -409 293.0 -418.0Q284 -427 271 -427Z" /></svg>{/if}{/snippet}

{#snippet badges(m)}
              {#if (m.permissions || []).some((p) => POWERFUL.includes(p))}<span class="badge red"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z"/></svg>Powerful mod</span>{/if}
              {#if m.verified}<span class="badge green"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3z"/></svg>Verified</span>{:else if m.trusted}<span class="badge blue"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8c0-3 3-5 6-5 .9 0 1.8.2 2.6.5A6 6 0 0 0 12 20H4zm13.5 1L14 17.5l1.4-1.4 2.1 2.1 4.1-4.1L23 15.5 17.5 21z"/></svg>Trusted author</span>{:else}<span class="badge yellow"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>Not verified</span>{/if}
              {#if m.featured}<span class="badge gold"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/></svg>Featured</span>{/if}
{/snippet}

<div class="bg" aria-hidden="true"></div>

<Topbar />

<div class="page">

  {#if selected}
    {@const m = selected}
    <section class="detail">
      <a class="back" href="/mods" onclick={close}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>Back to the library</a>
      <div class="dgrid">
        <div class="dmain">
          <div class="dhead">
            <div class="ico big">{@render icon(m)}</div>
            <div class="dtitle">
              <h1>{m.name}</h1>
              <div class="name">{@render badges(m)}</div>
            </div>
          </div>
          <p class="dsum">{m.description || "No description."}</p>
          <div class="btns">
            <a class="btn accent lg" href="voidstrap://mods/install/{m.id}" title="Opens Voidstrap and installs this mod"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>Install</a>
            <a class="btn lg" href="https://github.com/{repo}/tree/{commit}/mods/{m.name}" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>Source</a>
          </div>
          <h4>Websites it contacts</h4>
          <p class="dtxt">{(m.network || []).length ? m.network.join(", ") : "Works offline"}{#if (m.permissions || []).includes("roblox-account")}<br />Uses your Roblox account (read only, never sees your login){/if}</p>
          <h4>Files</h4>
          <ul class="files">
            {#each m.files || [] as f}<li><span>{f.path}</span><small>{size(f.size)}</small></li>{/each}
          </ul>
        </div>
        <aside class="dside">
          <div><small>Version</small><b>{m.version}</b></div>
          <div><small>Updated</small><b>{date(m.updated || m.created)}</b></div>
          <div><small>Creator</small><b>@{m.login}</b></div>
          {#if (m.tags || []).length}<div><small>Tags</small><b>{m.tags.join(", ")}</b></div>{/if}
          <div><small>Trust</small><b class="trust">{m.verified ? "Reviewed and verified by the maintainer." : m.trusted ? "Made by an author the maintainer trusts." : "Only automated checks looked at this mod. Install it only if you trust the author."}</b></div>
        </aside>
      </div>
    </section>
  {:else}
  <section class="head">
    <div class="tools">
      <input type="search" placeholder="Search mods" bind:value={query} aria-label="Search mods" />
      <div class="dd">
        <button class="dd-btn" class:open={sortOpen} aria-haspopup="listbox" aria-expanded={sortOpen} onclick={() => (sortOpen = !sortOpen)}>
          {sortOptions.find(([v]) => v === sort)[1]}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        {#if sortOpen}
          <button class="dd-scrim" aria-label="Close" onclick={() => (sortOpen = false)}></button>
          <ul class="dd-menu" role="listbox">
            {#each sortOptions as [v, label]}
              <li><button role="option" aria-selected={sort === v} class:on={sort === v} onclick={() => pick(v)}>{label}{#if sort === v}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 5 5 9-10"/></svg>{/if}</button></li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </section>

  {#if status === "loading"}
    <div class="list" aria-busy="true" aria-label="Loading mods">
      {#each Array(6) as _}
        <div class="row sk">
          <div class="ico shim"></div>
          <div class="info"><span class="shim l1"></span><span class="shim l2"></span><span class="shim l3"></span></div>
          <div class="side"><span class="shim l4"></span><div class="btns"><span class="shim b"></span><span class="shim b"></span></div></div>
        </div>
      {/each}
    </div>
  {:else if status === "error"}
    <p class="note">The library could not be loaded right now. <a href="https://github.com/{repo}" rel="noopener noreferrer">Browse it on GitHub</a>.</p>
  {:else if shown.length === 0}
    <p class="note">No mods match your search.</p>
  {:else}
    <div class="list">
      {#each shown as m (m.id)}
        <div class="row">
          <div class="ico">{@render icon(m)}</div>
          <div class="info">
            <div class="name">
              <b>{m.name}</b>
              {@render badges(m)}
            </div>
            <p>{m.description || "No description."}</p>
            <div class="meta">
              <span class="who">@{m.login}</span>
              <span>{(m.network || []).length ? `Contacts: ${m.network.join(", ")}` : "Works offline"}</span>
              {#if (m.permissions || []).includes("roblox-account")}<span>Uses your Roblox account (read only, never sees your login)</span>{/if}
            </div>
          </div>
          <div class="side">
            <span class="ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>{m.version}</span>
            <div class="btns">
              <a class="btn" href="/mods?mod={encodeURIComponent(m.id)}" onclick={(e) => open(e, m)}>View</a>
              <a class="btn accent" href="voidstrap://mods/install/{m.id}" title="Opens Voidstrap and installs this mod"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>Install</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  {/if}
</div>

<style>
  .bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(11,11,13,.35) 0%, rgba(11,11,13,.6) 50%, rgba(11,11,13,.85) 100%), url("/assets/img/hero.webp") center / cover no-repeat; }
  .page { max-width: 1480px; margin: 0 auto; padding: 0 1.5rem 3rem; user-select: none; }
  .detail { padding: 1.5rem 0 2rem; }
  .back { display: inline-flex; align-items: center; gap: .35rem; color: #c9c9cf; text-decoration: none; font-size: .92rem; margin-bottom: 1.4rem; }
  .back svg { width: 16px; height: 16px; }
  .dgrid { display: grid; grid-template-columns: 1fr 300px; gap: 1.2rem; align-items: start; }
  .dmain, .dside { padding: 1.6rem; border-radius: 8px; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); }
  .dhead { display: flex; align-items: center; gap: 1.1rem; }
  .ico.big { width: 96px; height: 96px; flex: none; }
  .ico.big svg { width: 34px; height: 34px; }
  .dtitle { display: grid; gap: .5rem; min-width: 0; }
  .dtitle h1 { margin: 0; font: 900 clamp(1.6rem, 3vw, 2.2rem) var(--display); font-stretch: 88%; line-height: 1.05; overflow-wrap: anywhere; }
  .dsum { margin: 1.2rem 0; color: #c9c9cf; font-size: 1.02rem; line-height: 1.55; }
  .btn.lg { height: 42px; padding: 0 1.4rem; font-size: .9rem; }
  .btn.lg svg { width: 16px; height: 16px; }
  .dmain h4 { margin: 1.8rem 0 .5rem; font: 700 .95rem var(--display); color: var(--accent); }
  .dtxt { margin: 0; color: #a9a9b2; font-size: .92rem; }
  .files { margin: 0; padding: 0; list-style: none; display: grid; gap: 2px; }
  .files li { display: flex; justify-content: space-between; gap: 1rem; padding: .45rem .7rem; border-radius: 5px; background: rgba(255,255,255,.03); font: .8rem var(--mono); color: #c9c9cf; }
  .files span { overflow-wrap: anywhere; }
  .files small { color: #7c7c86; flex: none; }
  .dside { display: grid; gap: 1.1rem; }
  .dside div { display: grid; gap: .2rem; }
  .dside small { font: 600 .85rem var(--display); color: #7c7c86; }
  .dside b { color: #fff; font-weight: 600; font-size: .95rem; }
  .dside b.trust { color: #a9a9b2; font-weight: 400; font-size: .88rem; line-height: 1.5; }
  @media (max-width: 860px) { .dgrid { grid-template-columns: 1fr; } .dhead { align-items: flex-start; } .ico.big { width: 64px; height: 64px; } }
  .head { padding: 1.5rem 0 1rem; }
  .tools { display: flex; gap: .7rem; flex-wrap: wrap; }
  input { height: 42px; padding: 0 .9rem; border-radius: 6px; border: 1px solid rgba(255,255,255,.12); background: #0e0e11; color: #fff; font: inherit; font-size: .95rem; }
  input { flex: 1; min-width: 220px; }
  input:focus { outline: none; border-color: var(--accent); }
  .dd { position: relative; min-width: 190px; }
  .dd-btn { width: 100%; height: 42px; display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding: 0 .9rem; border-radius: 6px; border: 1px solid rgba(255,255,255,.12); background: #0e0e11; color: #fff; font: inherit; font-size: .95rem; cursor: pointer; }
  .dd-btn.open { border-color: var(--accent); }
  .dd-btn svg { width: 16px; height: 16px; color: #a9a9b2; transition: transform .15s; }
  .dd-btn.open svg { transform: rotate(180deg); }
  .dd-scrim { position: fixed; inset: 0; z-index: 30; background: transparent; border: 0; cursor: default; }
  .dd-menu { position: absolute; top: calc(100% + 6px); right: 0; left: 0; z-index: 31; margin: 0; padding: 5px; list-style: none; background: #0e0e11; border: 1px solid rgba(255,255,255,.12); border-radius: 8px; box-shadow: 0 18px 40px rgba(0,0,0,.5); animation: dd-in .14s ease-out; }
  .dd-menu button { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: .55rem .7rem; border: 0; border-radius: 5px; background: transparent; color: #c9c9cf; font: inherit; font-size: .92rem; text-align: left; cursor: pointer; }
  .dd-menu button.on { color: #fff; }
  .dd-menu svg { width: 15px; height: 15px; color: var(--accent); }
  @keyframes dd-in { from { opacity: 0; transform: translateY(-4px); } }
  .shim { display: block; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.04) 100%) 0 0 / 200% 100%; animation: shim 1.2s linear infinite; }
  .sk .l1 { width: 220px; height: 18px; }
  .sk .l2 { width: min(520px, 90%); height: 14px; }
  .sk .l3 { width: 160px; height: 12px; }
  .sk .l4 { width: 48px; height: 12px; }
  .sk .b { width: 78px; height: 34px; }
  @keyframes shim { to { background-position: -200% 0; } }
  .note { color: #a9a9b2; }
  .note a { color: var(--accent); }
  .list { display: grid; gap: 10px; }
  .row { display: grid; grid-template-columns: 80px 1fr auto; align-items: center; gap: 1.1rem; padding: .8rem 1rem .8rem .8rem; border-radius: 6px; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; }
  .ico { display: grid; place-items: center; width: 80px; height: 80px; border-radius: 8px; background: rgba(255,255,255,.05); color: #fff; overflow: hidden; }
  .ico img { width: 100%; height: 100%; object-fit: cover; }
  .ico svg { width: 26px; height: 26px; }
  .info { min-width: 0; display: grid; gap: .35rem; }
  .name { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }
  .name b { font: 800 1.15rem var(--display); font-stretch: 88%; letter-spacing: .02em; color: #fff; }
  .badge { display: inline-flex; align-items: center; gap: .3rem; padding: .1rem .5rem; border-radius: 999px; font: 500 .72rem var(--mono); }
  .badge svg { width: 12px; height: 12px; }
  .badge.blue { color: #58a6ff; background: rgba(88,166,255,.15); }
  .badge.red { color: #e84855; background: rgba(232,72,85,.15); }
  .badge.green { color: #2ecc71; background: rgba(46,204,113,.15); }
  .badge.yellow { color: #d29922; background: rgba(210,153,34,.15); }
  .badge.gold { color: #f1c40f; background: rgba(241,196,15,.15); }
  .info p { margin: 0; color: #a9a9b2; font-size: .9rem; line-height: 1.4; }
  .meta { display: flex; flex-wrap: wrap; gap: .9rem; font-size: .78rem; color: #7c7c86; }
  .meta .who { color: #c9c9cf; font-weight: 600; }
  .side { display: grid; justify-items: end; gap: 1.1rem; }
  .ver { display: inline-flex; align-items: center; gap: .35rem; color: #7c7c86; font: .78rem var(--mono); }
  .ver svg { width: 14px; height: 14px; }
  .btns { display: flex; gap: .5rem; }
  .btn { display: inline-flex; align-items: center; gap: .45rem; height: 34px; padding: 0 1.1rem; border-radius: 6px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); color: #fff; text-decoration: none; font: 800 .8rem var(--display); font-stretch: 88%; letter-spacing: .04em; text-transform: uppercase; }
  .btn svg { width: 14px; height: 14px; }
  .btn.accent { background: var(--accent); border-color: transparent; color: #fff; }
  @media (max-width: 700px) {
    .page { padding: 0 .9rem 2rem; }
    .tools { flex-direction: column; }
    .tools input { flex: none; width: 100%; min-width: 0; }
    .dd { min-width: 0; }
    .row { grid-template-columns: 52px 1fr; align-items: start; gap: .8rem; padding: .9rem; }
    .ico { width: 52px; height: 52px; }
    .ico svg { width: 22px; height: 22px; }
    .side { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: .8rem; }
    .btns { flex: 1; justify-content: flex-end; }
    .btn { flex: 1; justify-content: center; max-width: 140px; }
  }
</style>
