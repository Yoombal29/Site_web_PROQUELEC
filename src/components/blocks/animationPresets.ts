export type BuilderAnimationPreset = {
  value: string;
  label: string;
  duration: string;
  easing: string;
};

export const BUILDER_ANIMATION_PRESETS: BuilderAnimationPreset[] = [
  { value: 'none', label: 'Aucune', duration: '600ms', easing: 'ease-out' },
  { value: 'fadeIn', label: 'Fade In', duration: '600ms', easing: 'ease-out' },
  { value: 'fadeInUp', label: 'Fade In haut', duration: '600ms', easing: 'ease-out' },
  { value: 'fadeInDown', label: 'Fade In bas', duration: '600ms', easing: 'ease-out' },
  { value: 'fadeInLeft', label: 'Fade In gauche', duration: '600ms', easing: 'ease-out' },
  { value: 'fadeInRight', label: 'Fade In droite', duration: '600ms', easing: 'ease-out' },
  { value: 'slideInUp', label: 'Slide haut', duration: '600ms', easing: 'ease-out' },
  { value: 'slideInDown', label: 'Slide bas', duration: '600ms', easing: 'ease-out' },
  { value: 'slideInLeft', label: 'Slide gauche', duration: '600ms', easing: 'ease-out' },
  { value: 'slideInRight', label: 'Slide droite', duration: '600ms', easing: 'ease-out' },
  { value: 'zoomIn', label: 'Zoom In', duration: '600ms', easing: 'ease-out' },
  { value: 'zoomInUp', label: 'Zoom haut', duration: '650ms', easing: 'ease-out' },
  { value: 'zoomInDown', label: 'Zoom bas', duration: '650ms', easing: 'ease-out' },
  { value: 'zoomInLeft', label: 'Zoom gauche', duration: '650ms', easing: 'ease-out' },
  { value: 'zoomInRight', label: 'Zoom droite', duration: '650ms', easing: 'ease-out' },
  { value: 'scaleIn', label: 'Scale In', duration: '520ms', easing: 'ease-out' },
  { value: 'scaleUp', label: 'Scale Up', duration: '520ms', easing: 'ease-out' },
  { value: 'scaleDown', label: 'Scale Down', duration: '520ms', easing: 'ease-out' },
  { value: 'bounceIn', label: 'Bounce In', duration: '800ms', easing: 'ease-out' },
  { value: 'bounceInUp', label: 'Bounce haut', duration: '850ms', easing: 'ease-out' },
  { value: 'bounceInDown', label: 'Bounce bas', duration: '850ms', easing: 'ease-out' },
  { value: 'bounceInLeft', label: 'Bounce gauche', duration: '850ms', easing: 'ease-out' },
  { value: 'bounceInRight', label: 'Bounce droite', duration: '850ms', easing: 'ease-out' },
  { value: 'flipInX', label: 'Flip X', duration: '700ms', easing: 'ease-out' },
  { value: 'flipInY', label: 'Flip Y', duration: '700ms', easing: 'ease-out' },
  { value: 'rotateIn', label: 'Rotation', duration: '700ms', easing: 'ease-out' },
  { value: 'rotateInUpLeft', label: 'Rotation haut gauche', duration: '700ms', easing: 'ease-out' },
  { value: 'rotateInUpRight', label: 'Rotation haut droite', duration: '700ms', easing: 'ease-out' },
  { value: 'rollIn', label: 'Roll In', duration: '800ms', easing: 'ease-out' },
  { value: 'lightSpeedInLeft', label: 'Light Speed gauche', duration: '700ms', easing: 'ease-out' },
  { value: 'lightSpeedInRight', label: 'Light Speed droite', duration: '700ms', easing: 'ease-out' },
  { value: 'blurIn', label: 'Blur In', duration: '700ms', easing: 'ease-out' },
  { value: 'blurInUp', label: 'Blur haut', duration: '700ms', easing: 'ease-out' },
  { value: 'swingIn', label: 'Swing', duration: '800ms', easing: 'ease-out' },
  { value: 'elasticIn', label: 'Elastic', duration: '900ms', easing: 'cubic-bezier(.22,1.25,.36,1)' },
  { value: 'backInUp', label: 'Back haut', duration: '700ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
  { value: 'backInDown', label: 'Back bas', duration: '700ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
  { value: 'backInLeft', label: 'Back gauche', duration: '700ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
  { value: 'backInRight', label: 'Back droite', duration: '700ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
  { value: 'revealUp', label: 'Reveal haut', duration: '700ms', easing: 'ease-out' },
  { value: 'revealDown', label: 'Reveal bas', duration: '700ms', easing: 'ease-out' },
  { value: 'revealLeft', label: 'Reveal gauche', duration: '700ms', easing: 'ease-out' },
  { value: 'revealRight', label: 'Reveal droite', duration: '700ms', easing: 'ease-out' },
];

export const BUILDER_HOVER_EFFECT_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'lift', label: 'Lift' },
  { value: 'scale', label: 'Scale' },
  { value: 'zoom', label: 'Zoom fort' },
  { value: 'shadow', label: 'Ombre premium' },
  { value: 'glow', label: 'Glow' },
  { value: 'tiltLeft', label: 'Tilt gauche' },
  { value: 'tiltRight', label: 'Tilt droite' },
  { value: 'rotate', label: 'Rotation légère' },
  { value: 'float', label: 'Float' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'blur', label: 'Blur' },
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'saturate', label: 'Saturation' },
];

export const BUILDER_FILTER_EFFECT_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'grayscale', label: 'Noir et blanc' },
  { value: 'sepia', label: 'Sépia' },
  { value: 'blur', label: 'Flou' },
  { value: 'saturate', label: 'Saturation' },
  { value: 'contrast', label: 'Contraste' },
  { value: 'brightness', label: 'Luminosité' },
];

