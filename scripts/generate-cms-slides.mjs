import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pptxgen from 'pptxgenjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'PROQUELEC';
pptx.company = 'PROQUELEC';
pptx.subject = 'Capacités CMS PROQUELEC';
pptx.title = 'CMS PROQUELEC - Capacités gratuites et workflow';
pptx.lang = 'fr-FR';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'fr-FR',
};

const colors = {
  blue: '1E3A5F',
  electric: '2376DF',
  amber: 'FBBF24',
  slate: '0F172A',
  muted: '64748B',
  white: 'FFFFFF',
};

function addTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6,
    y: 0.55,
    w: 8.5,
    h: 0.55,
    fontFace: 'Aptos Display',
    fontSize: 26,
    bold: true,
    color: colors.slate,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 1.08,
      w: 9.5,
      h: 0.35,
      fontSize: 12,
      color: colors.muted,
      margin: 0,
    });
  }
}

function addFooter(slide) {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6,
    y: 6.95,
    w: 12,
    h: 0,
    line: { color: 'E2E8F0', width: 1 },
  });
  slide.addText('PROQUELEC - CMS, Builder et outils métiers', {
    x: 0.6,
    y: 7.05,
    w: 6,
    h: 0.2,
    fontSize: 8,
    color: colors.muted,
    margin: 0,
  });
}

function addCard(slide, x, y, title, text, accent = colors.electric) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w: 3.65,
    h: 1.15,
    rectRadius: 0.08,
    fill: { color: 'F8FAFC' },
    line: { color: 'D8E2F0', width: 1 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h: 1.15,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(title, {
    x: x + 0.18,
    y: y + 0.14,
    w: 3.25,
    h: 0.24,
    fontSize: 12,
    bold: true,
    color: colors.slate,
    margin: 0,
  });
  slide.addText(text, {
    x: x + 0.18,
    y: y + 0.46,
    w: 3.3,
    h: 0.48,
    fontSize: 8.5,
    color: colors.muted,
    fit: 'shrink',
    margin: 0,
  });
}

let slide = pptx.addSlide();
slide.background = { color: colors.blue };
slide.addText('PROQUELEC', {
  x: 0.7,
  y: 0.65,
  w: 3,
  h: 0.3,
  fontSize: 14,
  bold: true,
  color: colors.amber,
  margin: 0,
});
slide.addText('Capacités CMS gratuites et workflow qualité', {
  x: 0.7,
  y: 1.55,
  w: 8.5,
  h: 0.85,
  fontSize: 34,
  bold: true,
  color: colors.white,
  fit: 'shrink',
  margin: 0,
});
slide.addText('Builder, design system pq-*, sécurité, tests, données, documentation et supports.', {
  x: 0.72,
  y: 2.55,
  w: 7.5,
  h: 0.5,
  fontSize: 15,
  color: 'DCEBFF',
  margin: 0,
});
slide.addText(new Date().toLocaleDateString('fr-FR'), {
  x: 0.72,
  y: 6.65,
  w: 2,
  h: 0.25,
  fontSize: 10,
  color: 'DCEBFF',
  margin: 0,
});

slide = pptx.addSlide();
addTitle(slide, 'Architecture cible', 'Du design system vers les pages publiées.');
['Design tokens', 'Classes pq-*', 'Templates PROQUELEC', 'Builder', 'Pages publiques'].forEach((item, index) => {
  const x = 0.7 + index * 2.45;
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y: 2.6,
    w: 1.8,
    h: 1,
    fill: { color: index === 0 ? colors.blue : 'F8FAFC' },
    line: { color: index === 0 ? colors.blue : 'CBD5E1' },
  });
  slide.addText(item, {
    x: x + 0.12,
    y: 2.9,
    w: 1.55,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: index === 0 ? colors.white : colors.slate,
    align: 'center',
    margin: 0,
  });
  if (index < 4) {
    slide.addText('→', {
      x: x + 1.9,
      y: 2.88,
      w: 0.4,
      h: 0.3,
      fontSize: 18,
      color: colors.electric,
      margin: 0,
    });
  }
});
addFooter(slide);

slide = pptx.addSlide();
addTitle(slide, 'Capacités gratuites prioritaires', 'Ce qui peut être utilisé immédiatement dans le projet.');
addCard(slide, 0.7, 1.7, 'Design premium', 'Templates Builder, rendu mobile, composants pq-*.', colors.electric);
addCard(slide, 4.8, 1.7, 'Tests Playwright', 'Smoke-tests admin, outils, permissions et Builder.', '16A34A');
addCard(slide, 8.9, 1.7, 'Sécurité RBAC', 'Contrôle des rôles, tokens, routes et accès refusés.', 'DC2626');
addCard(slide, 0.7, 3.2, 'Données & charts', 'Exports, indicateurs, observatoire et Recharts.', '7C3AED');
addCard(slide, 4.8, 3.2, 'Documentation', 'Guide webmaster, procédures, FAQ support.', colors.amber);
addCard(slide, 8.9, 3.2, 'Workflow Git', 'Commits propres, checklist release et traçabilité.', colors.slate);
addFooter(slide);

