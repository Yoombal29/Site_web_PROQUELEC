const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { pool } = require('../../core/database');

const PACKAGE_KIND = 'proquelec.builder.page.release';
const PACKAGE_VERSION = 1;

const PAGE_RELEASE_FIELDS = [
  'title',
  'slug',
  'content',
  'content_raw',
  'content_compiled',
  'content_type',
  'editor_engine',
  'render_engine',
  'excerpt',
  'meta_description',
  'meta_keywords',
  'meta_robots',
  'seo_options',
  'featured_image',
  'template',
  'show_hero',
  'show_footer',
  'custom_css',
  'custom_js',
  'header_html',
  'footer_html',
  'hero_title',
  'hero_subtitle',
  'hero_description',
  'hero_badge',
  'hero_background_image',
  'hero_gradient',
  'hero_cta_text',
  'hero_cta_link',
  'hero_buttons',
  'is_published',
  'publish_date',
  'unpublish_date',
  'menu_order',
  'categories',
  'tags',
  'author',
  'reading_time',
  'parent_id',
  'design_options',
  'content_blocks',
  'workflow_status',
  'status',
  'language_code',
  'translations',
  'publish_schedule',
  'unpublish_schedule',
  'external_id',
  'api_metadata',
  'security_level',
  'media_gallery',
  'featured_video',
  'attachments',
  'custom_fields',
  'custom_settings',
  'geo_targeting',
  'alt_texts',
  'layout_type',
  'is_sticky',
  'comment_status',
  'plugins_active',
  'translation_of',
  'structure_json',
  'draft_json',
  'content_sections',
  'layout_tree',
  'theme_config',
  'bindings',
  'animation_config',
  'published_snapshot_id',
];

const JSON_FIELDS = new Set([
  'seo_options',
  'design_options',
  'content_blocks',
  'translations',
  'publish_schedule',
  'unpublish_schedule',
  'api_metadata',
  'media_gallery',
  'attachments',
  'custom_fields',
  'custom_settings',
  'geo_targeting',
  'alt_texts',
  'plugins_active',
  'structure_json',
  'draft_json',
  'hero_buttons',
  'content_sections',
  'layout_tree',
  'theme_config',
  'bindings',
  'animation_config',
]);

const PROCESSED_STATUSES = ['published', 'rejected', 'invalid', 'quarantined', 'rolled_back'];
const ACTIVE_STATUSES = ['candidate', 'conflict'];

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (!isPlainObject(value)) return value;

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      const normalized = normalizeValue(value[key]);
      if (normalized !== undefined) acc[key] = normalized;
      return acc;
    }, {});
}

