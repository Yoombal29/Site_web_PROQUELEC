# PROQUELEC - Deploiement CODE vers le VPS
# Usage:
#   .\deploy.ps1
#   .\deploy.ps1 -Message "Correction builder"
#   .\deploy.ps1 -Message "Correction builder" -CommitAll
#   .\deploy.ps1 -SkipCommit
#   .\deploy.ps1 -SkipCommit -SkipBuild
#   .\deploy.ps1 -SkipCommit -SkipDockerBuild
#
# Fonction:
#   Ce script deploie le CODE applicatif uniquement:
#   1. commit/push GitHub depuis le poste local,
#   2. verification que le workspace VPS n'a pas de fichiers suivis modifies,
#   3. pull Git sur le VPS,
#   4. installation des dependances et migrations sur le VPS,
#   5. build Vite de validation sur le VPS,
#   6. build de l'image Docker applicative,
#   7. recreation du conteneur Docker proquelec-app et verification HTTP.
#
# Important:
#   - Ne copie pas et n'ecrase pas la base de donnees.
#   - Ne deploie pas les pages builder/contenus DB par lui-meme.
#   - Pour un alignement complet de donnees, faire une procedure DB explicite.
#   - Le script refuse de pull si le VPS a des fichiers suivis modifies.
#     Les fichiers non suivis du VPS, comme uploads/backups, sont ignores.
#   - Par defaut, le script commit seulement les fichiers deja stages.
#     Utiliser -CommitAll pour faire git add -A avant commit.
#   - Attention: -CommitAll peut embarquer des fichiers locaux indesirables si
#     le .gitignore n'est pas strict. Preferer git add cible.

param(
    [string]$Message = "",
    [string]$Branch = "main",
    [switch]$SkipCommit,
    [switch]$CommitAll,
    [switch]$SkipBuild,
    [switch]$SkipDockerBuild,
    [string]$DockerApp = "proquelec-app",
    [string]$DockerImage = "wwwproquelecsn_app-backend:latest",
    [string]$DockerNetwork = "host",
    [string]$AppPort = "3000"
)

$ErrorActionPreference = "Stop"

$SSH_KEY = "$env:USERPROFILE\.ssh\gem_vps"
$SSH_HOST = "root@proquelec.sn"
$REMOTE_PATH = "/var/www/proquelec/www.proquelec.sn"
$SITE_URL = "https://www.proquelec.sn"
$REMOTE_CHANGED_MIGRATIONS = "/tmp/proquelec_changed_migrations.txt"

function Stop-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "  ERREUR: $Message" -ForegroundColor Red
    exit 1
}

