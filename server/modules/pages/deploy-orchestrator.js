const crypto = require('crypto');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_BRANCH = process.env.DEPLOY_BRANCH || 'chore/remove-unused-docker-services';
const DEFAULT_TARGET_BASE_URL = process.env.DEPLOY_TARGET_BASE_URL || 'https://www.proquelec.sn';
const DEFAULT_PM2_APP = process.env.DEPLOY_PM2_APP || 'proquelec-api';
const MAX_JOBS = 20;
const MAX_LOG_LINES = 600;

const jobs = new Map();

function now() {
  return new Date().toISOString();
}

function createId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

function appendLog(job, message, level = 'info') {
  const lines = String(message || '')
    .replace(/\r/g, '')
    .split('\n')
    .filter(Boolean);

  for (const line of lines) {
    job.logs.push({ at: now(), level, message: line });
  }

  if (job.logs.length > MAX_LOG_LINES) {
    job.logs.splice(0, job.logs.length - MAX_LOG_LINES);
  }
  job.updated_at = now();
}

function serializeJob(job, includeLogs = true) {
  if (!job) return null;
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    title: job.title,
    created_at: job.created_at,
    updated_at: job.updated_at,
    finished_at: job.finished_at || null,
    started_by: job.started_by || null,
    summary: job.summary || null,
    error: job.error || null,
    logs: includeLogs ? job.logs : undefined,
  };
}

function trimJobs() {
  const ordered = Array.from(jobs.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  for (const job of ordered.slice(MAX_JOBS)) {
    if (job.status !== 'running' && job.status !== 'queued') {
      jobs.delete(job.id);
    }
  }
}

function createJob(type, title, startedBy) {
  const job = {
    id: createId(),
    type,
    title,
    status: 'queued',
    created_at: now(),
    updated_at: now(),
    finished_at: null,
    started_by: startedBy || null,
    summary: null,
    error: null,
    logs: [],
  };
  jobs.set(job.id, job);
  trimJobs();
  return job;
}

function runAsyncJob(job, runner) {
  setImmediate(async () => {
    job.status = 'running';
    job.updated_at = now();
    appendLog(job, `Demarrage du job ${job.id}`);

    try {
      const summary = await runner(job);
      job.status = 'succeeded';
      job.summary = summary || null;
      appendLog(job, 'Job termine avec succes', 'success');
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      appendLog(job, job.error, 'error');
    } finally {
      job.finished_at = now();
      job.updated_at = job.finished_at;
    }
  });
}

function listJobs() {
  return Array.from(jobs.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((job) => serializeJob(job, false));
}

function getJob(jobId) {
  return serializeJob(jobs.get(jobId), true);
}

function hasRunningCodeDeploy() {
  return Array.from(jobs.values()).some(
    (job) => job.type === 'code-deploy' && ['queued', 'running'].includes(job.status),
  );
}

function buildUrl(baseUrl, pathname) {
  const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${cleanBase}${cleanPath}`;
}

function normalizeBaseUrl(value, fallback) {
  const raw = String(value || fallback || '').trim().replace(/\/+$/, '');
  if (!raw) throw new Error('URL de base manquante');
  return raw;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiRequest(job, { baseUrl, pathname, method = 'GET', token, body }) {
  const url = buildUrl(baseUrl, pathname);
  appendLog(job, `${method} ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object'
          ? payload.message || payload.error || `${response.status} ${response.statusText}`
          : `${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function pageRef(page) {
  return encodeURIComponent(page.id || page.slug || page);
}

async function runPagesDeploy(job, options) {
  const sourceBaseUrl = normalizeBaseUrl(options.sourceBaseUrl, options.currentBaseUrl);
  const targetBaseUrl = normalizeBaseUrl(options.targetBaseUrl, DEFAULT_TARGET_BASE_URL);
  const sourceToken = options.sourceToken || options.currentToken;
  const targetToken = options.targetToken || options.currentToken;

  if (!sourceToken) throw new Error('Token source requis');
  if (!targetToken) throw new Error('Token cible requis');

  appendLog(job, `Source: ${sourceBaseUrl}`);
  appendLog(job, `Cible: ${targetBaseUrl}`);
  appendLog(job, `Mode demande: ${options.mode}`);

  let pagesToDeploy = [];
  if (options.allPages) {
    const pages = await apiRequest(job, {
      baseUrl: sourceBaseUrl,
      pathname: '/api/admin/pages',
      token: sourceToken,
    });
    pagesToDeploy = Array.isArray(pages)
      ? pages.filter((page) => page.slug)
      : [];
  } else if (options.page) {
    pagesToDeploy = [{ slug: options.page }];
  }

  if (pagesToDeploy.length === 0) {
    throw new Error('Aucune page Builder a deployer');
  }

  appendLog(job, `${pagesToDeploy.length} page(s) a traiter`);

  let success = 0;
  let failed = 0;
  const results = [];

  for (const page of pagesToDeploy) {
    const ref = pageRef(page);
    const label = page.slug || page.id || ref;
    appendLog(job, `--- Page: ${label} ---`);

    try {
      const releasePackage = await apiRequest(job, {
        baseUrl: sourceBaseUrl,
        pathname: `/api/admin/pages/${ref}/release/export?environment=local`,
        token: sourceToken,
      });

      if (!releasePackage || !releasePackage.checksum) {
        throw new Error('Package export invalide: checksum absent');
      }

      appendLog(
        job,
        `Package: ${releasePackage.page?.title || label} /${releasePackage.page?.slug || label}`,
      );

      let analysis = null;
      try {
        analysis = await apiRequest(job, {
          baseUrl: targetBaseUrl,
          pathname: '/api/admin/pages/release/analyze',
          method: 'POST',
          token: targetToken,
          body: { package: releasePackage },
        });
        appendLog(
          job,
          analysis.can_publish
            ? 'Dry-run cible: publication safe possible'
            : `Dry-run cible: candidat requis (${analysis.conflict_reason || 'controle bloque'})`,
          analysis.can_publish ? 'success' : 'warn',
        );
      } catch (error) {
        appendLog(
          job,
          `Analyse cible indisponible, import candidat uniquement: ${
            error instanceof Error ? error.message : String(error)
          }`,
          'warn',
        );
      }

      const finalMode =
        options.mode === 'safe-apply' && analysis && analysis.can_publish ? 'safe-apply' : 'stage';
      const imported = await apiRequest(job, {
        baseUrl: targetBaseUrl,
        pathname: '/api/admin/pages/release/import',
        method: 'POST',
        token: targetToken,
        body: { package: releasePackage, mode: finalMode },
      });

      success += 1;
      results.push({
        page: releasePackage.page?.slug || label,
        mode: imported?.mode || finalMode,
        candidate_id: imported?.candidate?.id || null,
      });
      appendLog(
        job,
        imported?.mode === 'published'
          ? `Publiee: /${imported.page?.slug || releasePackage.page?.slug || label}`
          : `Candidat cree: ${imported?.candidate?.id || 'id non retourne'}`,
        'success',
      );
    } catch (error) {
      failed += 1;
      appendLog(job, `Echec ${label}: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }

  if (failed > 0) {
    throw Object.assign(new Error(`${failed} page(s) en echec, ${success} reussie(s)`), {
      summary: { success, failed, results },
    });
  }

  return { success, failed, results };
}

function runCommand(job, command, args, options = {}) {
  return new Promise((resolve, reject) => {
    appendLog(job, `$ ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      cwd: options.cwd || WORKSPACE_ROOT,
      env: { ...process.env, ...(options.env || {}) },
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      appendLog(job, text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      appendLog(job, text, 'warn');
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(' ')} a echoue avec le code ${code}`));
      }
    });
  });
}