function stableStringify(value) {
  return JSON.stringify(normalizeValue(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

function parseJsonIfNeeded(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function serializeFieldValue(field, value) {
  if (value === undefined) return null;
  if (JSON_FIELDS.has(field)) return JSON.stringify(value ?? (field === 'content_blocks' ? [] : {}));
  return value;
}

function getSnapshotFromPage(page) {
  const fields = {};
  for (const field of PAGE_RELEASE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(page, field)) {
      fields[field] = parseJsonIfNeeded(page[field]);
    }
  }

  fields.title = fields.title || 'Page sans titre';
  fields.slug = fields.slug || page.slug;

  return {
    id: page.id || null,
    fields,
  };
}

function computeSnapshotHash(snapshot) {
  return sha256(snapshot.fields);
}

function extractAssetRefs(value, refs = new Set()) {
  if (typeof value === 'string') {
    const matches = value.match(/(https?:\/\/[^\s"'<>\\)]+|\/(?:uploads|server\/uploads|assets)\/[^\s"'<>\\)]+)/g);
    if (matches) {
      matches.forEach((match) => refs.add(match.replace(/[),.;]+$/, '')));
    }
    return refs;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => extractAssetRefs(item, refs));
    return refs;
  }

  if (isPlainObject(value)) {
    Object.values(value).forEach((item) => extractAssetRefs(item, refs));
  }

  return refs;
}

function countOccurrences(text, pattern) {
  if (!text) return 0;
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function assetExists(ref) {
  if (!ref || /^https?:\/\//i.test(ref)) {
    return { status: 'external', exists: null };
  }

  const cleanRef = ref.split('?')[0].split('#')[0];
  const relativeRef = cleanRef.replace(/^\/+/, '');
  const candidates = [
    path.resolve(process.cwd(), relativeRef),
    path.resolve(process.cwd(), 'server', relativeRef),
    path.resolve(process.cwd(), 'dist', relativeRef.replace(/^assets\//, 'assets/')),
    path.resolve(process.cwd(), 'public', relativeRef),
  ];

  return {
    status: candidates.some((candidatePath) => fs.existsSync(candidatePath)) ? 'present' : 'missing',
    exists: candidates.some((candidatePath) => fs.existsSync(candidatePath)),
  };
}

function evaluateReleasePackageHealth(pkg, computedChecksum = null) {
  const serialized = stableStringify(pkg);
  const declaredChecksum = pkg?.checksum || null;
  const computed = computedChecksum || packageHash(pkg || {});
  const replacementCount = countOccurrences(serialized, /\uFFFD/g);
  const tripleQuestionCount = countOccurrences(serialized, /\?\?\?/g);
  const mojibakeCount = countOccurrences(serialized, /(Ã|Â|â€|â€™|â€œ|â€\u009d|�)/g);
  const checksumMismatch = Boolean(declaredChecksum && declaredChecksum !== computed);
  const assets = Array.from(extractAssetRefs(pkg?.page?.fields || pkg || {})).sort();
  const assetResults = assets.map((ref) => ({ ref, ...assetExists(ref) }));
  const missingAssets = assetResults.filter((asset) => asset.status === 'missing');
  const externalAssets = assetResults.filter((asset) => asset.status === 'external');
  const blockers = [];
  const warnings = [];

  if (replacementCount > 0) {
    blockers.push(`${replacementCount} caractère(s) de remplacement UTF-8 détecté(s)`);
  }
  if (tripleQuestionCount > 0) {
    blockers.push(`${tripleQuestionCount} groupe(s) "???" détecté(s)`);
  }
  if (checksumMismatch) {
    blockers.push('Checksum déclaré différent du contenu réel');
  }
  if (mojibakeCount > 0 && replacementCount === 0) {
    warnings.push(`${mojibakeCount} séquence(s) possiblement mal encodée(s)`);
  }
  if (missingAssets.length > 0) {
    warnings.push(`${missingAssets.length} asset(s) locaux introuvable(s)`);
  }
  if (externalAssets.length > 0) {
    warnings.push(`${externalAssets.length} asset(s) externe(s) non vérifié(s)`);
  }

  const riskLevel = blockers.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low';

  return {
    is_valid: blockers.length === 0,
    is_publishable: blockers.length === 0,
    risk_level: riskLevel,
    blockers,
    warnings,
    encoding: {
      replacement_count: replacementCount,
      triple_question_count: tripleQuestionCount,
      mojibake_count: mojibakeCount,
    },
    checksum: {
      declared: declaredChecksum,
      computed,
      mismatch: checksumMismatch,
    },
    assets: {
      total: assets.length,
      external_count: externalAssets.length,
      missing_count: missingAssets.length,
      refs: assetResults.slice(0, 40),
    },
  };
}

function getPackageHealth(pkg) {
  return pkg?.__package_health || evaluateReleasePackageHealth(pkg);
}

function statusFromAnalysisAndHealth(analysis, health) {
  if (!health.is_publishable) return 'invalid';
  if (health.assets?.missing_count > 0) return 'quarantined';
  return analysis.conflict ? 'conflict' : 'candidate';
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeInlineHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"]?)javascript:[\s\S]*?\2/gi, ' $1="#"');
}

function truncateHtml(html, maxLength = 180000) {
  const value = String(html || '');
  return value.length > maxLength
    ? `${value.slice(0, maxLength)}<div class="preview-truncated">Apercu tronque pour rester lisible.</div>`
    : value;
}

function renderRichText(value) {
  const text = String(value || '');
  if (!text) return '';
  return /<\/?[a-z][\s\S]*>/i.test(text)
    ? sanitizeInlineHtml(text)
    : escapeHtml(text).replace(/\n/g, '<br />');
}

function collectText(value, parts = []) {
  if (typeof value === 'string') {
    const clean = stripHtml(value);
    if (clean) parts.push(clean);
    return parts;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, parts));
    return parts;
  }
  if (isPlainObject(value)) {
    Object.values(value).forEach((item) => collectText(item, parts));
  }
  return parts;
}

function findFirstHtml(value) {
  if (typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const html = findFirstHtml(item);
      if (html) return html;
    }
  }
  if (isPlainObject(value)) {
    for (const item of Object.values(value)) {
      const html = findFirstHtml(item);
      if (html) return html;
    }
  }
  return '';
}

function getNodeName(node) {
  const type = node?.type;
  if (typeof type === 'string') return type;
  return type?.resolvedName || node?.displayName || '';
}

function cssStyle(input = {}) {
  if (!isPlainObject(input)) return '';
  return Object.entries(input)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      return `${cssKey}:${String(value).replace(/[;"<>]/g, '')}`;
    })
    .join(';');
}

function renderCraftChildren(structure, nodeIds = [], depth = 0) {
  if (!Array.isArray(nodeIds) || depth > 80) return '';
  return nodeIds.map((nodeId) => renderCraftNode(structure, nodeId, depth + 1)).join('');
}

function renderList(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul class="preview-list">${items
    .map((item) => {
      if (typeof item === 'string') return `<li>${renderRichText(item)}</li>`;
      const label = item.label || item.title || item.name || item.text || '';
      const detail = item.detail || item.description || item.desc || '';
      return `<li><strong>${renderRichText(label)}</strong>${detail ? `<span>${renderRichText(detail)}</span>` : ''}</li>`;
    })
    .join('')}</ul>`;
}

function renderCraftNode(structure, nodeId, depth = 0) {
  const node = structure?.[nodeId];
  if (!node || depth > 80) return '';

  const props = normalizeValue(node.props || {});
  const name = getNodeName(node).toLowerCase();
  const children = renderCraftChildren(structure, node.nodes, depth);
  const style = cssStyle(props.style || {});

  if (nodeId === 'ROOT' || name === 'root' || name.includes('container')) {
    return `<section class="preview-section" style="${style}">${children}</section>`;
  }

  if (name.includes('columns')) {
    return `<div class="preview-columns" style="${style}">${children}</div>`;
  }

  if (name.includes('hero')) {
    const badge = props.badgeText || props.badge || '';
    const title = props.headline || props.title || props.hero_title || '';
    const subtitle = props.subheadline || props.subtitle || props.hero_subtitle || '';
    const image = props.backgroundImage || props.background_image || props.imageUrl || '';
    return `<section class="preview-hero" style="${image ? `background-image:linear-gradient(135deg,rgba(15,23,42,.72),rgba(30,58,95,.72)),url('${escapeHtml(image)}')` : ''}">
      ${badge ? `<p class="preview-badge">${renderRichText(badge)}</p>` : ''}
      ${title ? `<h1>${renderRichText(title)}</h1>` : ''}
      ${subtitle ? `<p>${renderRichText(subtitle)}</p>` : ''}
      ${children}
    </section>`;
  }

  if (name.includes('heading') || node.displayName === 'Titre') {
    const level = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(props.level) ? props.level : 'h2';
    return `<${level} class="preview-heading" style="${style}">${renderRichText(props.text || props.title || '')}</${level}>`;
  }

  if (name.includes('text') || node.displayName === 'Texte') {
    return `<div class="preview-text" style="${style}">${renderRichText(props.text || props.content || '')}</div>`;
  }

  if (name.includes('image') && (props.src || props.image || props.imageUrl)) {
    const src = props.src || props.image || props.imageUrl;
    return `<figure class="preview-image"><img src="${escapeHtml(src)}" alt="${escapeHtml(props.alt || props.title || '')}" /></figure>`;
  }

  if (name.includes('card') || node.displayName === 'Carte') {
    return `<article class="preview-card" style="${style}">
      ${props.icon ? `<span class="preview-icon">${renderRichText(props.icon)}</span>` : ''}
      ${props.title ? `<h3>${renderRichText(props.title)}</h3>` : ''}
      ${props.subtitle ? `<p class="preview-muted">${renderRichText(props.subtitle)}</p>` : ''}
      ${props.text || props.description ? `<p>${renderRichText(props.text || props.description)}</p>` : ''}
      ${children}
    </article>`;
  }

  if (name.includes('feature') || name.includes('list') || Array.isArray(props.items)) {
    return `<div class="preview-list-wrap">${props.title ? `<h3>${renderRichText(props.title)}</h3>` : ''}${renderList(props.items)}${children}</div>`;
  }

  if (name.includes('cta') || name.includes('button')) {
    const label = props.buttonText || props.ctaLabel || props.label || props.text || props.title || 'Action';
    const description = props.description || props.subtitle || '';
    return `<div class="preview-cta">${props.title ? `<h3>${renderRichText(props.title)}</h3>` : ''}${description ? `<p>${renderRichText(description)}</p>` : ''}<span>${renderRichText(label)}</span>${children}</div>`;
  }

  const fallbackPieces = [
    props.title,
    props.label,
    props.name,
    props.text,
    props.description,
    props.subtitle,
  ].filter(Boolean);

  if (fallbackPieces.length > 0 || children) {
    return `<div class="preview-block" style="${style}">${fallbackPieces
      .map((piece, index) => (index === 0 ? `<h3>${renderRichText(piece)}</h3>` : `<p>${renderRichText(piece)}</p>`))
      .join('')}${children}</div>`;
  }

  return '';
}

function renderCraftStructure(structure) {
  const parsed = parseJsonIfNeeded(structure);
  if (!isPlainObject(parsed)) return '';
  if (parsed.ROOT) return renderCraftNode(parsed, 'ROOT');

  const firstKey = Object.keys(parsed)[0];
  return firstKey ? renderCraftNode(parsed, firstKey) : '';
}

function buildPreviewFromFields(fields = {}) {
  const text = collectText({
    title: fields.title,
    meta_description: fields.meta_description,
    content: fields.content,
    content_raw: fields.content_raw,
    content_compiled: fields.content_compiled,
    structure_json: fields.structure_json,
    content_blocks: fields.content_blocks,
  }).join(' ');
  const craftHtml = renderCraftStructure(fields.structure_json);
  const contentHtml = sanitizeInlineHtml(
    fields.content_compiled || fields.content_raw || fields.content || findFirstHtml(fields.content_blocks || ''),
  );
  const fallbackHtml = text
    ? `<section class="preview-section"><h1>${renderRichText(fields.title || 'Page sans titre')}</h1><p>${renderRichText(text.slice(0, 1600))}</p></section>`
    : '';
  const previewHtml = craftHtml || contentHtml || fallbackHtml;
  const renderMode = craftHtml ? 'craft' : contentHtml ? 'html' : 'text';

  return {
    title: fields.title || 'Page sans titre',
    slug: fields.slug || '',
    meta_description: fields.meta_description || '',
    text_excerpt: text.slice(0, 900),
    html_excerpt: truncateHtml(previewHtml),
    preview_html: truncateHtml(previewHtml),
    render_mode: renderMode,
    node_count: countCraftNodes(fields.structure_json) || countCraftNodes(fields.content_blocks),
    character_count: text.length,
    warnings: previewHtml ? [] : ['Aucun contenu visuel exploitable dans cette version.'],
  };
}

function decorateCandidate(row, { includePackage = false, livePage = null, events = [] } = {}) {
  if (!row) return null;
  const pkg = parseJsonIfNeeded(row.package);
  const storedHealth = row.package_health && Object.keys(row.package_health).length > 0
    ? row.package_health
    : evaluateReleasePackageHealth(pkg);
  const incomingFields = pkg?.page?.fields || {};
  const output = {
    ...row,
    package_health: storedHealth,
    candidate_preview: buildPreviewFromFields(incomingFields),
    live_preview: livePage ? buildPreviewFromFields(getSnapshotFromPage(livePage).fields) : null,
    events,
  };

  if (includePackage) {
    output.package = pkg;
  } else {
    delete output.package;
  }

  return output;
}

async function logReleaseEvent(clientOrPool, { candidateId, eventType, userId, reason = null, metadata = {} }) {
  try {
    await clientOrPool.query(
      `INSERT INTO public.builder_release_events
         (candidate_id, event_type, user_id, reason, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [candidateId || null, eventType, userId || null, reason || null, JSON.stringify(metadata || {})],
    );
  } catch (error) {
    console.warn('[RELEASE] Event audit unavailable:', error.message);
  }
}

function stripChecksum(pkg) {
  const clone = { ...pkg };
  delete clone.checksum;
  return clone;
}

function packageHash(pkg) {
  return sha256(stripChecksum(pkg));
}

function normalizePackageInput(input) {
  const pkg = typeof input === 'string' ? JSON.parse(input) : input;
  if (!pkg || typeof pkg !== 'object') {
    throw Object.assign(new Error('Package invalide'), { status: 400 });
  }
  if (pkg.kind !== PACKAGE_KIND || pkg.version !== PACKAGE_VERSION) {
    throw Object.assign(new Error('Format de package Builder non supporté'), { status: 400 });
  }
  if (!pkg.page?.fields?.slug || !pkg.page?.fields?.title) {
    throw Object.assign(new Error('Le package doit contenir une page avec title et slug'), { status: 400 });
  }

  const computed = packageHash(pkg);
  const health = evaluateReleasePackageHealth(pkg, computed);
  if (pkg.checksum && pkg.checksum !== computed) {
    console.warn('[RELEASE] Checksum mismatch - expected: ' + computed + ' received: ' + pkg.checksum);
  }

  const normalized = {
    ...pkg,
    checksum: computed,
  };
  Object.defineProperty(normalized, '__package_health', {
    value: health,
    enumerable: false,
  });
  return normalized;
}

async function findPageBySlugOrId(client, pageId, slug, lock = false) {
  const suffix = lock ? ' FOR UPDATE' : '';
  const result = await client.query(
    `SELECT * FROM public.pages
     WHERE ($1::text IS NOT NULL AND id::text = $1) OR slug = $2
     ORDER BY CASE WHEN id::text = $1 THEN 0 ELSE 1 END
     LIMIT 1${suffix}`,
    [pageId || null, slug],
  );
  return result.rows[0] || null;
}

async function updatePageFingerprint(pageId, contentHash) {
  await pool.query(
    `UPDATE public.pages
     SET builder_content_hash = $2,
         builder_base_content_hash = COALESCE(builder_base_content_hash, $2),
         builder_base_revision = COALESCE(builder_base_revision, builder_revision, 1)
     WHERE id = $1`,
    [pageId, contentHash],
  );
}

async function getPageForExport(pageIdOrSlug) {
  const result = await pool.query(
    'SELECT * FROM public.pages WHERE id::text = $1 OR slug = $1 LIMIT 1',
    [pageIdOrSlug],
  );
  return result.rows[0] || null;
}

async function exportPageRelease(pageIdOrSlug, user, environment = 'local') {
  const page = await getPageForExport(pageIdOrSlug);
  if (!page) throw Object.assign(new Error('Page non trouvée'), { status: 404 });

  const snapshot = getSnapshotFromPage(page);
  const currentHash = computeSnapshotHash(snapshot);
  if (page.builder_content_hash !== currentHash) {
    await updatePageFingerprint(page.id, currentHash);
  }

  const baseHash = page.builder_base_content_hash || page.builder_content_hash || currentHash;
  const baseRevision = page.builder_base_revision || page.builder_revision || page.version || page.version_number || 1;
  const assets = Array.from(extractAssetRefs(snapshot.fields)).sort();

  const pkg = {
    kind: PACKAGE_KIND,
    version: PACKAGE_VERSION,
    exported_at: new Date().toISOString(),
    source: {
      environment,
      user_id: user?.id || null,
      user_email: user?.email || null,
    },
    page: {
      id: page.builder_origin_page_id || page.id,
      slug: snapshot.fields.slug,
      title: snapshot.fields.title,
      fields: snapshot.fields,
    },
    base: {
      hash: baseHash,
      revision: baseRevision,
      page_id: page.builder_origin_page_id || page.id,
      slug: page.builder_origin_slug || snapshot.fields.slug,
      updated_at: page.updated_at,
    },
    assets,
    current: {
      hash: currentHash,
      revision: page.builder_revision || page.version || page.version_number || 1,
    },
  };

  pkg.checksum = packageHash(pkg);
  return pkg;
}

function compareSnapshots(currentSnapshot, incomingSnapshot) {
  if (!currentSnapshot) {
    return {
      mode: 'create',
      changed_fields: Object.keys(incomingSnapshot.fields).sort(),
      critical_fields: [],
      current_node_count: 0,
      incoming_node_count: countCraftNodes(incomingSnapshot.fields.structure_json),
    };
  }

  const changedFields = [];
  for (const field of PAGE_RELEASE_FIELDS) {
    const currentValue = currentSnapshot.fields[field];
    const incomingValue = incomingSnapshot.fields[field];
    if (stableStringify(currentValue) !== stableStringify(incomingValue)) {
      changedFields.push(field);
    }
  }

  return {
    mode: 'update',
    changed_fields: changedFields,
    critical_fields: changedFields.filter((field) =>
      ['slug', 'structure_json', 'draft_json', 'content_blocks', 'custom_css', 'custom_js', 'theme_config'].includes(field),
    ),
    current_node_count: countCraftNodes(currentSnapshot.fields.structure_json),
    incoming_node_count: countCraftNodes(incomingSnapshot.fields.structure_json),
  };
}

function countCraftNodes(structure) {
  if (!structure || typeof structure !== 'object' || Array.isArray(structure)) return 0;
  return Object.keys(structure).length;
}

async function analyzeReleasePackage(rawPackage) {
  const pkg = normalizePackageInput(rawPackage);
  const packageHealth = getPackageHealth(pkg);
  const incomingSnapshot = {
    id: pkg.page.id || null,
    fields: normalizeValue(pkg.page.fields),
  };
  const target = await findPageBySlugOrId(pool, incomingSnapshot.id, incomingSnapshot.fields.slug);
  const currentSnapshot = target ? getSnapshotFromPage(target) : null;
  const currentHash = currentSnapshot ? computeSnapshotHash(currentSnapshot) : null;
  const currentRevision = target
    ? target.builder_revision || target.version || target.version_number || 1
    : null;
  const baseHash = pkg.base?.hash || null;
  const conflict = Boolean(target && (!baseHash || currentHash !== baseHash));
  const diffSummary = compareSnapshots(currentSnapshot, incomingSnapshot);

  return {
    package_hash: pkg.checksum,
    package_health: packageHealth,
    target_exists: Boolean(target),
    target_page_id: target?.id || null,
    target_slug: target?.slug || incomingSnapshot.fields.slug,
    incoming_slug: incomingSnapshot.fields.slug,
    incoming_title: incomingSnapshot.fields.title,
    base_hash: baseHash,
    base_revision: pkg.base?.revision || null,
    current_hash: currentHash,
    current_revision: currentRevision,
    incoming_hash: computeSnapshotHash(incomingSnapshot),
    conflict,
    can_publish: !conflict && packageHealth.is_publishable,
    conflict_reason: !packageHealth.is_publishable
      ? packageHealth.blockers.join(' · ')
      : conflict
      ? 'La page VPS a changé depuis la base utilisée par le package local.'
      : null,
    diff_summary: diffSummary,
  };
}

async function createReleaseCandidate(rawPackage, userId, analysisOverride = null) {
  const pkg = normalizePackageInput(rawPackage);
  const analysis = analysisOverride || (await analyzeReleasePackage(pkg));
  const health = analysis.package_health || getPackageHealth(pkg);
  const status = statusFromAnalysisAndHealth(analysis, health);
  const result = await pool.query(
    `INSERT INTO public.builder_release_candidates
       (target_page_id, target_slug, package, package_hash, base_hash, base_revision,
        current_hash, current_revision, status, conflict_reason, diff_summary, package_health, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      analysis.target_page_id,
      analysis.target_slug,
      JSON.stringify(pkg),
      pkg.checksum,
      analysis.base_hash,
      analysis.base_revision,
      analysis.current_hash,
      analysis.current_revision,
      status,
      status === 'invalid' || status === 'quarantined'
        ? health.blockers.concat(health.warnings).join(' · ')
        : analysis.conflict_reason,
      JSON.stringify(analysis.diff_summary || {}),
      JSON.stringify(health),
      userId || null,
    ],
  );

  await logReleaseEvent(pool, {
    candidateId: result.rows[0].id,
    eventType: 'created',
    userId,
    metadata: { status, package_hash: pkg.checksum, package_health: health },
  });

  return decorateCandidate(result.rows[0], { includePackage: true });
}

async function listReleaseCandidates({ status } = {}) {
  const params = [];
  let sql = `
    SELECT c.*,
           p.title AS target_title,
           p.slug AS live_slug,
           p.updated_at AS live_updated_at,
           p.builder_revision AS live_revision
    FROM public.builder_release_candidates c
    LEFT JOIN public.pages p ON p.id = c.target_page_id
    WHERE c.deleted_at IS NULL`;

  if (status) {
    params.push(status);
    sql += ` AND c.status = $${params.length}`;
  }

  sql += ' ORDER BY c.created_at DESC LIMIT 100';
  const result = await pool.query(sql, params);
  return result.rows.map((row) => decorateCandidate(row));
}

async function getReleaseCandidate(id) {
  const result = await pool.query(
    'SELECT * FROM public.builder_release_candidates WHERE id = $1 AND deleted_at IS NULL',
    [id],
  );
  const candidate = result.rows[0] || null;
  if (!candidate) return null;

  const liveResult = await pool.query('SELECT * FROM public.pages WHERE id = $1 OR slug = $2 LIMIT 1', [
    candidate.target_page_id,
    candidate.target_slug,
  ]);
  let events = [];
  try {
    const eventsResult = await pool.query(
      `SELECT id, event_type, user_id, reason, metadata, created_at
       FROM public.builder_release_events
       WHERE candidate_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [candidate.id],
    );
    events = eventsResult.rows;
  } catch (error) {
    console.warn('[RELEASE] Event audit read unavailable:', error.message);
  }

  return decorateCandidate(candidate, {
    includePackage: true,
    livePage: liveResult.rows[0] || null,
    events,
  });
}

