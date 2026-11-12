<script>
  import { onMount } from "svelte";
  import Topbar from "../components/Topbar.svelte";
  import ModVotes from "../components/ModVotes.svelte";

  const repo = "KloBraticc/voidstrap-mods-library";
  const raw = `https://raw.githubusercontent.com/${repo}`;

  let mods = $state([]);
  let commit = $state("main");
  let status = $state("loading");
  let query = $state("");
  let sort = $state("featured");
  let trust = $state("all");
  let connection = $state("all");
  let voteTotals = $state({});
  let myVotes = $state({});
  let votePending = $state({});
  let votingAvailable = $state(false);
  let voteError = $state("");
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
    const list = mods.filter((m) => {
      const matchesQuery = !q || [m.name, m.description, m.login, ...(m.tags || [])].join(" ").toLowerCase().includes(q);
      const matchesTrust = trust === "all" || (trust === "verified" ? m.verified : trust === "trusted" ? !m.verified && m.trusted : !m.verified && !m.trusted);
      const matchesConnection = connection === "all" || (connection === "offline" ? !(m.network || []).length : (m.network || []).length > 0);
      return matchesQuery && matchesTrust && matchesConnection;
    });
    return [...list].sort(sorters[sort]);
  });

  const POWERFUL = ["native", "files", "web", "clipboard"];

  let selectedId = $state(new URLSearchParams(location.search).get("mod"));
  const selected = $derived(selectedId ? mods.find((m) => m.id === selectedId) : null);
  let detailTab = $state("changelog");
  let changes = $state([]);
  let changesStatus = $state("loading");
  let versions = $state([]);
  let versionsStatus = $state("loading");

  $effect(() => {
    const mod = selected;
    if (!mod) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ path: `mods/${mod.name}`, sha: commit, per_page: "30" });
    changes = [];
    versions = [];
    changesStatus = "loading";
    versionsStatus = "loading";

    async function loadHistory() {
      const history = [];
      params.set("per_page", "100");
      let page = 1;
      let entries;
      do {
        params.set("page", String(page++));
        const response = await fetch(`https://api.github.com/repos/${repo}/commits?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(String(response.status));
        entries = await response.json();
        history.push(...entries);
      } while (entries.length === 100);
      changes = history;
      changesStatus = "ready";

      const found = new Map();
      for (let i = 0; i < history.length; i += 10) {
        const batch = await Promise.all(history.slice(i, i + 10).map(async (change) => {
          const response = await fetch(`${raw}/${change.sha}/mods/${encodeURIComponent(mod.name)}/.voidstrap-mod/plugin.json`, { signal: controller.signal });
          if (response.status === 404) return null;
          if (!response.ok) throw new Error(String(response.status));
          const manifest = await response.json();
          return manifest.version ? { version: manifest.version, date: change.commit.author.date, sha: change.sha } : null;
        }));
        for (const version of batch) if (version) found.set(version.version, version);
      }
      versions = [...found.values()];
      versionsStatus = "ready";
    }

    loadHistory().catch((error) => {
      if (error.name === "AbortError") return;
      if (changesStatus === "loading") changesStatus = "error";
      versionsStatus = "error";
    });
    return () => controller.abort();
  });

  function open(e, m) {
    e.preventDefault();
    detailTab = "changelog";
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
  const cleanMessage = (message) => message.replace(/^Co-authored-by:.*$/gim, "").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]").trim();

  const VOTE_CACHE = "voidstrap-mod-vote-cache";

  function saveVoteCache() {
    try { localStorage.setItem(VOTE_CACHE, JSON.stringify({ totals: voteTotals, votes: myVotes, at: Date.now() })); } catch {}
  }

  let siteKey = null;
  let turnstileLoad = null;
  let turnstileWidget = null;
  let turnstileHost;

  function loadTurnstile() {
    turnstileLoad ??= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
      script.onerror = () => {
        turnstileLoad = null;
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    });
    return turnstileLoad;
  }

  function clearTurnstile() {
    if (turnstileWidget !== null && window.turnstile) window.turnstile.remove(turnstileWidget);
    turnstileWidget = null;
  }

  async function humanToken() {
    const turnstile = await loadTurnstile();
    clearTurnstile();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Verification timed out")), 60000);
      const finish = (fn) => (value) => {
        clearTimeout(timer);
        fn(value);
      };
      turnstileWidget = turnstile.render(turnstileHost, {
        sitekey: siteKey,
        action: "vote",
        appearance: "interaction-only",
        theme: "dark",
        callback: finish(resolve),
        "error-callback": finish(() => reject(new Error("Verification failed"))),
        "expired-callback": finish(() => reject(new Error("Verification expired")))
      });
    });
  }

  async function voteRequest(init) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      return await fetch("/api/mod-votes", { ...init, credentials: "same-origin", signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadVotes() {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await voteRequest({});
        if (response.ok) {
          const data = await response.json();
          voteTotals = Object.fromEntries((data.totals || []).map((item) => [item.mod_id, item]));
          myVotes = data.votes && typeof data.votes === "object" ? data.votes : {};
          siteKey = typeof data.siteKey === "string" ? data.siteKey : null;
          votingAvailable = Boolean(siteKey);
          saveVoteCache();
          return;
        }
        if (response.status < 500 && response.status !== 429) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    votingAvailable = false;
  }

  async function vote(modId, value) {
    if (votePending[modId] || !votingAvailable) return;
    votePending[modId] = true;
    voteError = "";
    try {
      let token;
      try {
        token = await humanToken();
      } catch {
        voteError = "Could not verify that you are human. Please try again.";
        return;
      }
      const response = await voteRequest({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId, vote: value, token })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        voteError = response.status === 429 ? "Too many votes. Please wait a moment and try again." : response.status === 403 ? "Could not verify your vote. Please try again." : "Could not save your vote. Please try again later.";
        if (response.status >= 500) votingAvailable = false;
        return;
      }
      voteTotals[modId] = { mod_id: modId, likes: data.likes, dislikes: data.dislikes };
      if (data.vote) myVotes[modId] = data.vote;
      else delete myVotes[modId];
      saveVoteCache();
    } catch {
      voteError = "Could not save your vote. Please try again later.";
    } finally {
      clearTurnstile();
      votePending[modId] = false;
    }
  }

  onMount(async () => {
    addEventListener("popstate", () => (selectedId = new URLSearchParams(location.search).get("mod")));
    try {
      localStorage.removeItem("voidstrap-voter-id");
      localStorage.removeItem("voidstrap-mod-votes");
      const cached = JSON.parse(localStorage.getItem(VOTE_CACHE) || "null");
      if (cached && Date.now() - cached.at < 7 * 86400000) {
        voteTotals = cached.totals || {};
        myVotes = cached.votes || {};
      }
    } catch {}
    loadVotes();
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
      <div class="detail-header">
        <div class="ico big">{@render icon(m)}</div>
        <div class="detail-heading">
          <h1>{m.name}</h1>
          <p>{m.description || "No description."}</p>
          <div class="detail-meta"><span>by @{m.login}</span>{@render badges(m)}</div>
          <ModVotes modId={m.id} totals={voteTotals[m.id]} selected={myVotes[m.id]} pending={votePending[m.id]} available={votingAvailable} onvote={vote} />
        </div>
        <a class="btn accent lg" href="voidstrap://mods/install/{m.id}" title="Opens Voidstrap and installs this mod">Install</a>
      </div>
      <div class="detail-layout">
        <div class="detail-content">
          {#if voteError}<p class="vote-error" role="alert">{voteError}</p>{/if}
          <div class="detail-tabs" class:versions-active={detailTab === "versions"} role="tablist" aria-label="Mod information">
            <button type="button" role="tab" aria-selected={detailTab === "changelog"} class:active={detailTab === "changelog"} onclick={() => (detailTab = "changelog")}>Changelog</button>
            <button type="button" role="tab" aria-selected={detailTab === "versions"} class:active={detailTab === "versions"} onclick={() => (detailTab = "versions")}>Versions</button>
          </div>
          {#if detailTab === "changelog"}
            <section class="history" aria-label="Changelog">
              {#if changesStatus === "loading"}
                <p class="empty">Loading changelog...</p>
              {:else if changesStatus === "error"}
                <p class="empty">The changelog could not be loaded. <a href="https://github.com/{repo}/commits/main/mods/{encodeURIComponent(m.name)}">View history on GitHub</a>.</p>
              {:else if changes.length === 0}
                <p class="empty">No changes are available yet.</p>
              {:else}
                {#each changes as change (change.sha)}
                  <article class="change">
                    <div class="change-heading"><a href={change.html_url} rel="noopener noreferrer">{cleanMessage(change.commit.message.split("\n")[0])}</a><span>{date(change.commit.author.date)}</span></div>
                    {#if cleanMessage(change.commit.message.split("\n").slice(1).join("\n"))}<p>{cleanMessage(change.commit.message.split("\n").slice(1).join("\n"))}</p>{/if}
                  </article>
                {/each}
              {/if}
            </section>
          {:else}
            <section class="versions" aria-label="Versions">
              <div class="version-heading"><span>Version</span><span>Updated</span><span></span></div>
              {#if versionsStatus === "loading"}
                <p class="version-message">Loading versions...</p>
              {:else if versionsStatus === "error"}
                <p class="version-message">Version history could not be loaded. Please try again later.</p>
              {:else if versions.length === 0}
                <p class="version-message">No version history is available yet.</p>
              {:else}
                {#each versions as version (version.version)}
                  <div class="version-row"><strong>{version.version}</strong><span>{date(version.date)}</span>{#if version.version === m.version}<a class="btn accent" href="voidstrap://mods/install/{m.id}">Install</a>{:else}<a class="btn" href="https://github.com/{repo}/tree/{version.sha}/mods/{m.name}" rel="noopener noreferrer">View source</a>{/if}</div>
                {/each}
              {/if}
            </section>
          {/if}
        </div>
        <aside class="detail-sidebar">
          <section><h2>Mod information</h2><small>Creator</small><b>@{m.login}</b><small>Trust</small><p>{m.verified ? "Reviewed and verified by the maintainer." : m.trusted ? "Made by an author the maintainer trusts." : "Only automated checks looked at this mod. Install it only if you trust the author."}</p><small>Websites it contacts</small><p>{(m.network || []).length ? m.network.join(", ") : "Works offline"}{#if (m.permissions || []).includes("roblox-account")}<br />Uses your Roblox account (read only, never sees your login){/if}</p></section>
          <section><h2>Links</h2><a href="https://github.com/{repo}/tree/{commit}/mods/{m.name}" rel="noopener noreferrer">View source</a></section>
          {#if (m.tags || []).length}<section><h2>Tags</h2><div class="tags">{#each m.tags as tag}<span class="tag">{tag}</span>{/each}</div></section>{/if}
        </aside>
      </div>
    </section>
  {:else}
  <div class="library">
  <aside class="filters" aria-label="Filter mods">
    <section class="filter-group">
      <h2>Trust</h2>
      {#each [["all", "All mods"], ["verified", "Verified"], ["trusted", "Trusted author"], ["unverified", "Not verified"]] as [value, label]}
        <button type="button" class:active={trust === value} aria-pressed={trust === value} onclick={() => (trust = value)}>{label}</button>
      {/each}
    </section>
    <section class="filter-group">
      <h2>Connection</h2>
      {#each [["all", "All mods"], ["offline", "Works offline"], ["online", "Contacts websites"]] as [value, label]}
        <button type="button" class:active={connection === value} aria-pressed={connection === value} onclick={() => (connection = value)}>{label}</button>
      {/each}
    </section>
  </aside>
  <main class="library-main">
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

  <div class="results">
  {#if voteError}<p class="vote-error" role="alert">{voteError}</p>{/if}
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
    <p class="note">No mods match your search and filters.</p>
  {:else}
    <div class="list">
      {#each shown as m (m.id)}
        <div class="row">
          <div class="ico">{@render icon(m)}</div>
          <div class="info">
            <div class="name">
              <a class="mod-title" href="/mods?mod={encodeURIComponent(m.id)}" onclick={(e) => open(e, m)}>{m.name}</a>
              {@render badges(m)}
            </div>
            <p>{m.description || "No description."}</p>
            {#if (m.tags || []).length}
              <div class="tags" aria-label="Tags">{#each m.tags as tag}<span class="tag">{tag}</span>{/each}</div>
            {/if}
            <div class="meta">
              <span class="who">@{m.login}</span>
              <span>{(m.network || []).length ? `Contacts: ${m.network.join(", ")}` : "Works offline"}</span>
              {#if (m.permissions || []).includes("roblox-account")}<span>Uses your Roblox account (read only, never sees your login)</span>{/if}
            </div>
          </div>
          <div class="side">
            <span class="ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>{m.version}</span>
            <ModVotes modId={m.id} totals={voteTotals[m.id]} selected={myVotes[m.id]} pending={votePending[m.id]} available={votingAvailable} onvote={vote} />
            <div class="btns">
              <a class="btn" href="/mods?mod={encodeURIComponent(m.id)}" onclick={(e) => open(e, m)}>View</a>
              <a class="btn accent" href="voidstrap://mods/install/{m.id}" title="Opens Voidstrap and installs this mod"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1zM4 17a1 1 0 0 1 1 1v1h14v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/></svg>Install</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  </div>
  </main>
  </div>
  {/if}
</div>

<div class="turnstile" bind:this={turnstileHost}></div>

<style>
  .bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(11,11,13,.35) 0%, rgba(11,11,13,.6) 50%, rgba(11,11,13,.85) 100%), url("/assets/img/hero.webp") center / cover no-repeat; }
  .page { max-width: 1480px; margin: 0 auto; padding: 0 1.5rem 3rem; user-select: none; }
  .detail { padding: 1.5rem 0 2rem; }
  .back { display: inline-flex; align-items: center; gap: .35rem; color: #c9c9cf; text-decoration: none; font-size: .92rem; margin-bottom: 1.4rem; }
  .back svg { width: 16px; height: 16px; }
  .detail-header { display: flex; align-items: flex-start; gap: 1rem; padding-bottom: 1.2rem; border-bottom: 1px solid rgba(255,255,255,.1); }
  .ico.big { width: 96px; height: 96px; flex: none; }
  .ico.big svg { width: 34px; height: 34px; }
  .detail-heading { flex: 1; min-width: 0; }
  .detail-heading h1 { margin: 0; font: 800 1.8rem var(--display); overflow-wrap: anywhere; }
  .detail-heading p { margin: .2rem 0 .5rem; color: #a9a9b2; line-height: 1.4; }
  .detail-meta { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; color: #a9a9b2; font-size: .85rem; }
  .btn.lg { height: 42px; padding: 0 1.4rem; font-size: .9rem; }
  .detail-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 1.2rem; padding-top: 1rem; align-items: start; }
  .detail-content { min-width: 0; }
  .detail-tabs { position: relative; display: inline-grid; grid-template-columns: repeat(2, 1fr); padding: .3rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: #18181c; isolation: isolate; }
  .detail-tabs::before { content: ""; position: absolute; z-index: -1; top: .3rem; bottom: .3rem; left: .3rem; width: calc((100% - .6rem) / 2); border-radius: 999px; background: rgba(167,123,255,.22); transition: transform .25s cubic-bezier(.2,.8,.2,1); }
  .detail-tabs.versions-active::before { transform: translateX(100%); }
  .detail-tabs button { padding: .55rem 1rem; border: 0; border-radius: 999px; background: transparent; color: #fff; font: 700 .85rem var(--sans); cursor: pointer; transition: color .25s ease; }
  .detail-tabs button.active { color: var(--accent); }
  @media (prefers-reduced-motion: reduce) { .detail-tabs::before, .detail-tabs button { transition: none; } }
  .history, .versions, .detail-sidebar section { border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: #0e0e11; }
  .history { padding: 1.4rem; background: #18181c; }
  .change { position: relative; padding: 0 0 1.5rem 1.4rem; border-left: 3px solid var(--accent); }
  .change:last-child { padding-bottom: 0; }
  .change::before { content: ""; position: absolute; top: .3rem; left: -7px; width: 11px; height: 11px; border-radius: 50%; background: var(--accent); }
  .change-heading { display: flex; flex-wrap: wrap; gap: .3rem .6rem; align-items: baseline; }
  .change-heading a { color: #fff; font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
  .change-heading a:hover { text-decoration: underline; }
  .change-heading span, .change p, .empty { color: #a9a9b2; font-size: .9rem; }
  .change p { margin: .5rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  .empty { margin: 0; }
  .empty a { color: var(--accent); }
  .versions { overflow: hidden; }
  .version-heading, .version-row { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 1rem; padding: .9rem 1rem; }
  .version-heading { color: #a9a9b2; font-size: .85rem; background: rgba(255,255,255,.04); }
  .version-row { border-top: 1px solid rgba(255,255,255,.1); }
  .version-row span { color: #a9a9b2; font-size: .9rem; }
  .version-message { margin: 0; padding: 1rem; color: #a9a9b2; font-size: .9rem; }
  .detail-sidebar { display: grid; gap: .75rem; }
  .detail-sidebar section { display: grid; gap: .35rem; padding: 1rem; }
  .detail-sidebar h2 { margin: 0 0 .4rem; font: 700 1rem var(--sans); }
  .detail-sidebar small { margin-top: .4rem; color: #7c7c86; font-size: .8rem; }
  .detail-sidebar b { font-size: .9rem; }
  .detail-sidebar p { margin: 0; color: #a9a9b2; font-size: .88rem; line-height: 1.5; overflow-wrap: anywhere; }
  .detail-sidebar a { color: #c9c9cf; font-size: .9rem; }
  @media (max-width: 860px) { .detail-layout { grid-template-columns: 1fr; } .detail-header { flex-wrap: wrap; } .ico.big { width: 64px; height: 64px; } }
  .library { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: .8rem; align-items: start; padding-top: 1.5rem; }
  .library-main { min-width: 0; }
  .filters { display: grid; gap: .75rem; animation: rise .8s cubic-bezier(.2,.8,.2,1) .26s both; }
  .filter-group { display: grid; gap: .2rem; padding: 1rem; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: #0e0e11; }
  .filter-group h2 { margin: 0 0 .5rem; font: 700 1rem var(--sans); }
  .filter-group button { padding: .45rem .6rem; border: 0; border-radius: 5px; background: transparent; color: #a9a9b2; font: 500 .9rem var(--sans); text-align: left; cursor: pointer; }
  .filter-group button:hover { background: rgba(255,255,255,.05); color: #fff; }
  .filter-group button.active { background: rgba(167,123,255,.16); color: var(--accent); }
  .head { position: relative; z-index: 1; padding: 0 0 1rem; }
  .head, .results { opacity: 0; animation: rise .8s cubic-bezier(.2,.8,.2,1) forwards; }
  .head { animation-delay: .26s; }
  .results { animation-delay: .34s; }
  @keyframes rise { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .head, .results, .filters { opacity: 1; animation: none; } }
  .tools { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: .7rem; }
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
  .turnstile { position: fixed; bottom: 1rem; right: 1rem; z-index: 50; }
  .vote-error { color: #ffb5b5; font-size: .85rem; }
  .note a { color: var(--accent); }
  .list { display: grid; gap: 10px; }
  .row { display: grid; grid-template-columns: 80px 1fr auto; align-items: center; gap: 1.1rem; padding: .8rem 1rem .8rem .8rem; border-radius: 6px; background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; }
  .row:not(.sk):hover { background: #19191e; }
  .ico { display: grid; place-items: center; width: 80px; height: 80px; border-radius: 8px; background: rgba(255,255,255,.05); color: #fff; overflow: hidden; }
  .ico img { width: 100%; height: 100%; object-fit: cover; }
  .ico svg { width: 26px; height: 26px; }
  .info { min-width: 0; display: grid; gap: .35rem; }
  .name { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }
  .mod-title { font: 800 1.15rem var(--display); font-stretch: 88%; letter-spacing: .02em; color: #fff; text-decoration: none; }
  .row:hover .mod-title, .mod-title:focus-visible { text-decoration: underline; }
  .badge { display: inline-flex; align-items: center; gap: .3rem; padding: .1rem .5rem; border-radius: 999px; font: 500 .72rem var(--mono); }
  .badge svg { width: 12px; height: 12px; }
  .badge.blue { color: #58a6ff; background: rgba(88,166,255,.15); }
  .badge.red { color: #e84855; background: rgba(232,72,85,.15); }
  .badge.green { color: #2ecc71; background: rgba(46,204,113,.15); }
  .badge.yellow { color: #d29922; background: rgba(210,153,34,.15); }
  .badge.gold { color: #f1c40f; background: rgba(241,196,15,.15); }
  .info p { margin: 0; color: #a9a9b2; font-size: .9rem; line-height: 1.4; }
  .tags { display: flex; flex-wrap: wrap; gap: .35rem; }
  .tag { display: inline-flex; align-items: center; padding: .1rem .55rem; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(255,255,255,.06); color: #a9a9b2; font-size: .78rem; line-height: 1.5; }
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
    .detail-heading { flex-basis: calc(100% - 80px); }
    .detail-header > .btn { margin-left: 80px; }
    .library { grid-template-columns: 1fr; }
    .filters { grid-template-columns: 1fr 1fr; }
    .filter-group { padding: .8rem; }
    .tools { grid-template-columns: 1fr; }
    .tools input { flex: none; width: 100%; min-width: 0; }
    .dd { min-width: 0; }
    .row { grid-template-columns: 52px 1fr; align-items: start; gap: .8rem; padding: .9rem; }
    .ico { width: 52px; height: 52px; }
    .ico svg { width: 22px; height: 22px; }
    .side { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .6rem .8rem; min-width: 0; }
    .btns { flex: 1 1 100%; display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .btns .btn { justify-content: center; padding: 0 .6rem; min-width: 0; max-width: none; }
    .btn { flex: 1; justify-content: center; max-width: 140px; }
  }
</style>
