<script>
  import VineLogo from "../components/VineLogo.svelte";
  import Button from "../components/Button.svelte";
</script>

<main class="nf">
  <div class="logo"><VineLogo config={{ text: "404" }} /></div>
  <h1>Page not found</h1>
  <p>This page does not exist or has been removed.</p>
  <Button variant="solid" href="/">Return home</Button>
</main>

<style>
  .nf { min-height: 100svh; display: grid; place-content: center; justify-items: center; text-align: center; padding: 2rem; gap: .6rem; }
  .logo { width: min(700px, 90vw); height: 260px; }
  h1 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: -.03em; }
  p { margin: 0 0 1.2rem; color: var(--muted); }
</style>
