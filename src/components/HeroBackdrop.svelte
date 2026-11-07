<script>
  let el = $state();
  let paused = $state(false);

  $effect(() => {
    const io = new IntersectionObserver(([entry]) => (paused = !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  });

  const vines = [
    { d: "M-760,-320 C-520,-380 -440,-140 -260,-220 C-80,-300 40,-460 260,-340 C480,-220 560,-380 780,-280", dur: "3.2s", delay: "0s" },
    { d: "M-760,180 C-540,80 -380,320 -180,220 C20,120 180,360 420,240 C580,160 660,280 780,200", dur: "3.6s", delay: "0.2s" },
    { d: "M-520,-520 C-460,-260 -620,-40 -420,160 C-240,340 -360,440 -220,520", dur: "3.4s", delay: "0.3s" },
    { d: "M480,-520 C420,-280 600,-80 440,140 C300,320 460,420 340,520", dur: "3.5s", delay: "0.4s" },
    { d: "M-260,-220 C-180,-120 -240,-20 -140,40 C-60,85 -20,20 -70,-20", dur: "2.6s", delay: "0.8s" },
    { d: "M260,-340 C180,-220 280,-110 170,-40 C110,0 70,-50 115,-85", dur: "2.6s", delay: "0.9s" },
    { d: "M-420,160 C-310,110 -270,210 -190,150 C-140,115 -175,70 -210,100", dur: "2.4s", delay: "1.1s" },
    { d: "M440,140 C330,90 290,190 210,130 C160,95 195,50 230,80", dur: "2.4s", delay: "1.2s" },
    { d: "M-560,-120 C-480,-170 -430,-90 -370,-140 C-335,-170 -365,-205 -390,-180", dur: "2.2s", delay: "1.0s" },
    { d: "M560,-60 C490,-120 430,-40 370,-90 C335,-120 365,-155 390,-130", dur: "2.2s", delay: "1.1s" }
  ];

  const leaves = [
    { x: -580, y: -340, r: -25, s: 1.1, d: 0.6 },
    { x: -470, y: -230, r: 45, s: 0.95, d: 0.8 },
    { x: -330, y: -195, r: -145, s: 1.05, d: 1.0 },
    { x: -130, y: -295, r: -40, s: 0.9, d: 1.1 },
    { x: 95, y: -395, r: 30, s: 1.1, d: 1.2 },
    { x: 350, y: -290, r: 155, s: 1.0, d: 1.3 },
    { x: 580, y: -310, r: -30, s: 1.05, d: 1.4 },
    { x: -590, y: 135, r: -35, s: 1.0, d: 0.9 },
    { x: -390, y: 245, r: 35, s: 1.15, d: 1.1 },
    { x: -240, y: 245, r: -150, s: 0.9, d: 1.2 },
    { x: -40, y: 185, r: -25, s: 1.0, d: 1.3 },
    { x: 220, y: 285, r: 40, s: 1.1, d: 1.4 },
    { x: 520, y: 205, r: -35, s: 0.95, d: 1.5 },
    { x: -535, y: -90, r: 65, s: 1.1, d: 1.0 },
    { x: 515, y: -90, r: 110, s: 1.1, d: 1.1 },
    { x: -210, y: -110, r: 55, s: 0.85, d: 1.4 },
    { x: 225, y: -165, r: -135, s: 0.85, d: 1.5 }
  ];

  const leafPath = "M0,0 C8,-11 23,-11 32,0 C23,11 8,11 0,0Z";

  const cards = [
    { src: "/assets/img/cards/home.webp", x: -38, y: -28, w: 190, z: 1, tilt: -6, d: "0s" },
    { src: "/assets/img/cards/custom.webp", x: 26, y: -34, w: 185, z: 1, tilt: 5, d: "-3s" },
    { src: "/assets/img/cards/arsenal.webp", x: 37, y: 2, w: 205, z: 1, tilt: 7, d: "-6s" },
    { src: "/assets/img/cards/linux.webp", x: 26, y: 25, w: 180, z: 1, tilt: 4, d: "-9s" },
    { src: "/assets/img/cards/ironman.webp", x: -34, y: 24, w: 175, z: 1, tilt: -5, d: "-12s" },
    { src: "/assets/img/cards/aot.webp", x: -42, y: 4, w: 165, z: 1, tilt: -7, d: "-4s" },
    { src: "/assets/img/cards/custom.webp", x: -20, y: -10, w: 115, z: 0, tilt: -3, d: "-7s" },
    { src: "/assets/img/cards/aot.webp", x: 14, y: -14, w: 110, z: 0, tilt: 3, d: "-11s" },
    { src: "/assets/img/cards/linux.webp", x: -16, y: 32, w: 125, z: 0, tilt: -4, d: "-2s" },
    { src: "/assets/img/cards/home.webp", x: 4, y: 36, w: 120, z: 0, tilt: 2, d: "-8s" },
    { src: "/assets/img/cards/ironman.webp", x: -4, y: -38, w: 135, z: 0, tilt: 2, d: "-5s" },
    { src: "/assets/img/cards/arsenal.webp", x: 41, y: 36, w: 140, z: 0, tilt: 6, d: "-10s" }
  ];

  const sprouts = [
    { cls: "tl", d: "M0,0 C-10,-6 -16,-18 -30,-22 C-38,-24 -44,-20 -46,-14", lx: -30, ly: -22, lr: -150 },
    { cls: "tr", d: "M0,0 C10,-8 14,-20 28,-26 C36,-29 42,-24 42,-18", lx: 28, ly: -26, lr: -30 },
    { cls: "bl", d: "M0,0 C-8,10 -20,12 -26,24 C-30,32 -24,38 -18,38", lx: -26, ly: 24, lr: 150 },
    { cls: "br", d: "M0,0 C12,6 18,18 32,20 C40,21 44,16 42,10", lx: 32, ly: 20, lr: 20 }
  ];
</script>

<div class="backdrop" class:paused aria-hidden="true" bind:this={el}>
  <svg class="vines-bg" viewBox="-750 -500 1500 1000" preserveAspectRatio="xMidYMid slice">
    <g fill="none" stroke-linecap="round">
      {#each vines as v}
        <path d={v.d} class="vine-shadow" />
        <path d={v.d} pathLength="1" class="vine-line" style="--dur:{v.dur}; --delay:{v.delay}" />
      {/each}
    </g>
    {#each leaves as l, i}
      <g transform="translate({l.x} {l.y}) rotate({l.r}) scale({l.s})">
        <g class="bg-leaf" style="--delay:{l.d}s; --sway:{3.2 + (i % 4) * 0.4}s">
          <path d={leafPath} fill="#a77bff" />
          <path d="M2,0 L28,0" stroke="#3c1c70" stroke-width="1.5" stroke-linecap="round" />
        </g>
      </g>
    {/each}
  </svg>

  {#each cards as c, i}
    <div class="card" class:back={c.z === 0} style="--x:{c.x}; --y:{c.y}; --w:{c.w}px; --tilt:{c.tilt}deg; --d:{c.d}">
      <img src={c.src} alt="" width={c.w} height={Math.round(c.w * 0.625)} decoding="async" fetchpriority="low" />
      {#each sprouts as s, k}
        {#if (i + k) % 4 !== 3}
          <svg class="sprout {s.cls}" viewBox="-50 -50 100 100" style="--sd:{0.6 + ((i * 3 + k) % 7) * 0.18}s">
            <path d={s.d} pathLength="1" class="sprout-stem" />
            <g transform="translate({s.lx} {s.ly}) rotate({s.lr}) scale(0.55)">
              <g class="sprout-leaf"><path d={leafPath} fill="#a77bff" /></g>
            </g>
          </svg>
        {/if}
      {/each}
    </div>
  {/each}

  <div class="vignette"></div>
</div>

<style>
  .backdrop { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; contain: strict; }
  .vines-bg { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; min-width: 1400px; min-height: 900px; max-width: 2200px; max-height: 1400px; }
  .vine-shadow { stroke: rgba(255, 255, 255, 0.035); stroke-width: 2.2; }
  .vine-line {
    stroke: #e4e4ea;
    stroke-width: 2.2;
    opacity: 0.35;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: drawVine var(--dur) cubic-bezier(0.5, 0.1, 0.25, 1) var(--delay) forwards;
  }
  .bg-leaf {
    transform-box: fill-box;
    transform-origin: left center;
    transform: scale(0);
    opacity: 0.65;
    animation:
      growLeaf 0.75s cubic-bezier(0.3, 1.6, 0.5, 1) var(--delay) forwards,
      swayLeaf var(--sway) ease-in-out var(--delay) infinite;
  }
  .card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--w);
    transform: translate(calc(-50% + var(--x) * min(1vw, 16px)), calc(-50% + var(--y) * min(1vh, 10px))) rotate(var(--tilt));
    animation: floatCard 14s ease-in-out var(--d) infinite;
  }
  .card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #2c2c31;
    box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.9);
  }
  .card.back { opacity: 0.35; }
  .sprout { position: absolute; width: 56px; height: 56px; overflow: visible; }
  .sprout.tl { left: -28px; top: -28px; }
  .sprout.tr { right: -28px; top: -28px; }
  .sprout.bl { left: -28px; bottom: -28px; }
  .sprout.br { right: -28px; bottom: -28px; }
  .sprout-stem {
    fill: none;
    stroke: #e4e4ea;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: drawVine 1.2s ease-out var(--sd) forwards;
  }
  .sprout-leaf {
    transform-box: fill-box;
    transform-origin: left center;
    transform: scale(0);
    animation: growLeaf 0.6s cubic-bezier(0.3, 1.6, 0.5, 1) calc(var(--sd) + 0.9s) forwards;
  }
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 46%, rgba(17, 17, 19, 0.86) 0%, rgba(17, 17, 19, 0.38) 34%, rgba(17, 17, 19, 0.12) 65%, var(--bg) 95%);
  }
  .paused * { animation-play-state: paused !important; }
  @keyframes drawVine { to { stroke-dashoffset: 0; } }
  @keyframes growLeaf { from { transform: scale(0); } to { transform: scale(1); } }
  @keyframes swayLeaf { 0%, 100% { rotate: -6deg; } 50% { rotate: 6deg; } }
  @keyframes floatCard {
    0%, 100% { translate: 0 0; }
    25% { translate: 10px -14px; }
    50% { translate: -6px -22px; }
    75% { translate: -12px -8px; }
  }
  @media (max-width: 760px) {
    .card { width: calc(var(--w) * 0.58); }
    .sprout { width: 38px; height: 38px; }
    .sprout.tl { left: -19px; top: -19px; }
    .sprout.tr { right: -19px; top: -19px; }
    .sprout.bl { left: -19px; bottom: -19px; }
    .sprout.br { right: -19px; bottom: -19px; }
  }
</style>