slide = pptx.addSlide();
addTitle(slide, 'Workflow de publication', 'Recette simple avant mise en production VPS.');
[
  'Choisir un modèle officiel',
  'Contrôler classes pq-*',
  'Tester mobile et desktop',
  'Vérifier permissions admin',
  'Lancer audit et build',
  'Déployer et contrôler la page live',
].forEach((item, index) => {
  slide.addText(`${index + 1}`, {
    x: 0.9,
    y: 1.65 + index * 0.75,
    w: 0.38,
    h: 0.38,
    fontSize: 12,
    bold: true,
    color: colors.white,
    align: 'center',
    valign: 'mid',
    margin: 0,
    fill: { color: colors.electric },
  });
  slide.addText(item, {
    x: 1.45,
    y: 1.63 + index * 0.75,
    w: 8.5,
    h: 0.4,
    fontSize: 15,
    color: colors.slate,
    margin: 0,
  });
});
addFooter(slide);

slide = pptx.addSlide();
addTitle(slide, 'Commandes de contrôle', 'Les livrables sont générés localement.');
[
  ['npm run cms:audit', 'Audit design, templates, admin, sécurité et catalogue.'],
  ['npm run cms:docs', 'Guide webmaster Markdown versionné.'],
  ['npm run cms:data', 'Synthèse des indicateurs CMS et JSON public.'],
  ['npm run cms:slides', 'Deck PowerPoint réutilisable.'],
  ['npm run test:e2e:cms', 'Smoke-tests Playwright ciblés.'],
  ['npm run build', 'Validation production Vite.'],
].forEach(([cmd, text], index) => {
  const y = 1.55 + index * 0.78;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y,
    w: 3.2,
    h: 0.42,
    fill: { color: colors.slate },
    line: { color: colors.slate },
  });
  slide.addText(cmd, {
    x: 0.9,
    y: y + 0.11,
    w: 2.9,
    h: 0.16,
    fontSize: 8.5,
    color: colors.white,
    fontFace: 'Consolas',
    margin: 0,
  });
  slide.addText(text, {
    x: 4.25,
    y: y + 0.08,
    w: 7.2,
    h: 0.2,
    fontSize: 11,
    color: colors.muted,
    margin: 0,
  });
});
addFooter(slide);

slide = pptx.addSlide();
addTitle(slide, 'Décision recommandée', 'Ce qui doit rester dans le socle PROQUELEC.');
slide.addText(
  'Le CMS doit d’abord capitaliser sur les briques gratuites déjà présentes : pq-*, shadcn/Radix, Recharts, Playwright, Markdown, Git et pptxgenjs. Les services externes restent optionnels.',
  {
    x: 0.9,
    y: 1.85,
    w: 10.8,
    h: 1.1,
    fontSize: 21,
    bold: true,
    color: colors.slate,
    fit: 'shrink',
    margin: 0,
  },
);
slide.addText('Priorité opérationnelle : tests, sécurité RBAC, documentation webmaster et design system.', {
  x: 0.9,
  y: 3.35,
  w: 10,
  h: 0.4,
  fontSize: 15,
  color: colors.electric,
  bold: true,
  margin: 0,
});
addFooter(slide);

const docsDir = path.join(root, 'docs');
const publicDocsDir = path.join(root, 'public', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(publicDocsDir, { recursive: true });

const outFile = path.join(docsDir, 'proquelec-cms-capacites.pptx');
const publicOutFile = path.join(publicDocsDir, 'proquelec-cms-capacites.pptx');
await pptx.writeFile({ fileName: outFile });
fs.copyFileSync(outFile, publicOutFile);

const outline = `# Slides CMS PROQUELEC

Fichier généré : \`docs/proquelec-cms-capacites.pptx\`

## Slides

1. Couverture
2. Architecture cible
3. Capacités gratuites prioritaires
4. Workflow de publication
5. Commandes de contrôle
6. Décision recommandée
`;

fs.writeFileSync(path.join(docsDir, 'proquelec-cms-capacites-outline.md'), outline, 'utf8');
fs.writeFileSync(path.join(publicDocsDir, 'proquelec-cms-capacites-outline.md'), outline, 'utf8');

console.log('Deck PowerPoint CMS généré.');
