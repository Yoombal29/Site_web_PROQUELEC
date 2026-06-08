const service = require('./pages.service');
const releaseManager = require('./release-manager');
const { handleAppError } = require('../../core/errors');

async function listPages(req, res) {
  try {
    const pages = await service.listPages();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPage(req, res) {
  try {
    const { slug } = req.params;
    const page = await service.getPage(slug);
    res.json(page);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function getPageById(req, res) {
  try {
    const page = await service.getPageById(req.params.id);
    res.json(page);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function createPage(req, res) {
  try {
    const { title, slug, content, is_published, meta_description, meta_keywords } = req.body;
    const page = await service.createPage({
      title,
      slug,
      content,
      is_published,
      meta_description,
      meta_keywords,
    });
    res.status(201).json(page);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function updatePage(req, res) {
  try {
    const page = await service.updatePage(req.params.id, req.body);
    res.json(page);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function deletePage(req, res) {
  try {
    await service.deletePage(req.params.id);
    res.json({ success: true });
  } catch (err) {
    handleAppError(err, res);
  }
}

async function adminGetPage(req, res) {
  try {
    const page = await service.adminGetPage(req.params.id);
    res.json(page);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function adminUpdatePage(req, res) {
  try {
    const page = await service.adminUpdatePage(req.params.id, req.body, req.user?.id);
    res.json(page);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function getPageVersion(req, res) {
  try {
    const ver = await service.getPageVersion(req.params.id, req.params.version);
    res.json(ver);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function seedHomepage(req, res) {
  try {
    const result = await service.seedHomepage();
    res.json({ success: true, ...result });
  } catch (err) {
    handleAppError(err, res);
  }
}

// --- Menu ---
async function listMenuItems(req, res) {
  try {
    const items = await service.listMenuItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createMenuItem(req, res) {
  try {
    const item = await service.createMenuItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateMenuItem(req, res) {
  try {
    const item = await service.updateMenuItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMenuItem(req, res) {
  try {
    await service.deleteMenuItem(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Construction Mode ---
async function getConstructionMode(req, res) {
  try {
    const mode = await service.getConstructionMode();
    res.json(mode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function setConstructionMode(req, res) {
  try {
    const { is_enabled } = req.body;
    const mode = await service.setConstructionMode(is_enabled, req.user.id);
    res.json(mode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Draft Autosave ---
async function saveDraft(req, res) {
  try {
    const { draft_json } = req.body;
    const result = await service.saveDraft(req.params.id, draft_json);
    res.json(result);
  } catch (err) {
    handleAppError(err, res);
  }
}

// --- Named Versions (Checkpoints) ---
async function createNamedVersion(req, res) {
  try {
    const { version_name, structure_json } = req.body;
    if (!version_name || !structure_json) {
      return res.status(400).json({ error: 'version_name and structure_json are required' });
    }
    const result = await service.createNamedVersion(
      req.params.id,
      version_name,
      structure_json,
      req.user?.email || req.user?.id || 'admin',
    );
    res.status(201).json(result);
  } catch (err) {
    handleAppError(err, res);
  }
}

async function listNamedVersions(req, res) {
  try {
    const versions = await service.listNamedVersions(req.params.id);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getNamedVersionById(req, res) {
  try {
    const ver = await service.getNamedVersion(req.params.versionId);
    res.json(ver);
  } catch (err) {
    handleAppError(err, res);
  }
}

// --- Theme Config ---
async function saveThemeConfig(req, res) {
  try {
    const { theme_config } = req.body;
    const result = await service.saveThemeConfig(req.params.id, theme_config);
    res.json(result);
  } catch (err) {
    handleAppError(err, res);
  }
}

function handleReleaseError(err, res) {
  console.error('[BUILDER-RELEASE]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur Release Manager',
    details: err.details || undefined,
  });
}

async function exportPageRelease(req, res) {
  try {
    const pkg = await releaseManager.exportPageRelease(
      req.params.id,
      req.user,
      req.query.environment || process.env.APP_ENV || process.env.NODE_ENV || 'local',
    );
    res.json(pkg);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function analyzePageRelease(req, res) {
  try {
    const analysis = await releaseManager.analyzeReleasePackage(req.body.package);
    res.json(analysis);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function importPageRelease(req, res) {
  try {
    const result = await releaseManager.importReleasePackage(
      req.body.package,
      req.user?.id,
      req.body.mode || 'stage',
    );
    res.status(result.mode === 'published' ? 200 : 201).json(result);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function listReleaseCandidates(req, res) {
  try {
    const candidates = await releaseManager.listReleaseCandidates({
      status: req.query.status,
    });
    res.json(candidates);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function getReleaseCandidate(req, res) {
  try {
    const candidate = await releaseManager.getReleaseCandidate(req.params.candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidat introuvable' });
    res.json(candidate);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function publishReleaseCandidate(req, res) {
  try {
    const page = await releaseManager.publishReleaseCandidate(req.params.candidateId, {
      userId: req.user?.id,
      force: req.body.force === true,
      reason: req.body.reason,
    });
    res.json({ success: true, page });
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function rejectReleaseCandidate(req, res) {
  try {
    const candidate = await releaseManager.rejectReleaseCandidate(
      req.params.candidateId,
      req.user?.id,
      req.body?.reason,
    );
    if (!candidate) return res.status(404).json({ error: 'Candidat introuvable ou déjà finalisé' });
    res.json(candidate);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function rollbackReleaseCandidate(req, res) {
  try {
    const result = await releaseManager.rollbackReleaseCandidate(req.params.candidateId, {
      userId: req.user?.id,
      reason: req.body.reason,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    handleReleaseError(err, res);
  }
}

async function purgeReleaseHistory(req, res) {
  try {
    const result = await releaseManager.purgeReleaseHistory(
      {
        statuses: req.body.statuses,
        olderThanDays: req.body.older_than_days,
        dryRun: req.body.dry_run === true,
      },
      req.user?.id,
    );
    res.json(result);
  } catch (err) {
    handleReleaseError(err, res);
  }
}

module.exports = {
  listPages,
  getPage,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  adminGetPage,
  adminUpdatePage,
  getPageVersion,
  seedHomepage,
  saveDraft,
  createNamedVersion,
  listNamedVersions,
  getNamedVersionById,
  saveThemeConfig,
  exportPageRelease,
  analyzePageRelease,
  importPageRelease,
  listReleaseCandidates,
  getReleaseCandidate,
  publishReleaseCandidate,
  rejectReleaseCandidate,
  rollbackReleaseCandidate,
  purgeReleaseHistory,
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getConstructionMode,
  setConstructionMode,
};