async function importReleasePackage(rawPackage, userId, mode = 'stage') {
  const pkg = normalizePackageInput(rawPackage);
  const analysis = await analyzeReleasePackage(pkg);

  if (mode === 'safe-apply' && analysis.can_publish) {
    const page = await publishReleasePackage(pkg, {
      userId,
      force: false,
      expectedHash: analysis.current_hash || null,
    });
    return { mode: 'published', page, analysis };
  }

  const candidate = await createReleaseCandidate(pkg, userId, analysis);
  return {
    mode: analysis.conflict ? 'conflict-candidate' : 'candidate',
    candidate,
    analysis,
  };
}

async function rejectReleaseCandidate(id, userId, reason = null) {
  const result = await pool.query(
    `UPDATE public.builder_release_candidates
     SET status = 'rejected',
         rejected_by = $2,
         rejected_at = NOW(),
         reject_reason = $3,
         updated_at = NOW()
     WHERE id = $1 AND status IN ('candidate', 'conflict')
     RETURNING *`,
    [id, userId || null, reason || null],
  );

  if (result.rows[0]) {
    await logReleaseEvent(pool, {
      candidateId: id,
      eventType: 'rejected',
      userId,
      reason,
    });
  }

  return result.rows[0] ? decorateCandidate(result.rows[0], { includePackage: true }) : null;
}

