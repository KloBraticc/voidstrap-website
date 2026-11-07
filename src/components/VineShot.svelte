<script>
  let { src, alt, width, height } = $props();
  let wrapEl = $state();
  let active = $state(false);

  const leaf = "M0,0 C8,-11 23,-11 32,0 C23,11 8,11 0,0Z";

  const roots = [
    { pos: "tl", d: "M0,0 C-14,-8 -22,-30 -46,-38 C-62,-43 -74,-34 -78,-22", leaves: [[-22, -24, -150, 0.7], [-50, -40, -120, 0.6]], curl: "M-78,-22 C-82,-12 -72,-6 -68,-14", delay: 0 },
    { pos: "tl", d: "M0,0 C-10,10 -32,14 -44,30 C-52,40 -48,52 -38,54", leaves: [[-30, 16, 160, 0.6]], curl: "", delay: 0.08 },
    { pos: "tr", d: "M0,0 C12,-12 22,-34 46,-44 C60,-50 72,-42 74,-30", leaves: [[24, -28, -40, 0.7], [52, -44, -70, 0.55]], curl: "M74,-30 C76,-20 66,-16 64,-24", delay: 0.05 },
    { pos: "bl", d: "M0,0 C-16,10 -26,34 -50,40 C-64,44 -74,36 -74,26", leaves: [[-26, 26, 150, 0.7], [-54, 40, 120, 0.55]], curl: "M-74,26 C-76,16 -66,12 -62,20", delay: 0.1 },
    { pos: "br", d: "M0,0 C14,8 24,32 48,40 C62,45 74,36 76,24", leaves: [[26, 24, 30, 0.7], [54, 40, 60, 0.55]], curl: "M76,24 C78,14 68,10 64,18", delay: 0.04 },
    { pos: "br", d: "M0,0 C10,-12 30,-18 42,-34 C50,-44 46,-56 36,-58", leaves: [[30, -20, -30, 0.6]], curl: "", delay: 0.12 },
    { pos: "tm", d: "M0,0 C-6,-16 6,-30 -4,-48 C-10,-58 -2,-66 6,-62", leaves: [[-2, -22, -110, 0.6], [2, -42, -60, 0.5]], curl: "", delay: 0.15 },
    { pos: "bm", d: "M0,0 C8,14 -4,30 6,46 C12,56 4,64 -4,60", leaves: [[4, 22, 70, 0.6], [0, 42, 120, 0.5]], curl: "", delay: 0.18 }
  ];

  $effect(() => {
    if (!wrapEl) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (window.matchMedia("(hover: none), (max-width: 860px)").matches) {
          active = entry.isIntersecting;
        }
      },
      { threshold: 0.45 }
    );
    io.observe(wrapEl);
    return () => io.disconnect();
  });
</script>

<div
  class="wrap"
  class:active
  role="presentation"
  bind:this={wrapEl}
  onpointerenter={() => (active = true)}
  onpointerleave={() => (active = false)}
  ontouchstart={() => (active = !active)}
>
  <img class="shot" {src} {alt} {width} {height} loading="lazy" decoding="async" />
  {#each roots as r}
    <svg class="root {r.pos}" viewBox="-100 -100 200 200" aria-hidden="true" style="--rd:{r.delay}s">
      <path d={r.d} pathLength="1" class="stem" />
      {#if r.curl}<path d={r.curl} pathLength="1" class="stem curl" />{/if}
      {#each r.leaves as [x, y, a, s], k}
        <g transform="translate({x} {y}) rotate({a}) scale({s})">
          <g class="lf" style="--ld:{0.22 + k * 0.1}s">
            <path d={leaf} />
            <path d="M3,0 L27,0" class="vein" />
          </g>
        </g>
      {/each}
    </svg>
  {/each}
</div>

<style>
  .wrap { position: relative; }
  .shot { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 28px 70px -28px rgba(0,0,0,.85); position: relative; z-index: 1; }
  .root { position: absolute; width: 200px; height: 200px; overflow: visible; pointer-events: none; z-index: 2; }
  .tl { left: -100px; top: -100px; }
  .tr { right: -100px; top: -100px; }
  .bl { left: -100px; bottom: -100px; }
  .br { right: -100px; bottom: -100px; }
  .tm { left: calc(38% - 100px); top: -100px; }
  .bm { left: calc(64% - 100px); bottom: -100px; }
  .stem { fill: none; stroke: #e4e4ea; stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .35s ease-in; }
  .curl { stroke-width: 1.6; transition-delay: 0s; }
  .lf { transform-box: fill-box; transform-origin: left center; transform: scale(0); transition: transform .2s ease-in; }
  .lf path { fill: var(--accent); stroke: #151518; stroke-width: 1.4; }
  .lf .vein { fill: none; stroke: #3c1c70; stroke-width: 1.2; stroke-linecap: round; }
  .wrap:hover .stem, .wrap.active .stem { stroke-dashoffset: 0; transition: stroke-dashoffset .7s cubic-bezier(.3,.7,.3,1) var(--rd); }
  .wrap:hover .curl, .wrap.active .curl { transition-delay: calc(var(--rd) + .55s); }
  .wrap:hover .lf, .wrap.active .lf { transform: scale(1); transition: transform .45s cubic-bezier(.3,1.7,.5,1) calc(var(--rd) + var(--ld)); }
  @media (max-width: 860px) {
    .wrap { max-width: min(560px, 90%); margin: 0 auto; }
    .root { width: 160px; height: 160px; }
    .tl { left: -80px; top: -80px; }
    .tr { right: -80px; top: -80px; }
    .bl { left: -80px; bottom: -80px; }
    .br { right: -80px; bottom: -80px; }
    .tm { left: calc(38% - 80px); top: -80px; }
    .bm { left: calc(64% - 80px); bottom: -80px; }
  }
</style>
