const fs = require('fs');
const f = 'c:\\Mes-Sites-Web\\Site_web_PROQUELEC-main\\server\\seed_premium_pages.js';
let c = fs.readFileSync(f, 'utf8');

// Cards: hover:-translate-y-1 anim-fade-up -> card-glow sr
c = c.replaceAll('hover:-translate-y-1 anim-fade-up', 'card-glow sr');

// Section headers
c = c.replaceAll('text-center mb-14 anim-fade-up', 'text-center mb-14 sr');
c = c.replaceAll('text-center mb-16 anim-fade-up', 'text-center mb-16 sr');

// Non-hero slide anims -> scroll-triggered
// We need to be careful: keep anim-fade-up in hero (class="anim-fade-up">)
// but change the ones in sections. The hero ones have class="anim-fade-up" directly
// The section ones have anim-slide-left/right which are unique to sections
c = c.replaceAll('anim-slide-left', 'sr-left');
c = c.replaceAll('anim-slide-right', 'sr-right');

// CTA sections
c = c.replaceAll('mx-auto anim-fade-up', 'mx-auto sr');

// Scale items (stats)
c = c.replaceAll('anim-scale-in', 'sr-scale');

// Add btn-shimmer to CTA buttons with hover:scale-105
c = c.replaceAll('hover:scale-105 hover:shadow-2xl"', 'hover:scale-105 hover:shadow-2xl btn-shimmer"');
c = c.replaceAll('hover:scale-105"', 'hover:scale-105 btn-shimmer"');

// Add card-icon class to card icons for bounce effect
c = c.replaceAll(
  'rounded-xl flex items-center justify-center text-2xl mb-5"',
  'rounded-xl flex items-center justify-center text-2xl mb-5 card-icon"'
);

// Add badge-pulse to hero badges
c = c.replaceAll(
  'rounded-full mb-6" style="border-color:',
  'rounded-full mb-6 badge-pulse" style="border-color:'
);

// Add counter data attributes to numeric stat values
// Pattern: stat values with just numbers
const counterPatterns = [
  { find: `style="color:#fbbf24">1995</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="1995">1995</div>` },
  { find: `style="color:#fbbf24">14</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="14">14</div>` },
  { find: `style="color:#fbbf24">500+</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="500" data-suffix="+">500+</div>` },
  { find: `style="color:#fbbf24">4</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="4">4</div>` },
  { find: `style="color:#60a5fa">14</div>`, replace: `style="color:#60a5fa" class="stat-val" data-count="14">14</div>` },
  { find: `style="color:#34d399">14</div>`, replace: `style="color:#34d399" class="stat-val" data-count="14">14</div>` },
  { find: `style="color:#a5b4fc">20+</div>`, replace: `style="color:#a5b4fc" class="stat-val" data-count="20" data-suffix="+">20+</div>` },
  { find: `style="color:#fb923c">500+</div>`, replace: `style="color:#fb923c" class="stat-val" data-count="500" data-suffix="+">500+</div>` },
  { find: `style="color:#fb923c">5</div>`, replace: `style="color:#fb923c" class="stat-val" data-count="5">5</div>` },
  { find: `style="color:#fb923c">14</div>`, replace: `style="color:#fb923c" class="stat-val" data-count="14">14</div>` },
  { find: `style="color:#38bdf8">50+</div>`, replace: `style="color:#38bdf8" class="stat-val" data-count="50" data-suffix="+">50+</div>` },
  { find: `style="color:#c084fc">20+</div>`, replace: `style="color:#c084fc" class="stat-val" data-count="20" data-suffix="+">20+</div>` },
  { find: `style="color:#c084fc">14</div>`, replace: `style="color:#c084fc" class="stat-val" data-count="14">14</div>` },
  { find: `style="color:#fbbf24">30+</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="30" data-suffix="+">30+</div>` },
  { find: `style="color:#fbbf24">8</div>`, replace: `style="color:#fbbf24" class="stat-val" data-count="8">8</div>` },
  { find: `style="color:#fb923c">500+</div><div class="text-sm`, replace: `style="color:#fb923c" class="stat-val" data-count="500" data-suffix="+">500+</div><div class="text-sm` },
  { find: `style="color:#fb923c">200+</div>`, replace: `style="color:#fb923c" class="stat-val" data-count="200" data-suffix="+">200+</div>` },
  { find: `style="color:#c084fc">500+</div>`, replace: `style="color:#c084fc" class="stat-val" data-count="500" data-suffix="+">500+</div>` },
  { find: `style="color:#c084fc">200+</div>`, replace: `style="color:#c084fc" class="stat-val" data-count="200" data-suffix="+">200+</div>` },
  { find: `style="color:#fbbf24">30+</div><div class="text-xs text-slate-400`, replace: `style="color:#fbbf24" class="stat-val" data-count="30" data-suffix="+">30+</div><div class="text-xs text-slate-400` },
  { find: `style="color:#fbbf24">4</div><div class="text-xs text-slate-400`, replace: `style="color:#fbbf24" class="stat-val" data-count="4">4</div><div class="text-xs text-slate-400` },
];

counterPatterns.forEach(p => {
  c = c.replaceAll(p.find, p.replace);
});

// Add gradient-bg class to CTA sections 
c = c.replaceAll(
  'style="background:linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%)"',
  'class="gradient-bg" style="background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 40%,#1e3a5f 100%)"'
);

// Add glow-line before CTA titles
c = c.replaceAll(
  '<h2 class="text-3xl md:text-4xl font-black text-white mb-4">Vous avez un projet',
  '<div class="glow-line w-24 mx-auto mb-8"></div><h2 class="text-3xl md:text-4xl font-black text-white mb-4">Vous avez un projet'
);

fs.writeFileSync(f, c, 'utf8');
console.log('✅ Animation classes patched successfully!');
