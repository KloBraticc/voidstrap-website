<script>
  let { href, icon = "", variant = "chip", children } = $props();

  const icons = {
    github: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z",
    pr: "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 9v6m12 0V8a2 2 0 0 0-2-2h-4m2-3-3 3 3 3",
    download: "M12 16.4 5.4 9.8a.6.6 0 0 1 .42-1.02H9.8V3.5A1.5 1.5 0 0 1 11.3 2h1.4a1.5 1.5 0 0 1 1.5 1.5v5.28h3.98a.6.6 0 0 1 .42 1.02zM2 16.5A1.5 1.5 0 0 1 3.5 15h4.3l2.8 2.8a2 2 0 0 0 2.8 0l2.8-2.8h4.3a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 20.5zm16.5 3.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    terminal: "M4.44 4.44a1.5 1.5 0 0 1 2.12 0l6.5 6.5a1.5 1.5 0 0 1 0 2.12l-6.5 6.5a1.5 1.5 0 1 1-2.12-2.12L9.88 12 4.44 6.56a1.5 1.5 0 0 1 0-2.12zM13 18.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 0 3h-5a1.5 1.5 0 0 1-1.5-1.5z"
  };
  const stroked = ["pr"];
</script>

<a class="btn {variant}" {href} rel="noopener noreferrer">
  {#if icon}
    <svg viewBox="0 0 24 24" aria-hidden="true"
      fill={stroked.includes(icon) ? "none" : "currentColor"}
      stroke={stroked.includes(icon) ? "currentColor" : "none"}
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path fill-rule="evenodd" d={icons[icon]} /></svg>
  {/if}
  {@render children()}
</a>

<style>
  .btn { display: inline-flex; align-items: center; gap: .5rem; text-decoration: none; }
  .btn svg { width: 15px; height: 15px; flex: none; }
  .chip { background: #18181a; border: 1px solid #262629; color: #e8e8ea; padding: .5rem .8rem; border-radius: 4px; font-size: .9rem; font-weight: 500; }
  .chip:hover { background: #222225; border-color: #3a3a3e; }
  .solid, .ghost { font: 800 .95rem var(--display); font-stretch: 88%; text-transform: uppercase; letter-spacing: .03em; padding: .7rem 1.2rem; min-width: 150px; justify-content: center; border-radius: 6px; }
  .solid svg, .ghost svg { width: 19px; height: 19px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.35)); }
  .solid, .ghost { text-shadow: 0 1px 2px rgba(0,0,0,.3); }
  .solid { background: var(--accent); color: #fff; border: 1px solid rgba(255,255,255,.18); }
  .solid:hover { background: #b993ff; }
  .ghost { background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.22); backdrop-filter: blur(8px); }
  .ghost:hover { background: rgba(255,255,255,.18); }
</style>
