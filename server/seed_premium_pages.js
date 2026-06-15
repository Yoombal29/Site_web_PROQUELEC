/**
 * seed_premium_pages.js
 * Injecte les 9 pages draft avec un design premium dark/light modulaire
 * identique au style de la page /partenaires.
 * Usage: node server/seed_premium_pages.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── CSS animations communes (enrichies avec scroll-trigger, compteurs, glow, shimmer) ─
const ANIM_CSS = `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family:'Inter',sans-serif; box-sizing:border-box; }

/* ── Keyframes ── */
@keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideLeft { from{opacity:0;transform:translateX(-50px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
@keyframes rotateIn { from{opacity:0;transform:rotate(-8deg) scale(0.9)} to{opacity:1;transform:rotate(0) scale(1)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.08)} }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)} 50%{box-shadow:0 0 24px 8px rgba(59,130,246,.15)} }
@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes borderGlow { 0%,100%{border-color:rgba(59,130,246,.2)} 50%{border-color:rgba(59,130,246,.6)} }
@keyframes typing { from{width:0} to{width:100%} }
@keyframes blink { 0%,100%{border-color:transparent} 50%{border-color:#fbbf24} }
@keyframes slideDown { from{opacity:0;transform:translateY(-30px)} to{opacity:1;transform:translateY(0)} }
@keyframes ripple { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.5);opacity:0} }
@keyframes moveGrid { 0%{transform:translate(0,0)} 100%{transform:translate(32px,32px)} }
@keyframes countPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes iconBounce { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} 50%{transform:translateY(0)} 70%{transform:translateY(-3px)} }
@keyframes slideInUp3D { from{opacity:0;transform:perspective(800px) rotateX(8deg) translateY(40px)} to{opacity:1;transform:perspective(800px) rotateX(0) translateY(0)} }
@keyframes glowPulse { 0%,100%{filter:drop-shadow(0 0 4px rgba(251,191,36,.2))} 50%{filter:drop-shadow(0 0 16px rgba(251,191,36,.5))} }

