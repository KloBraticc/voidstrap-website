<script>
  import { packages } from "../data/site.js";

  let { dialog = $bindable() } = $props();
  let copied = $state("");
  let copyError = $state("");

  async function copyCommand(pkg) {
    try {
      await navigator.clipboard.writeText(pkg.cmd);
      copied = pkg.id;
      copyError = "";
    } catch {
      copied = "";
      copyError = "Could not copy. Select the command and copy it manually.";
    }
  }

  function closeOnBackdrop(event) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  }
</script>

<dialog bind:this={dialog} aria-labelledby="install-title" onclick={closeOnBackdrop} onclose={() => { copied = ""; copyError = ""; }}>
  <h2 id="install-title">Install commands</h2>

  <div class="commands">
    {#each [["Windows", packages.slice(0, 1)], ["macOS", packages.slice(1, 2)], ["Linux", packages.slice(2)]] as [group, items]}
      <section class="group">
        <h3>{group}</h3>
        <div class="items" class:linux={group === "Linux"}>
          {#each items as pkg (pkg.id)}
            <div class="package">
              <h4>{pkg.label}</h4>
              <p>{pkg.note}</p>
              <div class="command">
                <code>{pkg.cmd}</code>
                <button type="button" aria-label="Copy {pkg.label} command" onclick={() => copyCommand(pkg)}>{copied === pkg.id ? "Copied" : "Copy"}</button>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <p class="status" role="status">{copyError}</p>
  <p class="android">On Android? <a href="https://wiki.voidstrapp.pages.dev/start/android/">See the Android setup guide</a>.</p>
</dialog>

<style>
  dialog { width: min(1220px, calc(100% - 28px)); max-height: calc(100dvh - 28px); padding: 1.6rem 1.8rem 1.2rem; color: var(--text); background: #0e0e11; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; box-shadow: 0 24px 60px rgba(0,0,0,.55); animation: menu-in .18s ease-out; user-select: none; -webkit-user-select: none; }
  dialog::backdrop { background: rgba(0,0,0,.35); }
  h2 { margin: 0 0 1rem; color: #fff; font: 600 1.1rem var(--sans); }
  .commands { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 1.5rem 2rem; }
  .group { min-width: 0; }
  h3 { margin: 0 0 1rem; font: 500 1rem var(--sans); color: var(--accent); }
  .items { display: grid; gap: 1.1rem; }
  .items.linux { grid-template-columns: 1fr 1fr; gap: 1.1rem 1.6rem; }
  .package { min-width: 0; }
  h4 { margin: 0 0 .25rem; font: 600 1.1rem var(--sans); color: #fff; }
  .package p, .android { margin: 0; color: #a9a9b2; font-size: .95rem; line-height: 1.45; }
  .command { display: flex; min-width: 0; margin-top: .6rem; border: 1px solid rgba(255,255,255,.1); border-radius: 6px; background: rgba(255,255,255,.04); }
  .command code { flex: 1; min-width: 0; padding: .65rem; overflow-x: auto; white-space: nowrap; color: #e3d6ff; font: .75rem var(--mono); user-select: text; -webkit-user-select: text; }
  .command button { padding: .6rem; border: 0; border-left: 1px solid rgba(255,255,255,.1); background: transparent; color: #fff; font: 600 .8rem var(--sans); cursor: pointer; }
  .command button:hover, .command button:active { background: rgba(255,255,255,.08); }
  .status:empty { display: none; }
  .status { color: #ffb5b5; font-size: .85rem; }
  .android { margin-top: 1.5rem; font-size: .78rem; color: #6f6f78; }
  .android a { color: var(--accent); }
  @keyframes menu-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 900px) { .commands, .items.linux { grid-template-columns: 1fr; } }
</style>