async function runPowerShellDeploy(job, options) {
  const scriptPath = path.join(WORKSPACE_ROOT, 'deploy.ps1');
  const args = [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-SkipCommit',
    '-Branch',
    options.branch,
  ];

  if (options.skipBuild) args.push('-SkipBuild');

  await runCommand(job, 'powershell.exe', args, { cwd: WORKSPACE_ROOT });
  return { strategy: 'deploy.ps1', branch: options.branch, skipBuild: options.skipBuild };
}

async function runNativeCodeDeploy(job, options) {
  const branch = options.branch || DEFAULT_BRANCH;
  appendLog(job, `Workspace: ${WORKSPACE_ROOT}`);
  appendLog(job, `Branche: ${branch}`);

  const status = await runCommand(job, 'git', ['status', '--porcelain', '--untracked-files=no']);
  if (status.stdout.trim()) {
    throw new Error('Le workspace contient des fichiers suivis modifies. Deploy refuse.');
  }

  await runCommand(job, 'git', ['fetch', 'origin', branch]);
  await runCommand(job, 'git', ['pull', '--ff-only', 'origin', branch]);

  if (options.runInstall) {
    await runCommand(job, 'npm', ['ci']);
  } else {
    appendLog(job, 'npm ci ignore par option', 'warn');
  }

  if (options.runMigrations) {
    await runCommand(job, 'npm', ['run', 'migrate:auto']);
  } else {
    appendLog(job, 'migrations ignorees par option', 'warn');
  }

  if (!options.skipBuild) {
    await runCommand(job, 'npm', ['run', 'build'], {
      env: { NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=4096' },
    });
  } else {
    appendLog(job, 'build ignore par option', 'warn');
  }

  if (options.restartPm2) {
    await runCommand(job, 'pm2', ['restart', options.pm2App || DEFAULT_PM2_APP, '--update-env']);
  } else {
    appendLog(job, 'redemarrage PM2 ignore par option', 'warn');
  }

  return {
    strategy: 'native',
    branch,
    install: options.runInstall,
    migrations: options.runMigrations,
    build: !options.skipBuild,
    restart_pm2: options.restartPm2,
  };
}

async function runCodeDeploy(job, options) {
  if (options.strategy === 'script' || (options.strategy === 'auto' && os.platform() === 'win32')) {
    return runPowerShellDeploy(job, options);
  }

  return runNativeCodeDeploy(job, options);
}

function startPagesDeploy(options, startedBy) {
  const title = options.allPages
    ? 'Deploiement pages Builder: toutes les pages'
    : `Deploiement page Builder: ${options.page}`;
  const job = createJob('pages-deploy', title, startedBy);
  runAsyncJob(job, (runningJob) => runPagesDeploy(runningJob, options));
  return serializeJob(job);
}

function startCodeDeploy(options, startedBy) {
  if (hasRunningCodeDeploy()) {
    const error = new Error('Un deploiement code est deja en cours');
    error.status = 409;
    throw error;
  }

  const job = createJob('code-deploy', `Deploiement code: ${options.branch}`, startedBy);
  runAsyncJob(job, (runningJob) => runCodeDeploy(runningJob, options));
  return serializeJob(job);
}

module.exports = {
  DEFAULT_BRANCH,
  DEFAULT_TARGET_BASE_URL,
  listJobs,
  getJob,
  startPagesDeploy,
  startCodeDeploy,
};