export const BUILDER_ANIMATION_EASING_OPTIONS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'cubic-bezier(.16,1,.3,1)', label: 'Premium Smooth' },
  { value: 'cubic-bezier(.22,1.25,.36,1)', label: 'Elastic Premium' },
  { value: 'cubic-bezier(.2,.8,.2,1)', label: 'Soft Snap' },
];

export const ANIMATION_DEFINITIONS = BUILDER_ANIMATION_PRESETS.reduce(
  (acc, preset) => {
    if (preset.value !== 'none') {
      acc[preset.value] = { duration: preset.duration, easing: preset.easing };
    }
    return acc;
  },
  {} as Record<string, { duration: string; easing: string }>,
);

export const ANIMATION_KEYFRAMES: Record<string, string> = {
  fadeIn: '@keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }',
  fadeInUp: '@keyframes anim-fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }',
  fadeInDown: '@keyframes anim-fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }',
  fadeInLeft: '@keyframes anim-fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }',
  fadeInRight: '@keyframes anim-fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }',
  slideInUp: '@keyframes anim-slideInUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }',
  slideInDown: '@keyframes anim-slideInDown { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }',
  slideInLeft: '@keyframes anim-slideInLeft { from { opacity: 0; transform: translateX(-100%); } to { opacity: 1; transform: translateX(0); } }',
  slideInRight: '@keyframes anim-slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }',
  zoomIn: '@keyframes anim-zoomIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }',
  zoomInUp: '@keyframes anim-zoomInUp { from { opacity: 0; transform: scale(0.6) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
  zoomInDown: '@keyframes anim-zoomInDown { from { opacity: 0; transform: scale(0.6) translateY(-30px); } to { opacity: 1; transform: scale(1) translateY(0); } }',
  zoomInLeft: '@keyframes anim-zoomInLeft { from { opacity: 0; transform: scale(0.6) translateX(-30px); } to { opacity: 1; transform: scale(1) translateX(0); } }',
  zoomInRight: '@keyframes anim-zoomInRight { from { opacity: 0; transform: scale(0.6) translateX(30px); } to { opacity: 1; transform: scale(1) translateX(0); } }',
  scaleIn: '@keyframes anim-scaleIn { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }',
  scaleUp: '@keyframes anim-scaleUp { from { opacity: 0; transform: scale(.72); } to { opacity: 1; transform: scale(1); } }',
  scaleDown: '@keyframes anim-scaleDown { from { opacity: 0; transform: scale(1.16); } to { opacity: 1; transform: scale(1); } }',
  bounceIn: '@keyframes anim-bounceIn { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }',
  bounceInUp: '@keyframes anim-bounceInUp { from { opacity: 0; transform: translateY(70px); } 60% { opacity: 1; transform: translateY(-12px); } 80% { transform: translateY(6px); } to { transform: translateY(0); } }',
  bounceInDown: '@keyframes anim-bounceInDown { from { opacity: 0; transform: translateY(-70px); } 60% { opacity: 1; transform: translateY(12px); } 80% { transform: translateY(-6px); } to { transform: translateY(0); } }',
  bounceInLeft: '@keyframes anim-bounceInLeft { from { opacity: 0; transform: translateX(-70px); } 60% { opacity: 1; transform: translateX(12px); } 80% { transform: translateX(-6px); } to { transform: translateX(0); } }',
  bounceInRight: '@keyframes anim-bounceInRight { from { opacity: 0; transform: translateX(70px); } 60% { opacity: 1; transform: translateX(-12px); } 80% { transform: translateX(6px); } to { transform: translateX(0); } }',
  flipInX: '@keyframes anim-flipInX { from { opacity: 0; transform: perspective(600px) rotateX(90deg); } to { opacity: 1; transform: perspective(600px) rotateX(0); } }',
  flipInY: '@keyframes anim-flipInY { from { opacity: 0; transform: perspective(600px) rotateY(90deg); } to { opacity: 1; transform: perspective(600px) rotateY(0); } }',
  rotateIn: '@keyframes anim-rotateIn { from { opacity: 0; transform: rotate(-180deg) scale(.85); } to { opacity: 1; transform: rotate(0) scale(1); } }',
  rotateInUpLeft: '@keyframes anim-rotateInUpLeft { from { opacity: 0; transform-origin: left bottom; transform: rotate(35deg); } to { opacity: 1; transform-origin: left bottom; transform: rotate(0); } }',
  rotateInUpRight: '@keyframes anim-rotateInUpRight { from { opacity: 0; transform-origin: right bottom; transform: rotate(-35deg); } to { opacity: 1; transform-origin: right bottom; transform: rotate(0); } }',
  rollIn: '@keyframes anim-rollIn { from { opacity: 0; transform: translateX(-80px) rotate(-120deg); } to { opacity: 1; transform: translateX(0) rotate(0); } }',
  lightSpeedInLeft: '@keyframes anim-lightSpeedInLeft { from { opacity: 0; transform: translateX(-100%) skewX(18deg); } 70% { opacity: 1; transform: translateX(8px) skewX(-6deg); } to { transform: translateX(0) skewX(0); } }',
  lightSpeedInRight: '@keyframes anim-lightSpeedInRight { from { opacity: 0; transform: translateX(100%) skewX(-18deg); } 70% { opacity: 1; transform: translateX(-8px) skewX(6deg); } to { transform: translateX(0) skewX(0); } }',
  blurIn: '@keyframes anim-blurIn { from { opacity: 0; filter: blur(16px); transform: scale(1.02); } to { opacity: 1; filter: blur(0); transform: scale(1); } }',
  blurInUp: '@keyframes anim-blurInUp { from { opacity: 0; filter: blur(16px); transform: translateY(26px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }',
  swingIn: '@keyframes anim-swingIn { from { opacity: 0; transform: rotateX(-65deg); transform-origin: top; } to { opacity: 1; transform: rotateX(0); transform-origin: top; } }',
  elasticIn: '@keyframes anim-elasticIn { from { opacity: 0; transform: scale(.55); } 55% { opacity: 1; transform: scale(1.08); } 75% { transform: scale(.96); } to { transform: scale(1); } }',
  backInUp: '@keyframes anim-backInUp { from { opacity: 0; transform: translateY(48px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }',
  backInDown: '@keyframes anim-backInDown { from { opacity: 0; transform: translateY(-48px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }',
  backInLeft: '@keyframes anim-backInLeft { from { opacity: 0; transform: translateX(-48px) scale(.92); } to { opacity: 1; transform: translateX(0) scale(1); } }',
  backInRight: '@keyframes anim-backInRight { from { opacity: 0; transform: translateX(48px) scale(.92); } to { opacity: 1; transform: translateX(0) scale(1); } }',
  revealUp: '@keyframes anim-revealUp { from { opacity: 0; clip-path: inset(100% 0 0 0); transform: translateY(18px); } to { opacity: 1; clip-path: inset(0); transform: translateY(0); } }',
  revealDown: '@keyframes anim-revealDown { from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(-18px); } to { opacity: 1; clip-path: inset(0); transform: translateY(0); } }',
  revealLeft: '@keyframes anim-revealLeft { from { opacity: 0; clip-path: inset(0 100% 0 0); transform: translateX(-18px); } to { opacity: 1; clip-path: inset(0); transform: translateX(0); } }',
  revealRight: '@keyframes anim-revealRight { from { opacity: 0; clip-path: inset(0 0 0 100%); transform: translateX(18px); } to { opacity: 1; clip-path: inset(0); transform: translateX(0); } }',
};

