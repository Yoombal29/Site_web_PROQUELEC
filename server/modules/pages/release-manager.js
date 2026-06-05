const crypto = require('crypto');
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
  if (pkg.checksum && pkg.checksum !== computed) {
    throw Object.assign(new Error('Checksum du package invalide'), {
      status: 400,
      details: { expected: computed, received: pkg.checksum },
    });
  }

  return {
    ...pkg,
    checksum: computed,
  };
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
    can_publish: !conflict,
    conflict_reason: conflict
      ? 'La page VPS a changé depuis la base utilisée par le package local.'
      : null,
    diff_summary: diffSummary,
  };
}

async function createReleaseCandidate(rawPackage, userId, analysisOverride = null) {
  const pkg = normalizePackageInput(rawPackage);
  const analysis = analysisOverride || (await analyzeReleasePackage(pkg));
  const status = analysis.conflict ? 'conflict' : 'candidate';
  const result = await pool.query(
    `INSERT INTO public.builder_release_candidates
       (target_page_id, target_slug, package, package_hash, base_hash, base_revision,
        current_hash, current_revision, status, conflict_reason, diff_summary, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      analysis.conflict_reason,
      JSON.stringify(analysis.diff_summary || {}),
      userId || null,
    ],
  );

  return result.rows[0];
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
    LEFT JOIN public.pages p ON p.id = c.target_page_id`;

  if (status) {
    params.push(status);
    sql += ` WHERE c.status = $${params.length}`;
  }

  sql += ' ORDER BY c.created_at DESC LIMIT 100';
  const result = await pool.query(sql, params);
  return result.rows;
}

async function getReleaseCandidate(id) {
  const result = await pool.query('SELECT * FROM public.builder_release_candidates WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function importReleasePackage(rawPackage, userId, mode = 'stage') {
  const pkg = normalizePackageInput(rawPackage);
  const analysis = await analyzeReleasePackage(pkg);

  if (mode === 'safe-apply' && !analysis.conflict) {
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

async function rejectReleaseCandidate(id, userId) {
  const result = await pool.query(
    `UPDATE public.builder_release_candidates
     SET status = 'rejected', updated_at = NOW()
     WHERE id = $1 AND status IN ('candidate', 'conflict')
     RETURNING *, $2::uuid AS rejected_by`,
    [id, userId || null],
  );
  return result.rows[0] || null;
}

async function publishReleaseCandidate(id, { userId, force = false } = {}) {
  const candidate = await getReleaseCandidate(id);
  if (!candidate) throw Object.assign(new Error('Candidat introuvable'), { status: 404 });
  if (!['candidate', 'conflict'].includes(candidate.status)) {
    throw Object.assign(new Error('Ce candidat ne peut plus être publié'), { status: 409 });
  }

  const pkg = normalizePackageInput(candidate.package);
  const page = await publishReleasePackage(pkg, {
    userId,
    force,
    candidateId: candidate.id,
    expectedHash: candidate.current_hash || null,
  });

  await pool.query(
    `UPDATE public.builder_release_candidates
     SET status = 'published', target_page_id = $2, published_by = $3, published_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [candidate.id, page.id, userId || null],
  );

  return page;
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
};