/* ── Scroll-triggered: elements start hidden ── */
.sr{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
.sr.vis{opacity:1;transform:translateY(0)}
.sr-left{opacity:0;transform:translateX(-50px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
.sr-left.vis{opacity:1;transform:translateX(0)}
.sr-right{opacity:0;transform:translateX(50px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
.sr-right.vis{opacity:1;transform:translateX(0)}
.sr-scale{opacity:0;transform:scale(0.85);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.sr-scale.vis{opacity:1;transform:scale(1)}
.sr-3d{opacity:0;transform:perspective(800px) rotateX(8deg) translateY(40px);transition:opacity .8s ease-out,transform .8s ease-out}
.sr-3d.vis{opacity:1;transform:perspective(800px) rotateX(0) translateY(0)}

/* ── Page-load animations (hero only) ── */
.anim-fade-up{animation:fadeUp .9s cubic-bezier(.22,1,.36,1) both}
.anim-fade-in{animation:fadeIn .8s ease-out both}
.sr-left{animation:slideLeft .9s cubic-bezier(.22,1,.36,1) both}
.sr-right{animation:slideRight .9s cubic-bezier(.22,1,.36,1) both}
.sr-scale{animation:scaleIn .7s cubic-bezier(.22,1,.36,1) both}
.anim-slide-down{animation:slideDown .8s ease-out both}

/* ── Delays ── */
.d1{animation-delay:.1s;transition-delay:.1s}.d2{animation-delay:.2s;transition-delay:.2s}
.d3{animation-delay:.3s;transition-delay:.3s}.d4{animation-delay:.4s;transition-delay:.4s}
.d5{animation-delay:.5s;transition-delay:.5s}.d6{animation-delay:.6s;transition-delay:.6s}
.d7{animation-delay:.7s;transition-delay:.7s}.d8{animation-delay:.8s;transition-delay:.8s}

/* ── Floating hero decorations ── */
.hero-orb{position:absolute;border-radius:50%;pointer-events:none}
.hero-orb-1{animation:float 6s ease-in-out infinite}
.hero-orb-2{animation:floatSlow 8s ease-in-out infinite 1s}
.hero-orb-3{animation:float 7s ease-in-out infinite 2s}

/* ── Animated dot grid in hero ── */
.hero-dots{animation:moveGrid 20s linear infinite}

/* ── Shimmer on buttons ── */
.btn-shimmer{position:relative;overflow:hidden}
.btn-shimmer::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.3) 50%,transparent 60%);background-size:200% 100%;animation:shimmer 3s ease-in-out infinite}

/* ── Card hover glow ── */
.card-glow{transition:all .35s cubic-bezier(.22,1,.36,1)}
.card-glow:hover{box-shadow:0 8px 40px rgba(59,130,246,.15),0 0 0 1px rgba(59,130,246,.1);transform:translateY(-6px)}

/* ── Icon bounce on card hover ── */
.card-glow:hover .card-icon{animation:iconBounce .6s ease-out}

/* ── Stat counter glow ── */
.stat-val{transition:all .4s ease-out}
.stat-val.counted{animation:countPop .5s cubic-bezier(.22,1,.36,1) both}

/* ── Gradient text shimmer ── */
.text-shimmer{background:linear-gradient(90deg,currentColor 40%,rgba(251,191,36,.8) 50%,currentColor 60%);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s ease-in-out infinite}

/* ── Badge pulse ── */
.badge-pulse{animation:pulseGlow 2.5s ease-in-out infinite}

/* ── Glow accent line ── */
.glow-line{height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#3b82f6,transparent);animation:shimmer 3s ease-in-out infinite;background-size:200%}

/* ── Progress bar fill ── */
.progress-fill{transition:width 1.5s cubic-bezier(.22,1,.36,1)}
.progress-fill.active{width:var(--target-width)}

/* ── Parallax on scroll (via JS) ── */
.parallax-slow{transition:transform .1s linear}

/* ── CTA section gradient animation ── */
.gradient-bg{background-size:200% 200%;animation:gradientShift 8s ease infinite}
</style>

<!-- Scroll Reveal + Counter Script -->
<script>
(function(){
  // IntersectionObserver for scroll reveals
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('vis');
        // Counter animation
        if(e.target.hasAttribute('data-count')){
          animateCounter(e.target);
        }
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
  
  function init(){
    document.querySelectorAll('.sr,.sr-left,.sr-right,.sr-scale,.sr-3d,[data-count]').forEach(function(el){obs.observe(el)});
  }
  
  // Counter animation
  function animateCounter(el){
    var target = parseInt(el.getAttribute('data-count'),10);
    var suffix = el.getAttribute('data-suffix')||'';
    var prefix = el.getAttribute('data-prefix')||'';
    var duration = 2000;
    var start = 0;
    var startTime = null;
    function step(ts){
      if(!startTime)startTime=ts;
      var progress=Math.min((ts-startTime)/duration,1);
      var eased=1-Math.pow(1-progress,4); // easeOutQuart
      var current=Math.floor(eased*target);
      el.textContent=prefix+current.toLocaleString()+suffix;
      if(progress<1)requestAnimationFrame(step);
      else{el.textContent=prefix+target.toLocaleString()+suffix;el.classList.add('counted')}
    }
    requestAnimationFrame(step);
  }
  
  // Run on DOM ready & also on mutation (for dynamic page rendering)
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}
  else{setTimeout(init,100)}
  // Re-init on SPA navigation
  var mutObs=new MutationObserver(function(){setTimeout(init,200)});
  mutObs.observe(document.body,{childList:true,subtree:true});
})();
</script>`;

// ─── Utilitaire builder ──────────────────────────────────────────────────────
function makePage(title, nodes) {
  const nodeIds = nodes.map((_, i) => `n${i + 1}`);
  const craftNodes = {
    ROOT: {
      type: { resolvedName: 'ContainerBlock' },
      nodes: nodeIds,
      props: { padding: 0, maxWidth: '100%' },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: `Page: ${title}`,
      linkedNodes: {}
    }
  };
  nodes.forEach((n, i) => {
    craftNodes[`n${i + 1}`] = {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: { html: n.html, padding: 0, globalCss: '' },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: n.label || `Bloc ${i + 1}`,
      linkedNodes: {}
    };
  });
  return craftNodes;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTENU DES 9 PAGES — style premium dark+light modulaire
// ════════════════════════════════════════════════════════════════════════════

const PAGES = {

  // ── 1. Utilité Publique ──────────────────────────────────────────────────
  'utilite-publique': {
    title: 'Utilité Publique',
    meta: 'PROQUELEC, organisme reconnu d\'utilité publique pour la sécurité électrique au Sénégal.',
    nodes: [
      {
        label: 'Animations CSS',
        html: ANIM_CSS
      },
      {
        label: 'Hero Dark',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#3b82f6 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style="background:radial-gradient(circle,#f59e0b,transparent);transform:translate(30%,-30%)"></div>
  <div class="max-w-6xl mx-auto relative z-10">
    <div class="anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f59e0b;color:#fbbf24">⚡ Organisme d'Utilité Publique</span>
      <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">PROQUELEC au service<br><span style="color:#fbbf24">de toute la Nation</span></h1>
      <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Depuis 1995, PROQUELEC œuvre pour la sécurité électrique de tous les Sénégalais. Un mandat d'intérêt général, reconnu par l'État.</p>
      <div class="flex flex-wrap gap-4">
        <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300" style="background:#f59e0b;color:#0f172a">📋 Demander un diagnostic</a>
        <a href="/about" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.3);color:white">En savoir plus →</a>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats Bar',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(59,130,246,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="1995">1995</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Année de création</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions couvertes</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="500" data-suffix="+">500+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dossiers traités</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="4">4</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Publics servis</div></div>
  </div>
</section>`
      },
      {
        label: 'Nos Missions (Cards Light)',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1d4ed8">Notre mission</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Un rôle d'intérêt général pour tous</h2>
      <p class="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">PROQUELEC intervient comme tiers de confiance indépendant pour garantir la qualité et la sécurité des installations électriques au Sénégal.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">🏠</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Protection des ménages</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Conseils de prévention, diagnostics résidentiels et orientation vers des professionnels qualifiés pour sécuriser les foyers sénégalais.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#d1fae5">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">🏭</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Encadrement professionnel</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Certification des électriciens, formations techniques et délivrance de labels qualité pour structurer et valoriser la profession.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">🏛️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Appui aux institutions</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Tableaux de bord territoriaux, études de conformité et conseils techniques pour les ministères, collectivités et pouvoirs publics.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#f3e8ff">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🤝</div>
        <h3 class="text-lg font-bold text-slate-900 mb-3">Coopération internationale</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Partenariats avec FISUEL et des organismes étrangers pour aligner les pratiques sénégalaises aux standards internationaux de sécurité.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Cadre juridique (Split Dark)',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f59e0b;color:#fbbf24">Cadre juridique</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Reconnu par<br>l'État sénégalais</h2>
      <p class="text-slate-400 mb-4 leading-relaxed">PROQUELEC est une association à but non lucratif régie par la loi sénégalaise n° 68-08, reconnue d'utilité publique. Ce statut lui confère une légitimité nationale pour agir en faveur de la sécurité électrique.</p>
      <p class="text-slate-400 mb-8 leading-relaxed">L'association regroupe distributeurs, installateurs, bureaux d'études, contrôleurs techniques et représentants du secteur sous une gouvernance partagée.</p>
      <div class="p-5 rounded-xl border" style="border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.08)">
        <p class="text-sm font-medium" style="color:#fbbf24">🏅 NINEA : 0191403 089 — Siège : Immeuble Coumba Castel, 12 rue Saint-Michel, 4ᵉ étage, Dakar.</p>
      </div>
    </div>
    <div class="sr-right">
      <div class="p-8 rounded-2xl text-center" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
        <div class="text-6xl mb-6">⚖️</div>
        <div class="text-white font-black text-xl mb-2">Loi n° 68-08</div>
        <div class="text-slate-400 text-sm mb-6">Association à but non lucratif<br>reconnue d'utilité publique</div>
        <hr style="border-color:rgba(255,255,255,.1)" class="mb-6">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div><div class="text-2xl font-black" style="color:#fbbf24" class="stat-val" data-count="8">8</div><div class="text-xs text-slate-500 mt-1">Administrateurs</div></div>
          <div><div class="text-2xl font-black" style="color:#fbbf24" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-500 mt-1">Régions</div></div>
          <div><div class="text-2xl font-black" style="color:#fbbf24" class="stat-val" data-count="30" data-suffix="+">30+</div><div class="text-xs text-slate-500 mt-1">Années d'activité</div></div>
          <div><div class="text-2xl font-black" style="color:#fbbf24">FISUEL</div><div class="text-xs text-slate-500 mt-1">Partenaire</div></div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA Final',
        html: `<section class="py-20 px-4 text-center" class="gradient-bg" style="background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 40%,#1e3a5f 100%)">
  <div class="max-w-3xl mx-auto sr">
    <div class="glow-line w-24 mx-auto mb-8"></div><h2 class="text-3xl md:text-4xl font-black text-white mb-4">Vous avez un projet ou une question ?</h2>
    <p class="text-slate-400 mb-10 text-lg">Notre équipe vous oriente vers le bon service en moins de 24 heures.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl btn-shimmer" style="background:#f59e0b;color:#0f172a">📞 Contactez-nous</a>
  </div>
</section>`
      }
    ]
  },

  // ── 2. Espace Autorités ──────────────────────────────────────────────────
  'autorites': {
    title: 'Espace Autorités',
    meta: 'Outils, données et appui technique pour les autorités publiques, ministères et collectivités sénégalaises.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1a2e4a 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#3b82f6 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="max-w-6xl mx-auto relative z-10">
    <div class="anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#3b82f6;color:#60a5fa">🏛️ Espace Réservé aux Autorités</span>
      <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Pilotez la sécurité<br><span style="color:#60a5fa">électrique nationale</span></h1>
      <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Ministères, collectivités territoriales et institutions publiques : données, outils de planification et appuis techniques pour une gestion efficace du risque électrique.</p>
      <div class="flex flex-wrap gap-4">
        <a href="/observatoire" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#3b82f6;color:white">📊 Accéder à l'Observatoire</a>
        <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Nous contacter →</a>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(59,130,246,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#60a5fa" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions ciblées</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#60a5fa">ERP</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bâtiments suivis</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#60a5fa">24h</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Délai de réponse</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#60a5fa">100%</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Données fiables</div></div>
  </div>
</section>`
      },
      {
        label: 'Services Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1d4ed8">Nos services pour les institutions</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Des outils adaptés<br>à vos responsabilités</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">PROQUELEC accompagne les pouvoirs publics dans la définition, le suivi et l'évaluation des politiques de sécurité électrique.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">📊</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Observatoire National</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Tableaux de bord territoriaux, indicateurs de conformité et statistiques régionales en temps réel.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#d1fae5">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">📋</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Audits & Expertises</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Contrôles techniques des bâtiments publics (ERP, marchés, édifices administratifs) avec rapports officiels.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">📣</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Campagnes publiques</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Conception et déploiement de campagnes de sensibilisation à l'échelle nationale et régionale.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#ede9fe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🗺️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Planification territoriale</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Cartographie des risques, priorisation des zones d'intervention et recommandations de politique publique.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d5" style="border-color:#fee2e2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fff1f2">⚖️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Appui réglementaire</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Contribution à l'élaboration des textes normatifs et accompagnement dans l'application des règlements.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d6" style="border-color:#cffafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#ecfeff">🎓</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Formation des agents</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Programmes de formation spécifiques pour les agents des collectivités et personnels techniques institutionnels.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Processus Steps Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-4" style="border-color:#3b82f6;color:#60a5fa">Notre processus</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-4">Comment nous travaillons<br>avec les institutions</h2>
    </div>
    <div class="relative">
      <div class="absolute left-6 top-0 bottom-0 w-px" style="background:linear-gradient(to bottom,#3b82f6,#1e293b)"></div>
      <div class="space-y-8">
        <div class="flex gap-6 sr-right d1">
          <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg z-10" style="background:#3b82f6;color:white">1</div>
          <div class="pt-2 pb-6"><h4 class="font-bold text-white mb-2">Analyse du besoin</h4><p class="text-slate-400 text-sm leading-relaxed">Identification des priorités institutionnelles, du périmètre d'intervention et des objectifs mesurables.</p></div>
        </div>
        <div class="flex gap-6 sr-right d2">
          <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg z-10" style="background:#3b82f6;color:white">2</div>
          <div class="pt-2 pb-6"><h4 class="font-bold text-white mb-2">Déploiement technique</h4><p class="text-slate-400 text-sm leading-relaxed">Mise en œuvre des audits, formations ou campagnes avec des experts PROQUELEC certifiés.</p></div>
        </div>
        <div class="flex gap-6 sr-right d3">
          <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg z-10" style="background:#3b82f6;color:white">3</div>
          <div class="pt-2 pb-6"><h4 class="font-bold text-white mb-2">Rapport & recommandations</h4><p class="text-slate-400 text-sm leading-relaxed">Production de rapports officiels avec recommandations priorisées et plan d'action opérationnel.</p></div>
        </div>
        <div class="flex gap-6 sr-right d4">
          <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-lg z-10" style="background:#f59e0b;color:#0f172a">4</div>
          <div class="pt-2"><h4 class="font-bold text-white mb-2">Suivi & évaluation</h4><p class="text-slate-400 text-sm leading-relaxed">Accompagnement dans la mise en œuvre et mesure des impacts à travers l'Observatoire national.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#f8fafc">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Engager un partenariat institutionnel ?</h2>
    <p class="text-slate-500 mb-10 text-lg">Contactez notre équipe pour définir ensemble les modalités de collaboration.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl btn-shimmer" style="background:#1d4ed8;color:white">🤝 Initier le partenariat</a>
  </div>
</section>`
      }
    ]
  },

  // ── 3. Espace Ménages ────────────────────────────────────────────────────
  'menages': {
    title: 'Espace Ménages',
    meta: 'Conseils, diagnostics et ressources pour sécuriser votre installation électrique à domicile.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#164e3a 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#10b981 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#10b981;color:#34d399">🏠 Espace Ménages & Particuliers</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Protégez votre foyer<br><span style="color:#34d399">avant l'incident</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Les accidents électriques domestiques sont évitables. PROQUELEC vous guide pour identifier les risques, comprendre vos obligations et trouver un professionnel qualifié.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#10b981;color:white">🔍 Demander un diagnostic</a>
      <a href="/documents" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Guides pratiques →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(16,185,129,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#34d399">80%</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Incidents évitables</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#34d399">24h</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Délai d'orientation</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#34d399">Free</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Conseils de base</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#34d399" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions desservies</div></div>
  </div>
</section>`
      },
      {
        label: 'Signaux d\'alerte',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dcfce7;color:#15803d">Signaux d'alerte</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Reconnaître les risques chez soi</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Ces signes indiquent que votre installation électrique peut être dangereuse. N'attendez pas un incident pour agir.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#fee2e2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fff1f2">🌡️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Prises et interrupteurs chauds</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Une prise qui chauffe anormalement est un signe de surcharge ou d'un câblage défectueux. C'est un risque d'incendie immédiat.</p>
        <div class="mt-4 inline-block px-3 py-1 text-xs font-bold rounded-full" style="background:#fee2e2;color:#dc2626">⚠️ Risque élevé</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">⚡</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Disjonctions fréquentes</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Un disjoncteur qui saute régulièrement indique une installation inadaptée. Ne bridez jamais un disjoncteur.</p>
        <div class="mt-4 inline-block px-3 py-1 text-xs font-bold rounded-full" style="background:#fef3c7;color:#d97706">⚠️ À traiter rapidement</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">💡</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Lumières qui vacillent</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Des lumières instables signalent des connexions lâches ou une tension irrégulière. Problème à traiter rapidement.</p>
        <div class="mt-4 inline-block px-3 py-1 text-xs font-bold rounded-full" style="background:#dbeafe;color:#1d4ed8">ℹ️ À surveiller</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#cffafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#ecfeff">💧</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Humidité & électricité</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Toute installation exposée à l'eau doit respecter des normes d'étanchéité strictes. Salle de bain, cuisine, extérieur.</p>
        <div class="mt-4 inline-block px-3 py-1 text-xs font-bold rounded-full" style="background:#cffafe;color:#0e7490">⚠️ Danger mortel</div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Comment ça marche',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#10b981;color:#34d399">Demander un diagnostic</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Comment<br>ça se passe ?</h2>
      <p class="text-slate-400 mb-8 leading-relaxed">Un technicien PROQUELEC certifié se déplace à votre domicile pour inspecter votre installation électrique et vous remet un rapport détaillé.</p>
      <ul class="space-y-3">
        <li class="flex items-start gap-3 text-slate-300"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#10b981;color:white">✓</span><span class="text-sm">Inspection complète du tableau électrique</span></li>
        <li class="flex items-start gap-3 text-slate-300"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#10b981;color:white">✓</span><span class="text-sm">Vérification des prises, interrupteurs et câblages</span></li>
        <li class="flex items-start gap-3 text-slate-300"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#10b981;color:white">✓</span><span class="text-sm">Contrôle de la mise à la terre</span></li>
        <li class="flex items-start gap-3 text-slate-300"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#10b981;color:white">✓</span><span class="text-sm">Rapport écrit avec recommandations priorisées</span></li>
        <li class="flex items-start gap-3 text-slate-300"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#10b981;color:white">✓</span><span class="text-sm">Orientation vers des professionnels certifiés</span></li>
      </ul>
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm mt-8 transition-all" style="background:#10b981;color:white">📋 Prendre rendez-vous</a>
    </div>
    <div class="sr-right">
      <div class="p-8 rounded-2xl" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)">
        <div class="text-center mb-6"><div class="text-5xl">🔌</div><h3 class="text-white font-bold mt-3">Votre installation mérite une vérification si :</h3></div>
        <ul class="space-y-3">
          <li class="flex items-center gap-3 p-3 rounded-xl" style="background:rgba(16,185,129,.1)"><span style="color:#34d399">→</span><span class="text-slate-300 text-sm">Elle a plus de 15 ans</span></li>
          <li class="flex items-center gap-3 p-3 rounded-xl" style="background:rgba(16,185,129,.1)"><span style="color:#34d399">→</span><span class="text-slate-300 text-sm">Elle n'a jamais été contrôlée</span></li>
          <li class="flex items-center gap-3 p-3 rounded-xl" style="background:rgba(16,185,129,.1)"><span style="color:#34d399">→</span><span class="text-slate-300 text-sm">Vous constatez des anomalies</span></li>
          <li class="flex items-center gap-3 p-3 rounded-xl" style="background:rgba(16,185,129,.1)"><span style="color:#34d399">→</span><span class="text-slate-300 text-sm">Vous venez d'emménager</span></li>
          <li class="flex items-center gap-3 p-3 rounded-xl" style="background:rgba(16,185,129,.1)"><span style="color:#34d399">→</span><span class="text-slate-300 text-sm">Vous avez réalisé des travaux</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#f0fdf4">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Besoin d'un conseil ou d'un diagnostic ?</h2>
    <p class="text-slate-500 mb-10 text-lg">Notre équipe vous répond en moins de 24 heures et vous oriente vers le bon professionnel.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#15803d;color:white">📞 Nous contacter gratuitement</a>
  </div>
</section>`
      }
    ]
  },

  // ── 4. Espace Professionnels ─────────────────────────────────────────────
  'professionnels': {
    title: 'Espace Professionnels',
    meta: 'Certifications, formations et outils métiers pour les électriciens et entreprises du secteur électrique au Sénégal.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#818cf8 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#818cf8;color:#a5b4fc">⚡ Espace Professionnels de l'Électricité</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Développez votre activité<br><span style="color:#a5b4fc">avec PROQUELEC</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Électriciens, installateurs, bureaux d'études : accédez aux certifications, formations, outils métiers et ressources techniques pour exercer avec excellence.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/certifications" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#6366f1;color:white">🏅 Obtenir une certification</a>
      <a href="/formations" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Voir les formations →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(129,140,248,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-3xl font-black mb-1" style="color:#a5b4fc">QUALI-ELEC</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Label phare</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#a5b4fc">3 ans</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Validité certification</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#a5b4fc" class="stat-val" data-count="20" data-suffix="+">20+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Modules formation</div></div>
    <div class="sr-scale d4"><div class="text-3xl font-black mb-1" style="color:#a5b4fc">SN 01-015</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Norme de référence</div></div>
  </div>
</section>`
      },
      {
        label: 'Services Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#ede9fe;color:#6d28d9">Nos services professionnels</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Tout ce dont vous avez<br>besoin pour exercer</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">PROQUELEC est votre partenaire de référence pour la certification, la montée en compétences et l'accès aux marchés.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#ede9fe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🏅</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Certification QUALI-ELEC</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Le label de référence pour les électriciens. Valorisez votre savoir-faire et accédez aux marchés publics exigeants.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">🎓</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Formations continues</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Catalogue de formations : normes, sécurité, solaire, domotique, habilitations électriques.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#d1fae5">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">🔧</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Outils métiers</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Calculateurs, générateurs de schémas, simulateurs de conformité et aide à la rédaction de devis.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">📚</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Documentation technique</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Normes SN 01-015, guides pratiques, mémentos de sécurité et fiches techniques téléchargeables.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d5" style="border-color:#cffafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#ecfeff">🤝</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Réseau PROQUELEC</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Intégrez un réseau de professionnels certifiés et bénéficiez d'une visibilité sur l'annuaire officiel.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d6" style="border-color:#fee2e2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fff1f2">📣</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Veille réglementaire</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Restez informé des évolutions normatives, nouvelles obligations légales et actualités du secteur.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Processus Certification Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-4" style="border-color:#818cf8;color:#a5b4fc">Parcours de certification</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-4">Obtenir le label<br>QUALI-ELEC</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 rounded-2xl sr-scale d1" style="background:rgba(255,255,255,.05);border:1px solid rgba(129,140,248,.3)">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-base mb-4" style="background:#6366f1;color:white">1</div>
        <h4 class="font-bold text-white mb-2">Pré-qualification</h4>
        <p class="text-slate-400 text-sm leading-relaxed">Agrément professionnel, assurance RC Pro, références de chantiers documentées.</p>
      </div>
      <div class="p-6 rounded-2xl sr-scale d2" style="background:rgba(255,255,255,.05);border:1px solid rgba(129,140,248,.3)">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-base mb-4" style="background:#6366f1;color:white">2</div>
        <h4 class="font-bold text-white mb-2">Audit technique</h4>
        <p class="text-slate-400 text-sm leading-relaxed">Contrôle documentaire et inspection terrain par un auditeur PROQUELEC certifié.</p>
      </div>
      <div class="p-6 rounded-2xl sr-scale d3" style="background:rgba(255,255,255,.05);border:1px solid rgba(129,140,248,.3)">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-base mb-4" style="background:#6366f1;color:white">3</div>
        <h4 class="font-bold text-white mb-2">Commission d'évaluation</h4>
        <p class="text-slate-400 text-sm leading-relaxed">Analyse indépendante et décision motivée sous 15 jours ouvrés.</p>
      </div>
      <div class="p-6 rounded-2xl sr-scale d4" style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.4)">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-base mb-4" style="background:#f59e0b;color:#0f172a">4</div>
        <h4 class="font-bold text-white mb-2">Délivrance du label</h4>
        <p class="text-slate-400 text-sm leading-relaxed">Certificat QUALI-ELEC valable 3 ans avec inscription au registre officiel.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-white mb-4">Prêt à vous certifier ?</h2>
    <p class="text-slate-400 mb-10 text-lg">Déposez votre dossier ou contactez notre équipe pour un accompagnement personnalisé.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#f59e0b;color:#0f172a">🏅 Déposer mon dossier</a>
  </div>
</section>`
      }
    ]
  },

  // ── 5. Nos Actions ───────────────────────────────────────────────────────
  'activities': {
    title: 'Nos Actions',
    meta: 'Les actions de terrain de PROQUELEC : sensibilisation, diagnostics, mise en conformité et sécurisation des marchés au Sénégal.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1c1917 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#f97316 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f97316;color:#fb923c">🎯 Actions de Terrain</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">PROQUELEC agit<br><span style="color:#fb923c">partout au Sénégal</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">De Dakar à Ziguinchor, nos équipes interviennent pour diagnostiquer, former, certifier et protéger. Découvrez l'ensemble de nos programmes d'action.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/projets" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#f97316;color:white">🗂️ Voir nos réalisations</a>
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Rejoindre un programme →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(249,115,22,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#fb923c" class="stat-val" data-count="5">5</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Axes d'intervention</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#fb923c" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions couvertes</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#fb923c" class="stat-val" data-count="500" data-suffix="+">500+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dossiers traités</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#fb923c">1995</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Depuis</div></div>
  </div>
</section>`
      },
      {
        label: 'Programmes Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#ffedd5;color:#c2410c">Nos programmes</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Cinq axes d'intervention<br>prioritaires</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Chaque programme répond à un besoin identifié pour améliorer durablement la sécurité électrique au Sénégal.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#ffedd5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#fff7ed">📣</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Sensibilisation nationale</h3><p class="text-sm text-slate-600 leading-relaxed">Campagnes dans les quartiers, marchés, écoles et médias nationaux. Plus de 100 000 personnes touchées chaque année.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#dbeafe">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#eff6ff">🔍</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Diagnostics électriques</h3><p class="text-sm text-slate-600 leading-relaxed">Inspections terrain des installations résidentielles, commerciales et industrielles avec rapports détaillés.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#d1fae5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#f0fdf4">✅</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Mise en conformité</h3><p class="text-sm text-slate-600 leading-relaxed">Accompagnement des propriétaires pour la mise aux normes. Coordination avec des électriciens certifiés.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#fef3c7">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#fffbeb">🏪</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Sécurisation des marchés</h3><p class="text-sm text-slate-600 leading-relaxed">Programme spécifique pour les marchés populaires et zones commerciales avec mise aux normes complète.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d5" style="border-color:#ede9fe">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#faf5ff">🏘️</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Collectivités locales</h3><p class="text-sm text-slate-600 leading-relaxed">Appui aux communes dans la sécurisation de l'éclairage public et des équipements collectifs.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d6" style="border-color:#cffafe">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style="background:#ecfeff">🔬</div>
          <div><h3 class="text-lg font-bold text-slate-900 mb-2">Études & expertises</h3><p class="text-sm text-slate-600 leading-relaxed">Études techniques pour maîtres d'ouvrage, bureaux d'études et donneurs d'ordres publics et privés.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Impact Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f97316;color:#fb923c">Impact mesurable</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Des résultats concrets<br>sur le terrain</h2>
      <p class="text-slate-400 mb-8 leading-relaxed">Chaque action PROQUELEC est suivie d'indicateurs de performance permettant de mesurer l'impact réel sur la sécurité des populations.</p>
      <ul class="space-y-3">
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f97316;color:white">✓</span><span class="text-slate-300 text-sm">Taux de conformité avant/après intervention mesuré</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f97316;color:white">✓</span><span class="text-slate-300 text-sm">Incidents signalés en baisse dans les zones traitées</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f97316;color:white">✓</span><span class="text-slate-300 text-sm">Rapports publics annuels sur l'état de la sécurité électrique</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f97316;color:white">✓</span><span class="text-slate-300 text-sm">Données intégrées dans l'Observatoire national</span></li>
      </ul>
    </div>
    <div class="sr-right">
      <div class="grid grid-cols-2 gap-4">
        <div class="p-6 rounded-2xl text-center" style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)"><div class="text-3xl font-black mb-1" style="color:#fb923c" class="stat-val" data-count="500" data-suffix="+">500+</div><div class="text-xs text-slate-400 uppercase tracking-wider">Diagnostics réalisés</div></div>
        <div class="p-6 rounded-2xl text-center" style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)"><div class="text-3xl font-black mb-1" style="color:#fb923c" class="stat-val" data-count="200" data-suffix="+">200+</div><div class="text-xs text-slate-400 uppercase tracking-wider">Mises en conformité</div></div>
        <div class="p-6 rounded-2xl text-center" style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)"><div class="text-3xl font-black mb-1" style="color:#fb923c">100K+</div><div class="text-xs text-slate-400 uppercase tracking-wider">Personnes sensibilisées</div></div>
        <div class="p-6 rounded-2xl text-center" style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)"><div class="text-3xl font-black mb-1" style="color:#fb923c">30 ans</div><div class="text-xs text-slate-400 uppercase tracking-wider">D'expérience</div></div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#fff7ed">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Vous souhaitez rejoindre un programme ?</h2>
    <p class="text-slate-500 mb-10 text-lg">Que vous soyez particulier, professionnel ou institution, il existe un programme adapté à votre situation.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#c2410c;color:white">📞 Contacter nos équipes</a>
  </div>
</section>`
      }
    ]
  },

  // ── 6. Normes & Ressources ───────────────────────────────────────────────
  'normes-ressources': {
    title: 'Normes & Ressources',
    meta: 'Normes sénégalaises SN 01-015, guides pratiques, mémentos et ressources documentaires PROQUELEC.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#0c4a6e 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#0ea5e9 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#0ea5e9;color:#38bdf8">📚 Centre de Ressources Normatives</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">La référence technique<br><span style="color:#38bdf8">électrique au Sénégal</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Normes nationales, guides pratiques, mémentos de sécurité : toute la documentation pour exercer en conformité et protéger efficacement.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/documents" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#0ea5e9;color:white">📥 Accéder aux documents</a>
      <a href="/outils" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Outils de calcul →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(14,165,233,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-3xl font-black mb-1" style="color:#38bdf8">SN 01-015</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Norme de référence</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#38bdf8" class="stat-val" data-count="50" data-suffix="+">50+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Documents disponibles</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#38bdf8">CEI</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Standards internationaux</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#38bdf8">Free</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accès de base</div></div>
  </div>
</section>`
      },
      {
        label: 'Ressources Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#e0f2fe;color:#0369a1">Nos ressources</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Un centre documentaire complet</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">PROQUELEC centralise les ressources normatives et pédagogiques pour tous les acteurs de l'électricité au Sénégal.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">⚖️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Normes nationales</h3>
        <p class="text-sm text-slate-600 leading-relaxed">La norme sénégalaise SN 01-015 et décrets d'application. Textes officiels et arrêtés ministériels.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e0f2fe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0f9ff">📘</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Guides pratiques</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Guides méthodologiques pour la réalisation, le contrôle et la réception des installations électriques.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#d1fae5">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">🗒️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Mémentos de sécurité</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Fiches synthétiques sur les points essentiels de sécurité, erreurs courantes et bonnes pratiques.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">🌍</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Standards internationaux</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Référentiels CEI et normes africaines applicables au contexte sénégalais.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d5" style="border-color:#ede9fe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🏠</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Conseils ménages</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Ressources pédagogiques : vérifier son installation, quand appeler un professionnel, les gestes qui sauvent.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d6" style="border-color:#cffafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#ecfeff">❓</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">FAQ technique</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Réponses aux questions sur les normes, obligations légales, délais de conformité et recours disponibles.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'SN 01-015 Détail Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#0c4a6e 50%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left p-8 rounded-2xl text-center" style="background:rgba(255,255,255,.05);border:1px solid rgba(14,165,233,.3)">
      <div class="text-6xl mb-4">📐</div>
      <div class="text-white font-black text-2xl mb-2">SN 01-015</div>
      <div class="text-slate-400 text-sm mb-6">Norme sénégalaise pour les<br>installations électriques basse tension</div>
      <hr style="border-color:rgba(255,255,255,.1)" class="mb-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div><div class="font-black" style="color:#38bdf8">Habitat</div><div class="text-xs text-slate-500 mt-1">Résidentiel</div></div>
        <div><div class="font-black" style="color:#38bdf8">Industrie</div><div class="text-xs text-slate-500 mt-1">Tertiaire</div></div>
        <div><div class="font-black" style="color:#38bdf8">ERP</div><div class="text-xs text-slate-500 mt-1">Public</div></div>
      </div>
    </div>
    <div class="sr-right">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#0ea5e9;color:#38bdf8">La norme de référence</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Comprendre<br>la SN 01-015</h2>
      <p class="text-slate-400 mb-4 leading-relaxed">La norme sénégalaise SN 01-015 définit les règles de conception, de réalisation et de vérification des installations électriques. Elle est obligatoire pour tous les bâtiments neufs et les rénovations.</p>
      <ul class="space-y-3">
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#0ea5e9;color:white">✓</span><span class="text-slate-300 text-sm">Applicable à tous les types de bâtiments</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#0ea5e9;color:white">✓</span><span class="text-slate-300 text-sm">Obligatoire depuis le décret d'application</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#0ea5e9;color:white">✓</span><span class="text-slate-300 text-sm">Alignée sur les standards CEI internationaux</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#0ea5e9;color:white">✓</span><span class="text-slate-300 text-sm">Régulièrement mise à jour par le comité technique</span></li>
      </ul>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#f0f9ff">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Accédez à toute la bibliothèque documentaire</h2>
    <p class="text-slate-500 mb-10 text-lg">Téléchargez gratuitement nos guides ou abonnez-vous pour accéder aux normes complètes.</p>
    <a href="/documents" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#0369a1;color:white">📥 Consulter les documents</a>
  </div>
</section>`
      }
    ]
  },

  // ── 7. Projets & Réalisations ────────────────────────────────────────────
  'projets-realisations': {
    title: 'Projets & Réalisations',
    meta: 'Les projets et réalisations de PROQUELEC : sécurisation des marchés, partenariat SENELEC, études territoriales.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1a1a2e 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#a855f7 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#a855f7;color:#c084fc">🏗️ Projets & Réalisations</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Des actions concrètes,<br><span style="color:#c084fc">des résultats mesurables</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">De la sécurisation des marchés de Dakar au partenariat avec SENELEC, PROQUELEC transforme les engagements en résultats tangibles.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#a855f7;color:white">🤝 Proposer un projet</a>
      <a href="/nos-actions" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Nos programmes →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(168,85,247,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#c084fc" class="stat-val" data-count="20" data-suffix="+">20+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projets réalisés</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#c084fc" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions couvertes</div></div>
    <div class="sr-scale d3"><div class="text-3xl font-black mb-1" style="color:#c084fc">SENELEC</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Partenaire stratégique</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#c084fc">1995</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Depuis</div></div>
  </div>
</section>`
      },
      {
        label: 'Réalisations Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#f3e8ff;color:#7e22ce">Nos réalisations phares</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Des projets qui changent la donne</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Chaque projet PROQUELEC contribue à bâtir un Sénégal plus sûr sur le plan électrique.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#ede9fe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🏪</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Sécurisation marchés populaires</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Mise aux normes des grands marchés de Dakar et des capitales régionales. 200+ comptoirs commerciaux traités.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#7e22ce">✓ Réalisé</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#dbeafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">⚡</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Partenariat SENELEC</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Collaboration stratégique pour améliorer la qualité des branchements et réduire les risques réseau-installation.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#1d4ed8">⟳ En cours</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#d1fae5">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">🏛️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Études pour institutions</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Audits pour des administrations, organisations internationales et grandes entreprises.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#15803d">✓ Réalisé</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#fef3c7">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">🏘️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Sécurisation ERP</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Diagnostic et conformité des Établissements Recevant du Public : écoles, hôpitaux, centres commerciaux.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#d97706">⟳ En cours</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d5" style="border-color:#fee2e2">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fff1f2">📣</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Campagnes de prévention</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Campagnes nationales radio, TV et communes avec kits pédagogiques distribués aux ménages.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#dc2626">100K+ personnes</div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d6" style="border-color:#cffafe">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#ecfeff">🌍</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Coopération internationale</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Projets avec FISUEL pour aligner les pratiques sénégalaises aux meilleures normes mondiales.</p>
        <div class="mt-4 flex items-center gap-2 text-xs font-bold" style="color:#0e7490">✓ Réalisé</div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Impact Chiffres Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto text-center">
    <div class="mb-14 anim-fade-up">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-4" style="border-color:#a855f7;color:#c084fc">Impact terrain</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-4">30 ans d'impact mesurable</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="p-8 rounded-2xl sr-scale d1" style="background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3)"><div class="text-4xl font-black mb-2" style="color:#c084fc" class="stat-val" data-count="500" data-suffix="+">500+</div><div class="text-sm text-slate-400 font-semibold">Diagnostics<br>réalisés</div></div>
      <div class="p-8 rounded-2xl sr-scale d2" style="background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3)"><div class="text-4xl font-black mb-2" style="color:#c084fc" class="stat-val" data-count="200" data-suffix="+">200+</div><div class="text-sm text-slate-400 font-semibold">Mises en<br>conformité</div></div>
      <div class="p-8 rounded-2xl sr-scale d3" style="background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3)"><div class="text-4xl font-black mb-2" style="color:#c084fc">100K+</div><div class="text-sm text-slate-400 font-semibold">Personnes<br>sensibilisées</div></div>
      <div class="p-8 rounded-2xl sr-scale d4" style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3)"><div class="text-4xl font-black mb-2" style="color:#fbbf24">96%</div><div class="text-sm text-slate-400 font-semibold">Taux de satisfaction<br>bénéficiaires</div></div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#faf5ff">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Un projet à nous soumettre ?</h2>
    <p class="text-slate-500 mb-10 text-lg">Que ce soit un audit, une campagne ou un partenariat, nous étudions toutes les propositions d'utilité publique.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#7e22ce;color:white">🗂️ Soumettre un projet</a>
  </div>
</section>`
      }
    ]
  },

  // ── 8. Partenaires (slug: partenaires-liste) ─────────────────────────────
  'partenaires': {
    title: 'Partenaires',
    meta: 'Partenaires institutionnels, techniques, financiers et privés de PROQUELEC pour la sécurité électrique au Sénégal.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e293b 100%)">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(#f59e0b 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f59e0b;color:#fbbf24">🤝 Réseau de Partenaires</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Un réseau engagé<br><span style="color:#fbbf24">pour la sécurité</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">PROQUELEC s'appuie sur un réseau solide de partenaires institutionnels, techniques, financiers et privés partageant la même ambition : un Sénégal électrique plus sûr.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all" style="background:#f59e0b;color:#0f172a">🤝 Devenir partenaire</a>
      <a href="/espace-partenaires" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border" style="border-color:rgba(255,255,255,.3);color:white">Espace partenaires →</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(245,158,11,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="4">4</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Catégories</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="30" data-suffix="+">30+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Organisations partenaires</div></div>
    <div class="sr-scale d3"><div class="text-3xl font-black mb-1" style="color:#fbbf24">FISUEL</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Partenaire international</div></div>
    <div class="sr-scale d4"><div class="text-3xl font-black mb-1" style="color:#fbbf24">SENELEC</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Partenaire stratégique</div></div>
  </div>
</section>`
      },
      {
        label: 'Catégories Cards',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#fef3c7;color:#92400e">Nos partenaires</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Quatre catégories<br>de partenariats</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Notre réseau couvre tous les segments nécessaires à une action efficace et durable en faveur de la sécurité électrique.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#dbeafe">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style="background:#eff6ff">🏛️</div>
          <div><h3 class="text-xl font-bold text-slate-900 mb-3">Partenaires institutionnels</h3><p class="text-sm text-slate-600 leading-relaxed">Ministères de l'Énergie, de l'Habitat et du Commerce, agences gouvernementales, collectivités territoriales et organisations internationales comme FISUEL.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#d1fae5">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style="background:#f0fdf4">🔧</div>
          <div><h3 class="text-xl font-bold text-slate-900 mb-3">Partenaires techniques</h3><p class="text-sm text-slate-600 leading-relaxed">SENELEC, bureaux d'études, fabricants d'équipements électriques, laboratoires d'essais et organismes de normalisation.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#fef3c7">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style="background:#fffbeb">💰</div>
          <div><h3 class="text-xl font-bold text-slate-900 mb-3">Partenaires financiers</h3><p class="text-sm text-slate-600 leading-relaxed">Banques de développement, fonds d'investissement et bailleurs internationaux qui soutiennent nos programmes de long terme.</p></div>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d4" style="border-color:#ede9fe">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" style="background:#faf5ff">🏢</div>
          <div><h3 class="text-xl font-bold text-slate-900 mb-3">Partenaires privés</h3><p class="text-sm text-slate-600 leading-relaxed">Entreprises de BTP, distributeurs de matériel électrique, compagnies d'assurance et grandes entreprises qui intègrent nos standards.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Devenir Partenaire Dark',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#f59e0b;color:#fbbf24">Devenir partenaire</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Rejoignez<br>notre réseau</h2>
      <p class="text-slate-400 mb-8 leading-relaxed">Vous partagez nos valeurs de sécurité, de qualité et de service public ? Devenez partenaire PROQUELEC et contribuez à sécuriser les installations électriques.</p>
      <ul class="space-y-3">
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f59e0b;color:#0f172a">✓</span><span class="text-slate-300 text-sm">Visibilité sur nos supports de communication</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f59e0b;color:#0f172a">✓</span><span class="text-slate-300 text-sm">Accès à notre réseau de professionnels certifiés</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f59e0b;color:#0f172a">✓</span><span class="text-slate-300 text-sm">Participation aux événements PROQUELEC</span></li>
        <li class="flex items-start gap-3"><span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style="background:#f59e0b;color:#0f172a">✓</span><span class="text-slate-300 text-sm">Co-construction de programmes d'action communs</span></li>
      </ul>
      <a href="/contact" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm mt-8 transition-all" style="background:#f59e0b;color:#0f172a">📞 Nous contacter</a>
    </div>
    <div class="sr-right">
      <div class="p-8 rounded-2xl" style="background:rgba(255,255,255,.05);border:1px solid rgba(245,158,11,.3)">
        <h4 class="text-white font-bold text-lg mb-6">Partenaires notables</h4>
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background:rgba(255,255,255,.05)"><div class="w-3 h-3 rounded-full" style="background:#3b82f6"></div><div><div class="text-white font-semibold text-sm">SENELEC</div><div class="text-slate-500 text-xs">Partenaire technique stratégique</div></div></div>
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background:rgba(255,255,255,.05)"><div class="w-3 h-3 rounded-full" style="background:#f59e0b"></div><div><div class="text-white font-semibold text-sm">FISUEL</div><div class="text-slate-500 text-xs">Partenaire international</div></div></div>
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background:rgba(255,255,255,.05)"><div class="w-3 h-3 rounded-full" style="background:#10b981"></div><div><div class="text-white font-semibold text-sm">Ministère de l'Énergie</div><div class="text-slate-500 text-xs">Partenaire institutionnel</div></div></div>
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background:rgba(255,255,255,.05)"><div class="w-3 h-3 rounded-full" style="background:#a855f7"></div><div><div class="text-white font-semibold text-sm">+ 27 organisations partenaires</div><div class="text-slate-500 text-xs">Réseau actif et engagé</div></div></div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#fffbeb">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Intéressé par un partenariat ?</h2>
    <p class="text-slate-500 mb-10 text-lg">Contactez notre responsable des partenariats pour étudier les possibilités de collaboration.</p>
    <a href="/contact" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#92400e;color:white">🤝 Initier un partenariat</a>
  </div>
</section>`
      }
    ]
  },

  // ── 9. Mentions Légales ──────────────────────────────────────────────────
  'legal': {
    title: 'Mentions Légales',
    meta: 'Mentions légales et conditions d\'utilisation du site PROQUELEC Sénégal.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero Compact',
        html: `<section class="py-20 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%)">
  <div class="max-w-4xl mx-auto sr">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#94a3b8;color:#cbd5e1">⚖️ Informations Légales</span>
    <h1 class="text-4xl md:text-5xl font-black text-white mb-4">Mentions Légales</h1>
    <p class="text-slate-400 text-base">Informations légales et réglementaires relatives au site web de PROQUELEC SÉNÉGAL.</p>
  </div>
</section>`
      },
      {
        label: 'Contenu Légal',
        html: `<section class="py-16 px-4" style="background:#f8fafc">
  <div class="max-w-3xl mx-auto space-y-8">
    <div class="p-5 rounded-xl border anim-fade-up" style="background:#eff6ff;border-color:#bfdbfe">
      <p class="text-sm font-medium" style="color:#1d4ed8">📅 Dernière mise à jour : Juin 2026 — Ces mentions légales sont susceptibles d'être modifiées. Nous vous invitons à les consulter régulièrement.</p>
    </div>
    <div class="bg-white rounded-2xl p-8 border anim-fade-up d1" style="border-color:#e2e8f0">
      <span class="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1d4ed8">Éditeur du site</span>
      <h2 class="text-xl font-black text-slate-900 mb-5">Informations sur l'éditeur</h2>
      <ul class="space-y-3">
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Raison sociale :</span>PROQUELEC — Promotion de la Qualité des Installations Électriques</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Forme juridique :</span>Association à but non lucratif — Loi sénégalaise n° 68-08</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">NINEA :</span>0191403 089</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Siège social :</span>Immeuble Coumba Castel, 12 rue Saint-Michel, 4ᵉ étage, Dakar, Sénégal</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Téléphone :</span>+221 33 848 68 55</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Email :</span>proquelec@proquelec.sn</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Directeur de publication :</span>Le Président de PROQUELEC</li>
      </ul>
    </div>
    <div class="bg-white rounded-2xl p-8 border anim-fade-up d2" style="border-color:#e2e8f0">
      <span class="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style="background:#d1fae5;color:#065f46">Hébergement</span>
      <h2 class="text-xl font-black text-slate-900 mb-5">Hébergeur du site</h2>
      <ul class="space-y-3">
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Hébergeur :</span>Serveur privé virtuel (VPS) dédié</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Localisation :</span>Europe / Afrique</li>
        <li class="flex items-start gap-3 text-sm text-slate-600"><span class="font-bold text-slate-900 min-w-40">Infrastructure :</span>Architecture sécurisée avec sauvegarde quotidienne</li>
      </ul>
    </div>
    <div class="bg-white rounded-2xl p-8 border anim-fade-up d3" style="border-color:#e2e8f0">
      <span class="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style="background:#fef3c7;color:#92400e">Propriété intellectuelle</span>
      <h2 class="text-xl font-black text-slate-900 mb-5">Droits & contenus</h2>
      <p class="text-sm text-slate-600 leading-relaxed mb-4">L'ensemble des contenus présents sur ce site (textes, images, logos, documents) sont la propriété exclusive de PROQUELEC ou de ses partenaires et sont protégés par la législation relative à la propriété intellectuelle.</p>
      <p class="text-sm text-slate-600 leading-relaxed">Toute reproduction, représentation ou modification sans autorisation écrite préalable de PROQUELEC est interdite, sauf pour un usage strictement personnel et non commercial.</p>
    </div>
    <div class="bg-white rounded-2xl p-8 border anim-fade-up d4" style="border-color:#e2e8f0">
      <span class="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-4" style="background:#ede9fe;color:#5b21b6">Protection des données</span>
      <h2 class="text-xl font-black text-slate-900 mb-5">Données personnelles</h2>
      <p class="text-sm text-slate-600 leading-relaxed mb-4">PROQUELEC s'engage à protéger la confidentialité des informations personnelles. Les données collectées via les formulaires ne sont jamais cédées à des tiers.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div class="flex items-center gap-2 text-sm text-slate-600"><span style="color:#7c3aed">✓</span>Droit d'accès et de rectification</div>
        <div class="flex items-center gap-2 text-sm text-slate-600"><span style="color:#7c3aed">✓</span>Aucune vente à des tiers</div>
        <div class="flex items-center gap-2 text-sm text-slate-600"><span style="color:#7c3aed">✓</span>Conservation limitée dans le temps</div>
        <div class="flex items-center gap-2 text-sm text-slate-600"><span style="color:#7c3aed">✓</span>Contact DPO disponible</div>
      </div>
    </div>
    <div class="p-6 rounded-xl text-center anim-fade-up d5" style="background:#0f172a">
      <p class="text-slate-400 text-sm">Pour toute question relative à ces mentions légales, contactez-nous à :<br><a href="mailto:proquelec@proquelec.sn" class="font-bold" style="color:#fbbf24">proquelec@proquelec.sn</a></p>
    </div>
  </div>
</section>`
      }
    ]
  }