function validatePublishedPage(page, pkg) {
  const snapshot = getSnapshotFromPage(page);
  const currentHash = computeSnapshotHash(snapshot);
  const health = evaluateReleasePackageHealth({
    ...pkg,
    page: {
      ...pkg.page,
      fields: snapshot.fields,
    },
  }, currentHash);

  return {
    ok: health.is_publishable && page.builder_content_hash === pkg.checksum,
    content_hash: currentHash,
    expected_hash: pkg.checksum,
    stored_hash: page.builder_content_hash,
    health,
  };
}

async function publishReleaseCandidate(id, { userId, force = false, reason = null } = {}) {
  const candidate = await getReleaseCandidate(id);
  if (!candidate) throw Object.assign(new Error('Candidat introuvable'), { status: 404 });
  if (!['candidate', 'conflict'].includes(candidate.status)) {
    throw Object.assign(new Error('Ce candidat ne peut plus être publié'), { status: 409 });
  }
  if (force && (!reason || reason.trim().length < 8)) {
    throw Object.assign(new Error('Une raison de forçage explicite est requise.'), { status: 400 });
  }

  const pkg = normalizePackageInput(candidate.package);
  const health = candidate.package_health?.is_publishable !== undefined
    ? candidate.package_health
    : getPackageHealth(pkg);
  if (!health.is_publishable) {
    throw Object.assign(new Error('Publication bloquée: le package est corrompu ou invalide.'), {
      status: 422,
      details: health,
    });
  }

  const page = await publishReleasePackage(pkg, {
    userId,
    force,
    candidateId: candidate.id,
    expectedHash: candidate.current_hash || null,
  });
  const validation = validatePublishedPage(page, pkg);

  await pool.query(
    `UPDATE public.builder_release_candidates
     SET status = 'published',
         target_page_id = $2,
         published_by = $3,
         published_at = NOW(),
         publish_reason = $4,
         forced = $5,
         validation_summary = $6,
         updated_at = NOW()
     WHERE id = $1`,
    [candidate.id, page.id, userId || null, reason || null, force === true, JSON.stringify(validation)],
  );

  await logReleaseEvent(pool, {
    candidateId: candidate.id,
    eventType: force ? 'force-published' : 'published',
    userId,
    reason,
    metadata: validation,
  });

  return page;
}

