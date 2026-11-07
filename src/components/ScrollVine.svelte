<script>
  let { sections = [] } = $props();

  let progress = $state(0);
  let marks = $state([]);
  let maxScroll = 1;
  let canScroll = $state(true);

  function measure() {
    if (innerWidth <= 860) return;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    canScroll = scrollable > 20;
    maxScroll = Math.max(1, scrollable);
    marks = sections.map((s) => {
      const el = document.getElementById(s.id);
      return el ? Math.min(1, Math.max(0, el.offsetTop / maxScroll)) : 0;
    });
    update();
  }

  function update() {
    if (innerWidth <= 860) return;
    progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  }

  $effect(() => {
    measure();
    const t = setTimeout(measure, 600);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", measure, { passive: true });
    return () => { clearTimeout(t); removeEventListener("scroll", update); removeEventListener("resize", measure); };
  });

  const wave = (() => {
    let d = "M20,0";
    for (let y = 0; y < 1000; y += 50) d += ` Q${y % 100 ? 6 : 34},${y + 25} 20,${y + 50}`;
    return d;
  })();

  const leaves = Array.from({ length: 20 }, (_, k) => {
    const right = k % 2 === 0;
    return { f: (k * 50 + 25) / 1000, x: right ? 27 : 13, right, s: 0.8 + ((k * 7) % 5) / 10, curl: k % 3 === 1 };
  });

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
</script>

<aside class="stem" class:hidden={!canScroll} aria-hidden="true">
  <svg viewBox="0 0 40 1000" preserveAspectRatio="none">
    <path class="ghost" d={wave} vector-effect="non-scaling-stroke" />
    <path class="grow" d={wave} pathLength="1" style="stroke-dashoffset:{Math.max(0, Math.min(1, 1 - progress))}" vector-effect="non-scaling-stroke" />
  </svg>
  {#each leaves as l, i}
    <span class="sl" class:r={l.right} class:on={progress >= l.f} style="top:{l.f * 100}%; left:{l.x}px; --s:{l.s}; --i:{i}">
      <svg viewBox="0 -12 44 24">
        {#if l.curl}<path class="tendril" d="M0,0 C10,-2 16,6 24,2 C30,-1 30,-8 25,-8 C22,-8 22,-4 25,-4" />{/if}
        <path class="lf" d="M0,0 C8,-11 23,-11 32,0 C23,11 8,11 0,0Z" />
        <path class="vein" d="M2,0 L28,0" />
      </svg>
    </span>
  {/each}
  {#each marks as m, i}
    <button class="bud" class:open={progress >= m - 0.02} style="top:{m * 100}%" tabindex="-1" aria-label={sections[i].label} onclick={() => go(sections[i].id)}>
      <svg viewBox="-32 -32 64 64"><path d="M-28,-4 C-31,-22 -12,-33 4,-30 C21,-31 33,-18 30,-2 C31,14 22,27 4,28 C-14,31 -31,18 -28,-4Z" /><path class="ln" d="M-2,-8 C7,-12 12,-1 5,4 C-4,9 -12,0 -7,-9 C0,-18 16,-14 17,-2" /></svg>
    </button>
  {/each}
</aside>


<style>
  .stem { position: fixed; right: 18px; top: 70px; bottom: 40px; width: 40px; z-index: 5; pointer-events: none; }
  .stem.hidden { display: none; }
  .stem > svg { width: 100%; height: 100%; overflow: visible; }
  .stem path { fill: none; stroke-linecap: round; }
  .ghost { stroke: #26262a; stroke-width: 2; }
  .grow { stroke: #e4e4ea; stroke-width: 3; stroke-dasharray: 1 5; transition: stroke-dashoffset .12s linear; }
  .sl { position: absolute; width: 20px; height: 11px; margin-top: -5.5px; transform-origin: 0 50%; transform: rotate(-35deg) scale(0); transition: transform .55s cubic-bezier(.3,1.7,.5,1); }
  .sl:not(.r) { transform: rotate(215deg) scale(0); }
  .sl.on { transform: rotate(-35deg) scale(var(--s)); }
  .sl.on:not(.r) { transform: rotate(215deg) scale(var(--s)); }
  .sl svg { width: 100%; height: 100%; overflow: visible; display: block; }
  .sl.on svg { animation: rustle calc(2.6s + var(--i) * .13s) ease-in-out infinite; transform-origin: 0 50%; }
  .stem .sl .lf { fill: var(--accent); stroke: none; }
  .stem .sl .vein { stroke: #3c1c70; stroke-width: 1.5; }
  .stem .sl .tendril { stroke: #e4e4ea; stroke-width: 1.6; fill: none; stroke-dasharray: 60; stroke-dashoffset: 60; transition: stroke-dashoffset .8s ease .2s; }
  .stem .sl.on .tendril { stroke-dashoffset: 0; }
  @keyframes rustle { 0%, 100% { rotate: -6deg; } 50% { rotate: 8deg; } }
  .bud { position: absolute; left: 50%; width: 22px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; pointer-events: auto; transform: translate(-50%, -50%) scale(.35) rotate(-90deg); transition: transform .6s cubic-bezier(.3,1.6,.5,1); }
  .bud svg { width: 100%; height: 100%; }
  .bud path { fill: #3a3a3f; transition: fill .4s; }
  .bud .ln { fill: none; stroke: #111; stroke-width: 3; opacity: 0; transition: opacity .4s; }
  .bud.open { transform: translate(-50%, -50%) scale(1) rotate(0); }
  .bud.open path { fill: #f4f4f4; }
  .bud.open .ln { fill: none; opacity: 1; }

  @media (max-width: 860px) { .stem { display: none; } }
</style>