function Invoke-Checked {
    param(
        [string]$Label,
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "  $Label" -ForegroundColor Yellow
    & $Command
    if ($LASTEXITCODE -ne 0) {
        Stop-Step "$Label a echoue."
    }
}

function Invoke-Remote {
    param([string]$Command)
    ssh -i $SSH_KEY $SSH_HOST $Command
}

Write-Host ""
Write-Host "  === PROQUELEC DEPLOY CODE / DOCKER ===" -ForegroundColor Cyan
Write-Host "  Branche: $Branch"
Write-Host "  Docker app: $DockerApp"
Write-Host "  Docker image: $DockerImage"
Write-Host ""

if (-not (Test-Path $SSH_KEY)) {
    Stop-Step "Cle SSH introuvable: $SSH_KEY"
}

if (-not $SkipCommit) {
    if ($CommitAll) {
        Write-Host "  CommitAll actif: git add -A sera execute." -ForegroundColor DarkYellow
        git add -A
        if ($LASTEXITCODE -ne 0) {
            Stop-Step "git add -A a echoue."
        }
    }
    else {
        git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Aucun fichier stage pour le commit." -ForegroundColor DarkYellow
            Write-Host "  Utiliser d'abord: git add <fichiers>" -ForegroundColor DarkYellow
            Write-Host "  Ou lancer: .\deploy.ps1 -CommitAll" -ForegroundColor DarkYellow
            Stop-Step "Commit local impossible sans fichiers stages."
        }
    }

    if (-not $Message) {
        $Message = Read-Host "  Message de commit"
    }
    if (-not $Message) {
        $Message = "Mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }

    Invoke-Checked "[1/8] Commit local" {
        git commit -m "$Message"
        if ($LASTEXITCODE -eq 1) {
            Write-Host "  Aucun changement a committer, on continue." -ForegroundColor DarkYellow
            $global:LASTEXITCODE = 0
        }
    }
}
else {
    Write-Host "  [1/8] Commit local ignore (-SkipCommit)" -ForegroundColor DarkYellow
}

Invoke-Checked "[2/8] Push vers GitHub" {
    git push origin $Branch
}

Write-Host ""
Write-Host "  [3/8] Verification du workspace VPS" -ForegroundColor Yellow
$remoteStatus = Invoke-Remote "cd $REMOTE_PATH && git status --porcelain --untracked-files=no"
if ($LASTEXITCODE -ne 0) {
    Stop-Step "Impossible de lire le statut Git du VPS."
}
if ($remoteStatus) {
    Write-Host $remoteStatus
    Stop-Step "Le VPS contient des fichiers suivis modifies. Committer/nettoyer sur le VPS avant deploy."
}

Invoke-Checked "[4/8] Pull code sur le VPS" {
    Invoke-Remote "cd $REMOTE_PATH && BEFORE=`$(git rev-parse HEAD) && git pull origin $Branch && AFTER=`$(git rev-parse HEAD) && git diff --name-only `$BEFORE `$AFTER -- 'corpus-db/migrations/*.sql' 'server/migrations/*.sql' > $REMOTE_CHANGED_MIGRATIONS"
}

Invoke-Checked "[5/8] Installation dependances et migrations" {
    Invoke-Remote "cd $REMOTE_PATH && npm ci && npm run migrate:auto && node scripts/apply-active-db-migrations.mjs `$(cat $REMOTE_CHANGED_MIGRATIONS 2>/dev/null)"
}

if (-not $SkipBuild) {
    Invoke-Checked "[6/8] Build Vite de validation sur le VPS" {
        Invoke-Remote "cd $REMOTE_PATH && env NODE_OPTIONS=--max-old-space-size=4096 npm run build"
    }
}
else {
    Write-Host "  [6/8] Build Vite ignore (-SkipBuild)" -ForegroundColor DarkYellow
}

if (-not $SkipDockerBuild) {
    Invoke-Checked "[7/8] Build image Docker" {
        Invoke-Remote "cd $REMOTE_PATH && docker build -t $DockerImage ."
    }
}
else {
    Write-Host "  [7/8] Build Docker ignore (-SkipDockerBuild)" -ForegroundColor DarkYellow
}

Invoke-Checked "[8/8] Recreation du conteneur Docker" {
    Invoke-Remote "cd $REMOTE_PATH && test -f .env || { echo '.env introuvable'; exit 1; }; docker stop $DockerApp >/dev/null 2>&1 || true; docker rm $DockerApp >/dev/null 2>&1 || true; docker run -d --name $DockerApp --restart unless-stopped --network $DockerNetwork --env-file .env -e NODE_ENV=production -e PORT=$AppPort $DockerImage"
}

# RAG: Regenerer le cache des embeddings sur le VPS.
# Non bloquant: si le cache n'existe pas encore, l'application reste deployee.
Write-Host ""
Write-Host "  [RAG] Generation du cache vectoriel..." -ForegroundColor Yellow
$ragResult = Invoke-Remote "cd $REMOTE_PATH && node scripts/generate-embeddings.mjs 2>&1 | tail -3"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  RAG: $ragResult" -ForegroundColor Green
}
else {
    Write-Host "  RAG: $ragResult" -ForegroundColor DarkYellow
    Write-Host "  (non bloquant)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "  Verification Docker..." -ForegroundColor Yellow
Invoke-Remote "docker ps --filter name=^/$DockerApp`$ --format 'docker:{{.Names}} {{.Status}}'"
if ($LASTEXITCODE -ne 0) {
    Stop-Step "Verification Docker echouee."
}

Write-Host ""
Write-Host "  Verification HTTP..." -ForegroundColor Yellow
Invoke-Remote "curl -s -o /dev/null -w 'site:%{http_code}\napi_pages:%{http_code}\nevents:%{http_code}\ndocuments:%{http_code}\n' $SITE_URL/ $SITE_URL/api/pages $SITE_URL/events $SITE_URL/documents"
if ($LASTEXITCODE -ne 0) {
    Stop-Step "Verification HTTP echouee."
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT CODE / DOCKER TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Site: $SITE_URL"
Write-Host "  Conteneur: $DockerApp"
Write-Host "  Image: $DockerImage"
Write-Host "  Admin release pages: $SITE_URL/admin/builder-release-manager"
Write-Host ""