export const getAnimationPresetOptions = () =>
  BUILDER_ANIMATION_PRESETS.map(({ value, label }) => ({ value, label }));

export const buildAnimationRuntimeCss = (suffix = '') => {
  const classNames = BUILDER_ANIMATION_PRESETS
    .filter((preset) => preset.value !== 'none')
    .map((preset) => `.animate-${preset.value}${suffix}`);

  const parts: string[] = [];

  parts.push(`${classNames.join(',\n')} { animation-play-state: paused !important; }`);
  parts.push(
    `${classNames.map((selector) => `${selector}.is-visible`).join(',\n')},\n` +
      `${classNames.map((selector) => `${selector}.anim-visible`).join(',\n')},\n` +
      `${classNames.map((selector) => `${selector}.animation-trigger-load`).join(',\n')} { animation-play-state: running !important; }`,
  );

  for (const preset of BUILDER_ANIMATION_PRESETS) {
    if (preset.value === 'none') continue;
    parts.push(
      `.animate-${preset.value}${suffix} { animation: anim-${preset.value} var(--anim-duration, ${preset.duration}) var(--anim-easing, ${preset.easing}) var(--anim-delay, 0ms) var(--anim-iteration-count, 1) var(--anim-direction, normal) var(--anim-fill-mode, both); }`,
    );
  }

  parts.push(...Object.values(ANIMATION_KEYFRAMES));

  return parts.join('\n');
};
