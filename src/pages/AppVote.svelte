<script>
  const MOD_ID = /^[0-9]{1,20}\/[a-z0-9][a-z0-9._-]{0,99}$/i;
  const params = new URLSearchParams(location.search);
  const done = location.pathname.replace(/\/+$/, "") === "/vote/done";
  const modId = params.get("mod") || "";
  const value = Number(params.get("v"));
  const valid = MOD_ID.test(modId) && [-1, 0, 1].includes(value);
  let host;
  let closed = $state(false);
  let message = $state(done ? (params.has("error") ? "Your vote could not be saved." : "Your vote was saved.") : valid ? "Confirming your vote..." : "This vote link is not valid.");

  const finish = (query) => location.replace("/vote/done?" + new URLSearchParams(query));

  function loadTurnstile() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("missing")));
      script.onerror = () => reject(new Error("load"));
      document.head.appendChild(script);
    });
  }

  async function run() {
    try {
      const info = await fetch("/api/mod-votes", { cache: "no-store", signal: AbortSignal.timeout(8000) });
      const { siteKey } = info.ok ? await info.json() : {};
      if (!siteKey) {
        message = "Voting is turned off right now.";
        closed = true;
        return;
      }
      const turnstile = await loadTurnstile();
      const token = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), 120000);
        turnstile.render(host, {
          sitekey: siteKey,
          action: "vote",
          theme: "dark",
          callback: (t) => { clearTimeout(timer); resolve(t); },
          "error-callback": () => { clearTimeout(timer); reject(new Error("verify")); },
          "expired-callback": () => { clearTimeout(timer); reject(new Error("expired")); }
        });
      });
      const response = await fetch("/api/mod-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId, vote: value, token }),
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) return finish({ error: String(response.status) });
      const result = await response.json();
      finish({ likes: String(result.likes), dislikes: String(result.dislikes), vote: String(result.vote) });
    } catch {
      finish({ error: "403" });
    }
  }

  $effect(() => {
    if (!done && valid) run();
  });
</script>

<main class="vote">
  <img src="/assets/img/brand/voidstrap-256.webp" alt="" width="56" height="56" draggable="false" />
  <p>{message}</p>
  <div bind:this={host}></div>
  {#if done || closed}<small>You can close this window.</small>{/if}
</main>

<style>
  .vote { min-height: 100svh; display: grid; place-content: center; justify-items: center; gap: .9rem; padding: 1.5rem; text-align: center; user-select: none; -webkit-user-select: none; }
  p { margin: 0; font: 600 1rem var(--sans); }
  small { color: var(--muted); }
</style>
