import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const requiredStyleFiles = [
  'src/styles/design-tokens.css',
  'src/styles/pq-layout.css',
  'src/styles/pq-section.css',
  'src/styles/pq-grid.css',
  'src/styles/pq-button.css',
  'src/styles/pq-card.css',
  'src/styles/pq-alert.css',
  'src/styles/pq-form.css',
  'src/styles/pq-table.css',
  'src/styles/pq-builder.css',
  'src/styles/animations.css',
];

const capabilitySource = read('src/data/cms-capabilities.ts');
const capabilityIds = [...capabilitySource.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);
const appCatalog = read('src/data/applications-catalog.ts');
const adminDashboard = read('src/components/admin/AdminDashboard.tsx');
const adminSidebar = read('src/components/AdminSidebar.tsx');
const templates = exists('src/data/pqTemplates.ts') ? read('src/data/pqTemplates.ts') : '';
const heroBanner = read('src/components/HeroBanner.tsx');

const publicRoutesToAvoid = [...appCatalog.matchAll(/route:\s*'([^']+)'/g)]
  .map((match) => match[1])
  .filter((route) => route.startsWith('/apps/'));

const checks = [
  {
    name: 'Matrice des capacités CMS',
    ok: capabilityIds.length >= 13,
    detail: `${capabilityIds.length} capacité(s) détectée(s).`,
  },
  {
    name: 'Design system pq-* séparé',
    ok: requiredStyleFiles.every(exists),
    detail: `${requiredStyleFiles.filter(exists).length}/${requiredStyleFiles.length} fichiers CSS présents.`,
  },
  {
    name: 'Centre CMS branché dans l’admin',
    ok:
      adminSidebar.includes("id: 'cms-capabilities'") &&
      adminDashboard.includes('CmsCapabilityCenter') &&
      adminDashboard.includes("activeTab === 'cms-capabilities'"),
    detail: 'Entrée sidebar et rendu d’onglet vérifiés.',
  },
  {
    name: 'Catalogue outils sans placeholder /apps',
    ok: publicRoutesToAvoid.length === 0,
    detail: publicRoutesToAvoid.length
      ? `${publicRoutesToAvoid.length} route(s) placeholder détectée(s).`
      : 'Aucune route /apps placeholder détectée.',
  },
  {
    name: 'Bibliothèque de modèles pqTemplates',
    ok: templates.includes('export const pqTemplates') && templates.includes('pq-model'),
    detail: templates
      ? `${(templates.match(/"id":/g) || []).length} template(s) dans le registre.`
      : 'Registre introuvable.',
  },
  {
    name: 'Scripts CMS exposés',
    ok: read('package.json').includes('"cms:audit"') && read('package.json').includes('"cms:slides"'),
    detail: 'Scripts npm de contrôle présents.',
  },
  {
    name: 'Validateur IA synchronisable',
    ok: exists('test_ai_endpoints.js') && read('test_ai_endpoints.js').includes('VALIDATEUR ENDPOINTS IA PROQUELEC'),
    detail: 'test_ai_endpoints.js présent à la racine.',
  },
  {
    name: 'Aucune durée Tailwind ambiguë dans le hero',
    ok: !heroBanner.includes('duration-[10000ms]'),
    detail: 'La durée longue du zoom est gérée en style inline.',
  },
];

const passed = checks.filter((check) => check.ok).length;
const failed = checks.length - passed;

const lines = [
  '# Audit CMS PROQUELEC',
  '',
  `Date: ${new Date().toISOString()}`,
  '',
  `Résultat: ${passed}/${checks.length} contrôles réussis.`,
  '',
  '| Contrôle | Statut | Détail |',
  '|---|---|---|',
  ...checks.map((check) => `| ${check.name} | ${check.ok ? 'OK' : 'À corriger'} | ${check.detail} |`),
  '',
  '## Recommandations',
  '',
  '- Exécuter `npm run cms:audit` avant chaque déploiement VPS.',
  '- Exécuter `npm run test:e2e:cms` lorsque le serveur local est démarré.',
  '- Garder les modèles officiels sur les classes `pq-*` et éviter les classes Tailwind arbitraires dans le HTML collé.',
  '- Vérifier les permissions admin quand un nouvel onglet est ajouté à la sidebar.',
  '- Générer le guide et les slides avec `npm run cms:docs` et `npm run cms:slides` avant une formation webmaster.',
  '',
];

const docsDir = path.join(root, 'docs');
const publicDocsDir = path.join(root, 'public', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(publicDocsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'cms-capabilities-audit.md'), lines.join('\n'), 'utf8');
fs.writeFileSync(path.join(publicDocsDir, 'cms-capabilities-audit.md'), lines.join('\n'), 'utf8');

console.log(`Audit CMS: ${passed}/${checks.length} contrôles réussis.`);
if (failed > 0) {
  process.exitCode = 1;
}