,

  // ── 10. portal/marches (Suivi des Marchés) ──────────────────────────────────
  'portal/marches': {
    title: 'Suivi des Marchés',
    meta: 'Accédez au suivi des marchés publics et opportunités de sécurisation électrique de PROQUELEC.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0b1329 0%,#1e3a5f 60%,#0f172a 100%)">
  <div class="absolute inset-0 opacity-10 hero-dots" style="background-image:radial-gradient(#fbbf24 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 hero-orb-1" style="background:radial-gradient(circle,#fbbf24,transparent);transform:translate(30%,-30%)"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#fbbf24;color:#fbbf24">📈 Observatoire & Marchés</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Suivi des Marchés &<br><span style="color:#fbbf24">Opportunités Électriques</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Suivez en temps réel les appels d'offres, les projets de sécurisation des marchés populaires et les opportunités de chantiers pour les professionnels agréés.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/contact?subject=marches" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 btn-shimmer" style="background:#fbbf24;color:#0f172a">💼 Soumissionner à un projet</a>
      <a href="#tenders" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.3);color:white">Voir les projets en cours ↓</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Stats',
        html: `<section class="py-10 px-4" style="background:#0f172a;border-top:1px solid rgba(251,191,36,.2)">
  <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div class="sr-scale d1"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="42">42</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Marchés audités</div></div>
    <div class="sr-scale d2"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="1500" data-suffix="+">1,500+</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Comptoirs sécurisés</div></div>
    <div class="sr-scale d3"><div class="text-4xl font-black mb-1" style="color:#fbbf24">98%</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Taux de conformité</div></div>
    <div class="sr-scale d4"><div class="text-4xl font-black mb-1" style="color:#fbbf24" class="stat-val" data-count="14">14</div><div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Régions actives</div></div>
  </div>
</section>`
      },
      {
        label: 'Appels doffres et Marches',
        html: `<section id="tenders" class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#fef3c7;color:#d97706">Dossiers en cours</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Projets de Sécurisation & Opportunités</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Consultez les chantiers de mise en conformité électrique gérés ou supervisés par PROQUELEC.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0">
        <div class="flex items-center justify-between mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#d1fae5;color:#065f46">Ouvert</span>
          <span class="text-xs text-slate-400">Dakar</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Sécurisation du Marché Sandaga</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Mise aux normes complète des tableaux généraux et colonnes montantes. Réservé aux électriciens certifiés QUALI-ELEC Classe A.</p>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs font-bold" style="color:#1d4ed8">Budget: Principal</span>
          <a href="/contact?subject=sandaga" class="text-xs font-bold hover:underline" style="color:#fbbf24">Postuler →</a>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0">
        <div class="flex items-center justify-between mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fef3c7;color:#92400e">En cours d'audit</span>
          <span class="text-xs text-slate-400">Thiès</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Audit ERP Complexe Administratif</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Diagnostic complet de sécurité des installations de climatisation et de puissance pour le compte de l'État.</p>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs font-bold" style="color:#15803d">Statut: Analyse</span>
          <span class="text-xs text-slate-400 font-bold">Privé</span>
        </div>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0">
        <div class="flex items-center justify-between mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fee2e2;color:#991b1b">Fermé</span>
          <span class="text-xs text-slate-400">Saint-Louis</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Rénovation Électrique Marché Sor</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Remplacement des branchements forains par des armoires étanches sécurisées. Phase 1 terminée.</p>
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs font-bold" style="color:#b91c1c">Terminé</span>
          <span class="text-xs text-slate-500 font-bold">120 comptoirs</span>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Processus de Soumission',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0b1329 0%,#0f172a 100%)">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-4" style="border-color:#fbbf24;color:#fbbf24">Comment participer</span>
      <h2 class="text-3xl md:text-4xl font-black text-white mb-4">Étapes de Candidature & Accès</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="p-6 rounded-xl border sr-scale d1" style="border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02)">
        <div class="text-3xl font-black mb-3" style="color:#fbbf24">01</div>
        <h4 class="text-white font-bold mb-2">Certification</h4>
        <p class="text-slate-400 text-xs leading-relaxed">Être certifié QUALI-ELEC en cours de validité (Classe A, B ou C).</p>
      </div>
      <div class="p-6 rounded-xl border sr-scale d2" style="border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02)">
        <div class="text-3xl font-black mb-3" style="color:#fbbf24">02</div>
        <h4 class="text-white font-bold mb-2">Retrait Dossier</h4>
        <p class="text-slate-400 text-xs leading-relaxed">Télécharger le cahier des charges technique sur notre portail GED.</p>
      </div>
      <div class="p-6 rounded-xl border sr-scale d3" style="border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02)">
        <div class="text-3xl font-black mb-3" style="color:#fbbf24">03</div>
        <h4 class="text-white font-bold mb-2">Offre Technique</h4>
        <p class="text-slate-400 text-xs leading-relaxed">Soumettre votre proposition conforme à la norme SN 01-015.</p>
      </div>
      <div class="p-6 rounded-xl border sr-scale d4" style="border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02)">
        <div class="text-3xl font-black mb-3" style="color:#fbbf24">04</div>
        <h4 class="text-white font-bold mb-2">Attribution</h4>
        <p class="text-slate-400 text-xs leading-relaxed">Commission d'évaluation par nos inspecteurs et contractualisation.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'CTA',
        html: `<section class="py-20 px-4 text-center" style="background:#fffbeb">
  <div class="max-w-3xl mx-auto sr">
    <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Inscrivez votre entreprise au registre des marchés</h2>
    <p class="text-slate-500 mb-10 text-lg">Recevez des alertes automatiques dès qu'un projet correspondant à votre classe de certification est publié.</p>
    <a href="/contact?subject=registre" class="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#fbbf24;color:#0f172a">🔔 S'inscrire aux alertes</a>
  </div>
</section>`
      }
    ]
  },

  // ── 11. Espace Partenaires ────────────────────────────────────────────────
  'espace-partenaires': {
    title: 'Espace Partenaires',
    meta: 'Accédez à l\'espace réservé aux partenaires de PROQUELEC. Outils de collaboration et ressources.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#090d16 100%)">
  <div class="absolute inset-0 opacity-15 hero-dots" style="background-image:radial-gradient(#3b82f6 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 hero-orb-2" style="background:radial-gradient(circle,#3b82f6,transparent);transform:translate(-30%,30%)"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#3b82f6;color:#60a5fa">🤝 Espace Partenaires Agréés</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Co-construire le Sénégal<br><span style="color:#60a5fa">électrique de demain</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Un espace dédié aux ministères, à la SENELEC, aux bailleurs et aux assureurs pour partager des données d'audit et piloter des actions conjointes.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/auth#partner" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 btn-shimmer" style="background:#3b82f6;color:white">🔑 Se connecter à l\'espace</a>
      <a href="#benefits" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.3);color:white">En savoir plus ↓</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Avantages',
        html: `<section id="benefits" class="py-20 px-4" style="background:#ffffff">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1e40af">Avantages Partenaires</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Pourquoi collaborer avec nous ?</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Bénéficiez de la puissance de notre réseau et de nos outils analytiques.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">📈</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Statistiques & Big Data</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Visualisez les taux de conformité électrique par région, département et type de bâtiment en temps réel.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">📂</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Rapports partagés</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Accédez en toute sécurité aux documents d'audits et PV de conformité pour vos clients ou administrés.</p>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">🛡️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Assurances & Risques</h3>
        <p class="text-sm text-slate-600 leading-relaxed">Réduisez vos risques de sinistres en intégrant nos grilles de contrôle à vos contrats de couverture.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        label: 'Accès Partenaire Form',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0a0f24 0%,#1a2035 100%)">
  <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div class="sr-left">
      <h2 class="text-3xl md:text-4xl font-black text-white mb-6">Demander des codes d'accès</h2>
      <p class="text-slate-400 mb-6 leading-relaxed">L'accès à l'Espace Partenaire est strictement réservé aux institutions agréées, banques partenaires et inspecteurs certifiés.</p>
      <div class="p-5 rounded-xl border" style="border-color:rgba(59,130,246,.3);background:rgba(59,130,246,.08)">
        <p class="text-xs text-slate-300">🔒 Double authentification requise. Données hébergées sur serveurs souverains.</p>
      </div>
    </div>
    <div class="sr-right bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
      <h4 class="text-white font-bold text-lg mb-6">Formulaire de demande</h4>
      <form class="space-y-4" onsubmit="event.preventDefault(); alert('Votre demande a bien été prise en compte. Notre équipe vous recontactera sous 24h.');">
        <div><label class="block text-slate-400 text-xs font-semibold mb-2">Organisation</label><input type="text" placeholder="Ex: SENELEC, AXA..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500" required></div>
        <div><label class="block text-slate-400 text-xs font-semibold mb-2">Email professionnel</label><input type="email" placeholder="nom@organisation.sn" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500" required></div>
        <button type="submit" class="w-full py-3 rounded-lg font-bold text-sm text-center btn-shimmer" style="background:#3b82f6;color:white">Envoyer la demande</button>
      </form>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ── 12. portal (PORTAIL PROQUELEC) ─────────────────────────────────────────
  'portal': {
    title: 'Portail PROQUELEC',
    meta: 'Accédez au portail numérique de PROQUELEC pour les ménages, électriciens, entreprises et autorités.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0a192f 0%,#020c1b 100%)">
  <div class="absolute inset-0 opacity-15 hero-dots" style="background-image:radial-gradient(#3b82f6 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="max-w-6xl mx-auto relative z-10 text-center anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border border-blue-500 rounded-full mb-6 text-blue-400 badge-pulse">⚡ Portail Numérique Unique</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Votre Portail de<br><span style="color:#fbbf24">Sécurité Électrique</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">Une plateforme unique pour tous les acteurs. Accédez aux ressources, démarches, outils d'ingénierie et formulaires en fonction de votre profil.</p>
  </div>
</section>`
      },
      {
        label: 'Profiles Gateway',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <a href="/menages" class="group p-7 rounded-2xl border bg-white hover:shadow-2xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 card-icon" style="background:#f0fdf4">🏠</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Espace Ménages</h3>
        <p class="text-sm text-slate-500 leading-relaxed mb-4">Diagnostics, guides de sécurité domestique et conseils pratiques pour protéger votre foyer.</p>
        <span class="text-xs font-bold text-emerald-600 group-hover:underline">Accéder à l'espace →</span>
      </a>
      <a href="/professionnels" class="group p-7 rounded-2xl border bg-white hover:shadow-2xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 card-icon" style="background:#eff6ff">⚡</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Espace Professionnels</h3>
        <p class="text-sm text-slate-500 leading-relaxed mb-4">Certifications QUALI-ELEC, demandes d'audits, formations et outils métiers.</p>
        <span class="text-xs font-bold text-blue-600 group-hover:underline">Accéder à l'espace →</span>
      </a>
      <a href="/autorites" class="group p-7 rounded-2xl border bg-white hover:shadow-2xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 card-icon" style="background:#fffbeb">🏛️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Espace Autorités</h3>
        <p class="text-sm text-slate-500 leading-relaxed mb-4">Indicateurs de sécurité nationale, statistiques territoriales et conformité des ERP.</p>
        <span class="text-xs font-bold text-amber-600 group-hover:underline">Accéder à l'espace →</span>
      </a>
      <a href="/espace-partenaires" class="group p-7 rounded-2xl border bg-white hover:shadow-2xl transition-all duration-300 card-glow sr d4" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-5 card-icon" style="background:#faf5ff">🤝</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Espace Partenaires</h3>
        <p class="text-sm text-slate-500 leading-relaxed mb-4">Accès réservé pour la SENELEC, les assureurs et les ministères.</p>
        <span class="text-xs font-bold text-purple-600 group-hover:underline">Accéder à l'espace →</span>
      </a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Outils Rapides',
        html: `<section class="py-20 px-4" style="background:linear-gradient(135deg,#0a192f 0%,#0c1020 100%)">
  <div class="max-w-4xl mx-auto text-center sr">
    <h2 class="text-3xl font-black text-white mb-6">Besoin d'accéder au Lab ou aux outils d'Ingénierie ?</h2>
    <p class="text-slate-400 mb-10 text-base">La suite d'outils souverains (calculateurs, éditeur de schéma, scanner) est disponible sur la plateforme technique.</p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="/expert-lab" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 btn-shimmer" style="background:#3b82f6;color:white">🔬 Ouvrir l'Expert Lab</a>
      <a href="/outils" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.2);color:slate-300">Outils grand public →</a>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ── 13. social (Réseaux & Social) ──────────────────────────────────────────
  'social': {
    title: 'Réseaux & Social',
    meta: 'Rejoignez la communauté PROQUELEC sur les réseaux sociaux et suivez toute l\'actualité de la sécurité électrique.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#030712 0%,#111827 50%,#1f2937 100%)">
  <div class="absolute inset-0 opacity-10 hero-dots" style="background-image:radial-gradient(#f59e0b 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="max-w-6xl mx-auto relative z-10 text-center anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border border-amber-500 rounded-full mb-6 text-amber-400 badge-pulse">📢 Communauté & Réseaux</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Rejoignez-nous sur<br><span style="color:#fbbf24">les Réseaux Sociaux</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">Suivez nos publications, vidéos de sensibilisation, webinaires et restez informé des derniers conseils de prévention.</p>
  </div>
</section>`
      },
      {
        label: 'Social Hub Grid',
        html: `<section class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fee2e2">🎥</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">YouTube Hub</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-6">Regardez nos vidéos didactiques sur la mise à la terre, le choix des câbles et les gestes de sécurité en cas de tempête.</p>
        <a href="https://youtube.com" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105" style="background:#ef4444">▶ S'abonner sur YouTube</a>
      </div>
      <div class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">👥</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Facebook & LinkedIn</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-6">Interagissez avec nos publications quotidiennes sur la sécurité industrielle et découvrez les coulisses des audits PROQUELEC.</p>
        <a href="https://linkedin.com" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105" style="background:#0077b5">🔗 Rejoindre sur LinkedIn</a>
      </div>
      <div class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fffbeb">✉️</div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Newsletter Officielle</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-6">Recevez mensuellement nos fiches conseils, rapports d'activité, calendrier de formations et nouveautés réglementaires.</p>
        <form class="flex gap-2" onsubmit="event.preventDefault(); alert('Inscription réussie !');">
          <input type="email" placeholder="Votre email" class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex-grow focus:outline-none focus:border-blue-500" required>
          <button type="submit" class="px-4 rounded-lg text-xs font-bold text-slate-900 btn-shimmer" style="background:#fbbf24">OK</button>
        </form>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ── 14. expert-lab ────────────────────────────────────────────────────────
  'expert-lab': {
    title: 'Expert Lab',
    meta: 'Accédez aux outils d\'ingénierie et laboratoire de conformité de PROQUELEC.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0a1128 0%,#001f3f 60%,#0f172a 100%)">
  <div class="absolute inset-0 opacity-15 hero-dots" style="background-image:radial-gradient(#3b82f6 1px,transparent 1px);background-size:28px 28px"></div>
  <div class="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 hero-orb-3" style="background:radial-gradient(circle,#fbbf24,transparent);transform:translate(30%,-30%)"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#fbbf24;color:#fbbf24">🔬 Suite d\'Ingénierie Souveraine</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Expert Lab<br><span style="color:#3b82f6">PROQUELEC</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Laboratoire d'outils numériques pour les inspecteurs, ingénieurs et techniciens. Calculez, planifiez, scannez et assistez-vous de notre IA de conformité.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/expert" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 btn-shimmer" style="background:#3b82f6;color:white">💻 Ouvrir le Tableau de bord</a>
      <a href="#tools" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.3);color:white">Explorer les outils ↓</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Tools Catalog',
        html: `<section id="tools" class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1e40af">Outils techniques</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Suite d'applications professionnelles</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Des utilitaires conçus par des ingénieurs pour garantir la conformité aux règlements électriques en vigueur.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <a href="/expert/chat" class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#fef3c7">🤖</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Inspecteur KEBE (IA)</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Votre assistant d'intelligence artificielle entraîné sur les codes et normes électriques sénégalaises.</p>
        <span class="text-xs font-bold text-blue-600">Lancer l'IA →</span>
      </a>
      <a href="/schema-builder" class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">📐</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Editeur de Schéma</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Générez des diagrammes unifilaires conformes en quelques clics et exportez-les en PDF.</p>
        <span class="text-xs font-bold text-blue-600">Ouvrir le Builder →</span>
      </a>
      <a href="/expert/calculators" class="p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0;text-decoration:none">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">🧮</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Calculateurs Métiers</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Calculez rapidement la chute de tension, le calibre des câbles et l'équilibrage des charges de vos réseaux.</p>
        <span class="text-xs font-bold text-blue-600">Ouvrir les calculateurs →</span>
      </a>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ── 15. formations ────────────────────────────────────────────────────────
  'formations': {
    title: 'Catalogue des formations',
    meta: 'Catalogue complet des formations professionnelles en électricité proposées par PROQUELEC au Sénégal.',
    nodes: [
      { label: 'CSS', html: ANIM_CSS },
      {
        label: 'Hero',
        html: `<section class="py-24 px-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0a192f 0%,#0d3c6e 60%,#0f172a 100%)">
  <div class="absolute inset-0 opacity-15 hero-dots" style="background-image:radial-gradient(#fbbf24 1px,transparent 1px);background-size:32px 32px"></div>
  <div class="max-w-6xl mx-auto relative z-10 anim-fade-up">
    <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border rounded-full mb-6 badge-pulse" style="border-color:#fbbf24;color:#fbbf24">🎓 Académie PROQUELEC</span>
    <h1 class="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Formations Professionnelles<br><span style="color:#fbbf24">en Électricité</span></h1>
    <p class="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">Montez en compétences avec nos formations certifiantes. Des modules pratiques animés par des ingénieurs experts sur les dernières normes.</p>
    <div class="flex flex-wrap gap-4">
      <a href="/contact?subject=formations" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 btn-shimmer" style="background:#fbbf24;color:#0f172a">📋 Demander une inscription</a>
      <a href="#catalog" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300" style="border-color:rgba(255,255,255,.3);color:white">Voir le catalogue ↓</a>
    </div>
  </div>
</section>`
      },
      {
        label: 'Catalogue Grid',
        html: `<section id="catalog" class="py-20 px-4" style="background:#f8fafc">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14 sr">
      <span class="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-4" style="background:#dbeafe;color:#1e40af">Catalogue</span>
      <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Modules disponibles</h2>
      <p class="text-slate-500 max-w-2xl mx-auto">Découvrez nos parcours phares de formation continue.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d1" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#eff6ff">⚡</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Habilitation Électrique</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Formation réglementaire obligatoire pour travailler sur les réseaux BT (B0, B1, B2, BR, BC).</p>
        <span class="text-xs font-bold" style="color:#1d4ed8">Durée: 3 jours</span>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d2" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#f0fdf4">☀️</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Solaire Photovoltaïque</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Étude, dimensionnement et mise en œuvre technique d'installations solaires connectées ou isolées.</p>
        <span class="text-xs font-bold" style="color:#15803d">Durée: 5 jours</span>
      </div>
      <div class="group p-7 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 card-glow sr d3" style="border-color:#e2e8f0">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 card-icon" style="background:#faf5ff">📖</div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">Règles Normes SN 01-015</h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">Maîtrisez la norme officielle pour concevoir, installer et contrôler les réseaux électriques basse tension.</p>
        <span class="text-xs font-bold" style="color:#6d28d9">Durée: 4 jours</span>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  }
};

