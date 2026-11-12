<script>
  let { modId, totals, selected = 0, pending = false, available = false, onvote } = $props();
</script>

<div class="votes" aria-label="Mod votes" title={!available ? "Voting is currently unavailable, showing the last known counts" : undefined}>
  <button type="button" aria-label="Like mod, {available ? totals?.likes ?? 0 : 'unavailable'} likes" aria-pressed={selected === 1} disabled={!available || pending} onclick={() => onvote(modId, selected === 1 ? 0 : 1)}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v10H4V10h3zm0 9h9a2 2 0 0 0 2-1.5l1.3-5A2 2 0 0 0 17.4 10H14V5a2 2 0 0 0-2-2l-2 5-3 2" /></svg>
    <span>{totals ? totals.likes ?? 0 : available ? 0 : "—"}</span>
  </button>
  <button type="button" aria-label="Dislike mod, {available ? totals?.dislikes ?? 0 : 'unavailable'} dislikes" aria-pressed={selected === -1} disabled={!available || pending} onclick={() => onvote(modId, selected === -1 ? 0 : -1)}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 14V4H4v10h3zm0-9h9a2 2 0 0 1 2 1.5l1.3 5a2 2 0 0 1-1.9 2.5H14v5a2 2 0 0 1-2 2l-2-5-3-2" /></svg>
    <span>{totals ? totals.dislikes ?? 0 : available ? 0 : "—"}</span>
  </button>
</div>

<style>
  .votes { display: inline-flex; align-items: center; gap: .25rem; }
  button { display: inline-flex; align-items: center; gap: .3rem; padding: .35rem .5rem; border: 1px solid transparent; border-radius: 5px; background: transparent; color: #a9a9b2; font: 600 .8rem var(--sans); cursor: pointer; }
  button:hover:not(:disabled) { background: rgba(255,255,255,.07); color: #fff; }
  button[aria-pressed="true"] { color: var(--accent); background: rgba(167,123,255,.14); }
  button:disabled { opacity: .5; cursor: not-allowed; }
  svg { width: 16px; height: 16px; }
</style>
