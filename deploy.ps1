# PROQUELEC - Deploiement CODE vers le VPS
# Usage:
#   .\deploy.ps1
#   .\deploy.ps1 -Message "Correction builder"
#   .\deploy.ps1 -Message "Correction builder" -CommitAll
#   .\deploy.ps1 -SkipCommit
#
# Fonction:
#   Ce script deploie le CODE applicatif uniquement:
#   1. commit/push GitHub depuis le poste local,
#   2. pull Git sur le VPS,
#   3. installation des dependances et migrations sur le VPS,
#   4. build Vite sur le VPS,
#   5. redemarrage PM2 de l'API et verification HTTP rapide.
#
# Important:
#   - Ne deploie pas les pages builder ni le contenu de la base.
#   - Pour les pages builder, utiliser .\deploypage.ps1.
#   - Le script refuse de pull si le VPS a des fichiers suivis modifies.
#     Les fichiers non suivis du VPS, comme uploads/backups, sont ignores.
#   - Par defaut, le script commit seulement les fichiers deja stages.
#     Utiliser -CommitAll pour faire git add -A avant commit.

param(
    [string]$Message = "",
    [string]$Branch = "chore/remove-unused-docker-services",
    [switch]$SkipCommit,
    [switch]$CommitAll,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$SSH_KEY = "$env:USERPROFILE\.ssh\gem_vps"
$SSH_HOST = "root@proquelec.sn"
$REMOTE_PATH = "/var/www/proquelec/www.proquelec.sn"
$PM2_APP = "proquelec-api"
$SITE_URL = "https://www.proquelec.sn"

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
Write-Host "  === PROQUELEC DEPLOY CODE ===" -ForegroundColor Cyan
Write-Host "  Branche: $Branch"
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

    Invoke-Checked "[1/5] Commit local" {
        git commit -m "$Message"
        if ($LASTEXITCODE -eq 1) {
            Write-Host "  Aucun changement a committer, on continue." -ForegroundColor DarkYellow
            $global:LASTEXITCODE = 0
        }
    }
}
else {
    Write-Host "  [1/5] Commit local ignore (-SkipCommit)" -ForegroundColor DarkYellow
}

Invoke-Checked "[2/5] Push vers GitHub" {
    git push origin $Branch
}

Write-Host ""
Write-Host "  [3/5] Verification du workspace VPS" -ForegroundColor Yellow
$remoteStatus = Invoke-Remote "cd $REMOTE_PATH && git status --porcelain --untracked-files=no"
if ($LASTEXITCODE -ne 0) {
    Stop-Step "Impossible de lire le statut Git du VPS."
}
if ($remoteStatus) {
    Write-Host $remoteStatus
    Stop-Step "Le VPS contient des fichiers suivis modifies. Committer/nettoyer sur le VPS avant deploy."
}

Invoke-Checked "[3/6] Pull code sur le VPS" {
    Invoke-Remote "cd $REMOTE_PATH && git pull origin $Branch"
}

Invoke-Checked "[4/6] Installation dependances et migrations" {
    Invoke-Remote "cd $REMOTE_PATH && npm ci && npm run migrate:auto"
}

if (-not $SkipBuild) {
    Invoke-Checked "[5/6] Build production sur le VPS" {
        Invoke-Remote "cd $REMOTE_PATH && env NODE_OPTIONS=--max-old-space-size=4096 npm run build"
    }
}
else {
    Write-Host "  [5/6] Build ignore (-SkipBuild)" -ForegroundColor DarkYellow
}

# RAG: Regenerer le cache des embeddings sur le VPS
Write-Host ""
Write-Host "  [RAG] Generation du cache vectoriel..." -ForegroundColor Yellow
$ragResult = Invoke-Remote "cd $REMOTE_PATH && node scripts/generate-embeddings.mjs 2>&1 | tail -3"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  RAG: $ragResult" -ForegroundColor Green
}
else {
    Write-Host "  RAG: $ragResult" -ForegroundColor DarkYellow
    Write-Host "  (le RAG sera genere au premier demarrage du serveur)" -ForegroundColor DarkYellow
}

Invoke-Checked "[6/6] Redemarrage PM2" {
    Invoke-Remote "pm2 restart $PM2_APP --update-env"
}

Write-Host ""
Write-Host "  Verification HTTP..." -ForegroundColor Yellow
Invoke-Remote "curl -s -o /dev/null -w 'site:%{http_code}\napi_pages:%{http_code}\n' $SITE_URL/ $SITE_URL/api/pages"
if ($LASTEXITCODE -ne 0) {
    Stop-Step "Verification HTTP echouee."
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT CODE TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Site: $SITE_URL"
Write-Host "  Admin release pages: $SITE_URL/admin/builder-release-manager"
Write-Host ""