async function rollbackReleaseCandidate(id, { userId, reason = null } = {}) {
  if (!reason || reason.trim().length < 8) {
    throw Object.assign(new Error('Une raison de rollback explicite est requise.'), { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const candidateResult = await client.query(
      `SELECT * FROM public.builder_release_candidates
       WHERE id = $1 AND status = 'published' AND deleted_at IS NULL
       FOR UPDATE`,
      [id],
    );
    const candidate = candidateResult.rows[0];
    if (!candidate) {
      throw Object.assign(new Error('Candidat publié introuvable ou déjà traité.'), { status: 404 });
    }

    const revisionResult = await client.query(
      `SELECT *
       FROM public.builder_page_revisions
       WHERE release_candidate_id = $1
         AND action IN ('before-force-release', 'before-release')
       ORDER BY created_at DESC
       LIMIT 1`,
      [id],
    );
    const revision = revisionResult.rows[0];
    if (!revision) {
      throw Object.assign(new Error('Aucune révision précédente disponible pour rollback.'), { status: 404 });
    }

    const currentPage = await findPageBySlugOrId(
      client,
      candidate.target_page_id,
      candidate.target_slug,
      true,
    );
    if (!currentPage) {
      throw Object.assign(new Error('Page cible introuvable pour rollback.'), { status: 404 });
    }

    const currentSnapshot = getSnapshotFromPage(currentPage);
    const currentHash = computeSnapshotHash(currentSnapshot);
    await saveBuilderRevision(client, {
      page: currentPage,
      snapshot: currentSnapshot,
      hash: currentHash,
      source: 'release-manager',
      action: 'before-rollback',
      candidateId: candidate.id,
      userId,
    });

    const restoredFields = normalizeValue(parseJsonIfNeeded(revision.snapshot));
    const restoredSnapshot = {
      id: currentPage.id,
      fields: {
        ...restoredFields,
        slug: restoredFields.slug || currentPage.slug,
      },
    };
    const restoredHash = computeSnapshotHash(restoredSnapshot);
    const page = await updatePageFromRelease(client, currentPage, restoredSnapshot, restoredHash, userId);

    await saveBuilderRevision(client, {
      page,
      snapshot: getSnapshotFromPage(page),
      hash: computeSnapshotHash(getSnapshotFromPage(page)),
      source: 'release-manager',
      action: 'after-rollback',
      candidateId: candidate.id,
      userId,
    });

    await client.query(
      `UPDATE public.builder_release_candidates
       SET status = 'rolled_back',
           rollback_by = $2,
           rollback_at = NOW(),
           rollback_reason = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [candidate.id, userId || null, reason],
    );

    await logReleaseEvent(client, {
      candidateId: candidate.id,
      eventType: 'rolled-back',
      userId,
      reason,
      metadata: {
        restored_revision_id: revision.id,
        restored_hash: restoredHash,
        previous_hash: currentHash,
      },
    });

    await client.query('COMMIT');
    return { page, restored_revision: revision.id, restored_hash: restoredHash };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function purgeReleaseHistory({ statuses = PROCESSED_STATUSES, olderThanDays = 0, dryRun = false } = {}, userId) {
  const cleanStatuses = statuses.filter((status) => PROCESSED_STATUSES.includes(status));
  if (cleanStatuses.length === 0) {
    throw Object.assign(new Error('Aucun statut traité valide à supprimer.'), { status: 400 });
  }

  const age = Number.isFinite(Number(olderThanDays)) ? Math.max(0, Number(olderThanDays)) : 0;
  const sql = `
    SELECT id, target_slug, status, created_at
    FROM public.builder_release_candidates
    WHERE deleted_at IS NULL
      AND status = ANY($1)
      AND created_at <= NOW() - ($2::int * INTERVAL '1 day')
    ORDER BY created_at DESC`;
  const candidates = await pool.query(sql, [cleanStatuses, age]);

  if (dryRun) {
    return { dry_run: true, count: candidates.rowCount, candidates: candidates.rows };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await logReleaseEvent(client, {
      candidateId: null,
      eventType: 'history-purged',
      userId,
      reason: `Suppression historique traité (${cleanStatuses.join(', ')})`,
      metadata: { statuses: cleanStatuses, older_than_days: age, count: candidates.rowCount },
    });
    const deleted = await client.query(
      `DELETE FROM public.builder_release_candidates
       WHERE deleted_at IS NULL
         AND status = ANY($1)
         AND created_at <= NOW() - ($2::int * INTERVAL '1 day')
       RETURNING id, target_slug, status, created_at`,
      [cleanStatuses, age],
    );
    await client.query('COMMIT');
    return { dry_run: false, count: deleted.rowCount, candidates: deleted.rows };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function publishReleasePackage(pkg, { userId, force = false, candidateId = null, expectedHash = null } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const incomingSnapshot = {
      id: pkg.page.id || null,
      fields: normalizeValue(pkg.page.fields),
    };
    const target = await findPageBySlugOrId(client, incomingSnapshot.id, incomingSnapshot.fields.slug, true);
    const currentSnapshot = target ? getSnapshotFromPage(target) : null;
    const currentHash = currentSnapshot ? computeSnapshotHash(currentSnapshot) : null;
    const baseHash = expectedHash || pkg.base?.hash || null;

    if (target && !force && baseHash && currentHash !== baseHash) {
      throw Object.assign(new Error('Conflit détecté: la page VPS a changé depuis le dry-run.'), {
        status: 409,
        details: { currentHash, expectedHash: baseHash },
      });
    }
    if (target && !force && !baseHash) {
      throw Object.assign(new Error('Publication bloquée: base_hash absent. Utilisez un forçage explicite.'), {
        status: 409,
      });
    }

    if (target) {
      await saveBuilderRevision(client, {
        page: target,
        snapshot: currentSnapshot,
        hash: currentHash,
        source: 'release-manager',
        action: force ? 'before-force-release' : 'before-release',
        candidateId,
        userId,
      });
    }

    const page = target
      ? await updatePageFromRelease(client, target, incomingSnapshot, pkg.checksum, userId)
      : await insertPageFromRelease(client, incomingSnapshot, pkg.checksum, userId);

    const afterSnapshot = getSnapshotFromPage(page);
    await saveBuilderRevision(client, {
      page,
      snapshot: afterSnapshot,
      hash: computeSnapshotHash(afterSnapshot),
      source: 'release-manager',
      action: 'after-release',
      candidateId,
      userId,
    });

    await client.query('COMMIT');
    return page;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function saveBuilderRevision(client, { page, snapshot, hash, source, action, candidateId, userId }) {
  if (!page || !snapshot || !hash) return;
  await client.query(
    `INSERT INTO public.builder_page_revisions
       (page_id, revision, content_hash, snapshot, source, action, release_candidate_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      page.id,
      page.builder_revision || page.version || page.version_number || 1,
      hash,
      JSON.stringify(snapshot.fields),
      source,
      action,
      candidateId,
      userId || null,
    ],
  );
}

async function updatePageFromRelease(client, currentPage, snapshot, contentHash, userId) {
  const fields = snapshot.fields;
  const setClauses = [];
  const values = [];

  for (const field of PAGE_RELEASE_FIELDS) {
    if (field === 'slug' || Object.prototype.hasOwnProperty.call(fields, field)) {
      values.push(serializeFieldValue(field, fields[field]));
      setClauses.push(`${field} = $${values.length}`);
    }
  }

  values.push(contentHash);
  const hashParam = values.length;
  values.push(userId || null);
  const userParam = values.length;
  values.push(snapshot.id || currentPage.id);
  const originParam = values.length;
  values.push(fields.slug);
  const originSlugParam = values.length;
  values.push(currentPage.id);
  const pageParam = values.length;

  const result = await client.query(
    `UPDATE public.pages
     SET ${setClauses.join(', ')},
         builder_revision = COALESCE(builder_revision, 1) + 1,
         builder_content_hash = $${hashParam},
         builder_base_content_hash = $${hashParam},
         builder_base_revision = COALESCE(builder_revision, 1) + 1,
         builder_origin_page_id = $${originParam},
         builder_origin_slug = $${originSlugParam},
         builder_last_release_at = NOW(),
         builder_last_release_by = $${userParam},
         builder_source_environment = 'release-manager',
         updated_by = COALESCE($${userParam}, updated_by),
         updated_at = NOW()
     WHERE id = $${pageParam}
     RETURNING *`,
    values,
  );

  return result.rows[0];
}

async function insertPageFromRelease(client, snapshot, contentHash, userId) {
  const fields = snapshot.fields;
  const insertFields = PAGE_RELEASE_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(fields, field),
  );
  const columns = [...insertFields];
  const values = insertFields.map((field) => serializeFieldValue(field, fields[field]));

  if (snapshot.id) {
    columns.unshift('id');
    values.unshift(snapshot.id);
  }

  columns.push(
    'builder_revision',
    'builder_content_hash',
    'builder_base_content_hash',
    'builder_base_revision',
    'builder_origin_page_id',
    'builder_origin_slug',
    'builder_last_release_at',
    'builder_last_release_by',
    'builder_source_environment',
    'created_by',
    'updated_by',
    'created_at',
    'updated_at',
  );
  values.push(
    1,
    contentHash,
    contentHash,
    1,
    snapshot.id || null,
    fields.slug,
    new Date(),
    userId || null,
    'release-manager',
    userId || null,
    userId || null,
    new Date(),
    new Date(),
  );

  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await client.query(
    `INSERT INTO public.pages (${columns.join(', ')})
     VALUES (${placeholders.join(', ')})
     RETURNING *`,
    values,
  );
  return result.rows[0];
}

module.exports = {
  exportPageRelease,
  analyzeReleasePackage,
  importReleasePackage,
  listReleaseCandidates,
  getReleaseCandidate,
  publishReleaseCandidate,
  rejectReleaseCandidate,
  rollbackReleaseCandidate,
  purgeReleaseHistory,
};