// ─── Injection en base ───────────────────────────────────────────────────────
async function seedPages() {
  const client = await pool.connect();
  try {
    let updated = 0, skipped = 0;

    for (const [slug, data] of Object.entries(PAGES)) {
      const res = await client.query(
        'SELECT id FROM pages WHERE slug = $1 LIMIT 1',
        [slug]
      );
      const structureJson = makePage(data.title, data.nodes);
      if (res.rows.length === 0) {
        await client.query(
          `INSERT INTO pages (
            title, slug, status, is_published, structure_json, draft_json, meta_description, editor_engine, render_engine, created_at, updated_at
           ) VALUES ($1, $2, 'published', true, $3, $3, $4, 'visual_blocks', 'raw', NOW(), NOW())`,
          [data.title, slug, JSON.stringify(structureJson), data.meta]
        );
        console.log(`  ➕  "${slug}" → NOUVELLE page créée et injectée`);
        updated++;
      } else {
        const pageId = res.rows[0].id;
        await client.query(
          `UPDATE pages
           SET title            = $1,
               structure_json   = $2,
               draft_json       = $2,
               meta_description = $3,
               status           = 'published',
               is_published     = true,
               editor_engine    = 'visual_blocks',
               render_engine    = 'raw',
               updated_at       = NOW()
           WHERE id = $4`,
          [data.title, JSON.stringify(structureJson), data.meta, pageId]
        );
        console.log(`  ✅  "${slug}" → mise à jour avec ${data.nodes.length} blocs`);
        updated++;
      }
    }

    console.log(`\n📊 Résumé : ${updated} pages mises à jour, ${skipped} ignorées.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPages()
  .then(() => { console.log('\n✨ Design premium modulaire injecté !'); process.exit(0); })
  .catch(err => { console.error('\n❌', err.message); process.exit(1); });
