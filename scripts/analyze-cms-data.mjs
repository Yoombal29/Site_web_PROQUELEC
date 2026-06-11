import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const appCatalog = read('src/data/applications-catalog.ts');
const capabilities = read('src/data/cms-capabilities.ts');
const templates = read('src/data/pqTemplates.ts');

function count(pattern, source) {
  return (source.match(pattern) || []).length;
}

const metrics = {
  generatedAt: new Date().toISOString(),
  tools: {
    total: count(/id:\s*'[^']+'/g, appCatalog),
    free: count(/category:\s*'free'/g, appCatalog),
    premium: count(/category:\s*'premium'/g, appCatalog),
    internal: count(/category:\s*'internal'/g, appCatalog),
    active: count(/status:\s*'active'/g, appCatalog),
    coming: count(/status:\s*'coming'/g, appCatalog),
    development: count(/status:\s*'development'/g, appCatalog),
  },
  capabilities: {
    total: count(/id:\s*'[^']+'/g, capabilities),
    operational: count(/status:\s*'opérationnel'/g, capabilities),
    strengthen: count(/status:\s*'à renforcer'/g, capabilities),
    connect: count(/status:\s*'à connecter'/g, capabilities),
    highPriority: count(/priority:\s*'Haute'/g, capabilities),
  },
  templates: {
    total: count(/"id":/g, templates),
    pqModelReferences: count(/pq-model/g, templates),
  },
};

const markdown = `# Analyse données CMS PROQUELEC

Date: ${metrics.generatedAt}

## Catalogue outils

| Indicateur | Valeur |
|---|---:|
| Total outils | ${metrics.tools.total} |
| Gratuits | ${metrics.tools.free} |
| Premium | ${metrics.tools.premium} |
| Internes | ${metrics.tools.internal} |
| Actifs | ${metrics.tools.active} |
| À venir | ${metrics.tools.coming} |
| En développement | ${metrics.tools.development} |

## Capacités CMS

| Indicateur | Valeur |
|---|---:|
| Total capacités | ${metrics.capabilities.total} |
| Opérationnelles | ${metrics.capabilities.operational} |
| À renforcer | ${metrics.capabilities.strengthen} |
| À connecter | ${metrics.capabilities.connect} |
| Priorité haute | ${metrics.capabilities.highPriority} |

## Modèles PROQUELEC

| Indicateur | Valeur |
|---|---:|
| Templates registre | ${metrics.templates.total} |
| Références pq-model | ${metrics.templates.pqModelReferences} |

## Exploitation

- Importer \`public/data/cms-dashboard-metrics.json\` dans une page observatoire si besoin.
- Comparer ces chiffres avant et après une release.
- Alerter si des outils redeviennent \`coming\` ou si des templates quittent les classes \`pq-*\`.
`;

const docsDir = path.join(root, 'docs');
const publicDocsDir = path.join(root, 'public', 'docs');
const publicDataDir = path.join(root, 'public', 'data');
fs.mkdirSync(docsDir, { recursive: true });
fs.mkdirSync(publicDocsDir, { recursive: true });
fs.mkdirSync(publicDataDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'cms-data-analysis.md'), markdown, 'utf8');
fs.writeFileSync(path.join(publicDocsDir, 'cms-data-analysis.md'), markdown, 'utf8');
fs.writeFileSync(
  path.join(publicDataDir, 'cms-dashboard-metrics.json'),
  JSON.stringify(metrics, null, 2),
  'utf8',
);

console.log('Analyse données CMS générée.');
