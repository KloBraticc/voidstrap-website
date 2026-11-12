<script>
  import { onMount } from "svelte";

  const repo = "KloBraticc/voidstrap-mods-library";
  const repoUrl = "https://github.com/" + repo;

  let mods = $state([
    { name: "friends-display", description: "Live Roblox friend counter pill next to the top right navigation arrows.", on: false },
    { name: "oneko", description: "A little cat that chases your cursor around Voidstrap.", on: true }
  ]);
  let count = $state(0);
  let commits = $state([]);

  const ago = (iso) => {
    const s = Math.max(1, Math.round((Date.now() - new Date(iso)) / 1000));
    const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [u, n] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? "s" : ""} ago`; }
    return "just now";
  };

  onMount(async () => {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/${repo}/index/index.json`);
      if (r.ok) {
        const list = (await r.json()).mods ?? [];
        count = list.length;
        const picks = list.filter((m) => m.description).sort(() => Math.random() - .5).slice(0, 2);
        if (picks.length === 2) mods = picks.map((m, i) => ({ name: m.name, description: m.description, on: i === 1 }));
      }
    } catch {}
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=3`);
      if (r.ok) commits = (await r.json()).map((c) => ({
        title: c.commit.message.split("\n")[0],
        when: ago(c.commit.committer.date),
        merge: c.parents.length > 1,
        url: c.html_url
      }));
    } catch {}
  });
</script>

<div class="grid">
  <div class="card intro">
    <h3>
      Voidstrap mods
    </h3>
    <p>Sandboxed mods that change the Voidstrap app itself: widgets, pages, cursors and small automations{count ? `, with ${count} in the community library` : ""}.</p>
    <a class="btn" href="/mods">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
      Explore mods
    </a>
  </div>

  <div class="stack">
    {#each mods as m, i}
      <div class="mod" class:front={i === 1}>
        <div class="row">
          <strong>{m.name}</strong>
          <button class="toggle" class:on={m.on} role="switch" aria-checked={m.on} aria-label={m.name} onclick={() => (m.on = !m.on)}><span></span></button>
        </div>
        <p>{m.description}</p>
      </div>
    {/each}
  </div>

  <div class="commits">
    {#each commits as c}
      <a class="commit" href={c.url} rel="noopener noreferrer">
        <strong>{c.title}</strong>
        <span>Committed {c.when}
          {#if c.merge}
            <svg class="merge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 21V9M12 9 6 3M12 9l6-6" /></svg>
          {:else}
            <svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
          {/if}
        </span>
      </a>
    {/each}
  </div>

  <div class="card maint">
    <h3>
      Reviewed and maintained
    </h3>
    <p>Every mod is checked automatically before it is published, and taken down mods turn off in the app on their own.</p>
    <a class="btn" href={repoUrl} rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
      View repository
    </a>
  </div>
</div>

<style>
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem 4rem; max-width: 1280px; margin: 0 auto; padding: 0 3rem; align-items: center; user-select: none; -webkit-user-select: none; }
  .card { background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 2.4rem 2rem 2.6rem; min-height: 300px; display: flex; flex-direction: column; }
  .card h3 { font: 800 1.35rem var(--display); font-stretch: 88%; letter-spacing: .03em; text-transform: uppercase; display: flex; align-items: center; gap: .55rem; margin: 0 0 .6rem; }
  .card p { color: #b4b4bb; margin: 0; max-width: 46ch; line-height: 1.55; }
  .btn { margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-width: 150px; padding: .7rem 1.2rem; border-radius: 6px; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,.1); color: #fff; text-decoration: none; font: 800 .95rem var(--display); font-stretch: 88%; letter-spacing: .03em; text-transform: uppercase; text-shadow: 0 1px 2px rgba(0,0,0,.3); }
  .btn:hover, .btn:active { background: rgba(255,255,255,.18); }
  .btn svg { width: 18px; height: 18px; }
  .maint { grid-column: 2; }

  .stack { position: relative; height: 230px; }
  .mod { position: absolute; width: min(350px, 82%); background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 1.4rem 1.5rem; }
  .mod:first-child { top: 0; right: 0; opacity: .8; }
  .mod.front { top: 90px; left: 0; border-color: rgba(255,255,255,.16); box-shadow: 0 24px 60px rgba(0,0,0,.55); }
  .mod strong { font: 600 1.05rem var(--sans); color: #fff; }
  .mod p { margin: .45rem 0 0; color: var(--muted); font-size: .82rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .toggle { width: 40px; height: 22px; border-radius: 11px; border: 1px solid var(--line); background: var(--bg); padding: 0; position: relative; cursor: pointer; flex: none; transition: background .15s; }
  .toggle span { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: #d8d8dc; transition: transform .15s; }
  .toggle.on { background: var(--accent); border-color: var(--accent); }
  .toggle.on span { transform: translateX(18px); background: #0c0c0d; }

  .commits { justify-self: end; width: min(290px, 100%); border-left: 1px solid var(--line); padding-left: 2rem; min-height: 200px; -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
  .commit { display: block; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-top-width: 0; padding: 1rem; text-decoration: none; color: inherit; }
  .commit:last-child { border-radius: 0 0 8px 8px; }
  .commit:first-child { border-top-width: 1px; border-radius: 8px 8px 0 0; }
  .commit strong { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #fff; font-size: .95rem; }
  .commit span { display: flex; align-items: center; gap: .4rem; margin-top: .45rem; color: #a9a9b2; font-size: .82rem; }
  .commit svg { width: 15px; height: 15px; }
  .merge { color: var(--accent); }
  .ok { color: #3fb950; }
  .commit:hover strong, .commit:active strong { color: var(--accent); }

  @media (max-width: 860px) {
    .grid { grid-template-columns: 1fr; padding: 0 1.5rem; gap: 2rem; }
    .maint { grid-column: auto; }
    .commits { justify-self: stretch; width: auto; }
  }
</style>
