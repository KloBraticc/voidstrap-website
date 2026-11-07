<script>
  let { href, icon = "", variant = "chip", children } = $props();

  const icons = {
    github: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z",
    pr: "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 9v6m12 0V8a2 2 0 0 0-2-2h-4m2-3-3 3 3 3",
    download: "M12 3v12m0 0-5-5m5 5 5-5M4 21h16"
  };
  const stroked = ["pr", "download"];
</script>

<a class="btn {variant}" {href} rel="noopener noreferrer">
  {#if icon}
    <svg viewBox="0 0 24 24" aria-hidden="true"
      fill={stroked.includes(icon) ? "none" : "currentColor"}
      stroke={stroked.includes(icon) ? "currentColor" : "none"}
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons[icon]} /></svg>
  {/if}
  {@render children()}
</a>

<style>
  .btn { display: inline-flex; align-items: center; gap: .5rem; text-decoration: none; transition: background .15s, border-color .15s, color .15s, transform .15s; }
  .btn svg { width: 15px; height: 15px; flex: none; }
  .btn:active { transform: translateY(1px); }
  .chip { background: #18181a; border: 1px solid #262629; color: #e8e8ea; padding: .5rem .8rem; border-radius: 4px; font-size: .9rem; font-weight: 500; }
  .chip:hover { background: #222225; border-color: #3a3a3e; }
  .solid, .ghost { font-family: var(--mono); text-transform: uppercase; letter-spacing: .12em; font-size: .7rem; padding: .95rem 1.4rem; }
  .solid { background: #fff; color: #0c0c0d; border: 1px solid #fff; }
  .solid:hover { background: var(--accent); border-color: var(--accent); color: #0c0c0d; }
  .ghost { background: transparent; color: #f2f2f3; border: 1px solid #3a3a3e; }
  .ghost:hover { border-color: var(--accent); background: var(--accent); color: #0c0c0d; }
</style>
