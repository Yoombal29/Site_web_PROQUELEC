# PROQUELEC - Deploiement CODE vers le VPS
#
# Resume en clair:
#   .\deploy.ps1 sert a publier les modifications du SITE, pas les donnees.
#   Il envoie le code vers GitHub, met a jour le VPS, rebuild Docker,
#   redemarre l'application et verifie que les pages publiques repondent.
#
# Ce que ce script deploie:
#   - fichiers de code: src/, server/, scripts/, composants, routes, styles,
#   - migrations SQL versionnees dans corpus-db/migrations ou server/migrations,
#   - configuration projet versionnee, documentation et assets suivis par Git,
#   - image Docker applicative reconstruite a partir du code.
#
# Ce que ce script NE deploie PAS:
#   - base de donnees locale vers le VPS,
#   - contenus CMS/builder stockes en base,
#   - utilisateurs, evenements, pages, demandes contact stockes en base,
#   - uploads ou medias non versionnes,
#   - secrets .env.
#
# Pour transferer ou ecraser les contenus CMS, il faut une procedure DB separee
# et explicite: dump local, sauvegarde VPS, restore VPS, puis verification.
#
# Usage:
#   .\deploy.ps1
#      Mode assistant: explique les choix, pose les questions, puis execute.
#
#   .\deploy.ps1 -Message "Correction builder"
#      Mode direct: git add securise, commit, push, pull VPS, migrations,
#      build Vite, build Docker, restart conteneur, verification HTTP.
#
#   .\deploy.ps1 -SkipCommit
#      Deploie un commit deja pret sans creer de nouveau commit local.
#
#   .\deploy.ps1 -SkipCommit -SkipBuild
#      Deploie sans build Vite de validation hors Docker.
#
#   .\deploy.ps1 -SkipCommit -SkipDockerBuild
#      Redemarre avec l'image Docker deja presente sur le VPS.
#
#   .\deploy.ps1 -Message "..." -IncludeKnowledgeBase
#      Inclut server/knowledge_base/ dans le commit sans poser la question.
#
#   .\deploy.ps1 -Message "..." -ExcludeKnowledgeBase
#      Deploie le code sans committer la knowledge base (defaut si aucun changement KB).
#
# Knowledge base (server/knowledge_base/):
#   Fichiers volumineux (~11 Mo) exclus de Prettier via .prettierignore.
#   En mode interactif, le script demande si vous voulez les inclure dans le
#   deploiement Git (commit + pull VPS) lorsqu'ils ont ete modifies localement.
#
# Fonction:
#   Ce script deploie le CODE applicatif uniquement:
#   1. git add securise + commit/push GitHub depuis le poste local,
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
#   - Les modes avec commit font un git add filtre: les volumes DB, backups,
#     logs, rapports de test et fichiers temporaires ne sont pas stages.
#   - -CommitAll reste accepte par compatibilite, mais le add reste filtre.

param(
    [string]$Message = "",
    [string]$Branch = "main",
    [switch]$SkipCommit,
    [switch]$CommitAll,
    [switch]$SkipBuild,
    [switch]$SkipDockerBuild,
    [switch]$IncludeKnowledgeBase,
    [switch]$ExcludeKnowledgeBase,
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
$KNOWLEDGE_BASE_PREFIX = "server/knowledge_base/"
$SCRIPT_STARTED_WITH_OPTIONS = $PSBoundParameters.Count -gt 0
$script:IncludeKnowledgeBaseInDeploy = $false

# Ces patterns protegent le depot contre les fichiers runtime ou sensibles.
# Ils sont ignores par le git add automatique du script et bloquent le commit
# s'ils sont stages manuellement, sauf suppression de l'index Git.
#
# Raison par chemin:
#   docker/postgres/data : fichiers internes PostgreSQL local Docker.
#   .env                 : secrets et variables privees, couvert par .gitignore.
#   db/                  : exports/dumps SQL locaux, potentiellement sensibles.
#   backups/             : sauvegardes locales ou serveur.
#   logs/                : traces d'execution et debug.
#   nul                  : fichier parasite Windows.
#   test-output.txt      : sortie temporaire de tests/commandes.
$BLOCKED_STAGED_PATTERNS = @(
    "^docker/postgres/data/",
    "^docker/postgres/data-fresh/",
    "^docker/.*/pgdata/",
    "^db/",
    "^backups/",
    "^logs/",
    "^coverage/",
    "^\.playwright/",
    "^playwright-report/",
    "^test-results/",
    "^tmp/",
    "^temp/",
    "(^|/)nul$",
    "(^|/)test-output\.txt$",
    "\.dump$",
    "\.backup$",
    "\.sql\.gz$",
    "\.psql$",
    "\.sqlite3?$",
    "\.tmp$",
    "\.bak$",
    "\.orig$",
    "\.rej$"
)

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

function Get-KnowledgeBaseChanges {
    $lines = @(git status --porcelain -- "$KNOWLEDGE_BASE_PREFIX" 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return @()
    }
    return $lines | Where-Object { $_ -and $_.Trim() }
}

function Resolve-KnowledgeBaseInclusion {
    if ($IncludeKnowledgeBase -and $ExcludeKnowledgeBase) {
        Stop-Step "Utilisez soit -IncludeKnowledgeBase soit -ExcludeKnowledgeBase, pas les deux."
    }

    if ($IncludeKnowledgeBase) {
        Write-Host "  Knowledge base: incluse (-IncludeKnowledgeBase)." -ForegroundColor DarkYellow
        return $true
    }
    if ($ExcludeKnowledgeBase) {
        Write-Host "  Knowledge base: exclue (-ExcludeKnowledgeBase)." -ForegroundColor DarkYellow
        return $false
    }

    $kbChanges = @(Get-KnowledgeBaseChanges)
    if ($kbChanges.Count -eq 0) {
        return $false
    }

    Write-Host ""
    Write-Host "  === Base de connaissances (server/knowledge_base/) ===" -ForegroundColor Cyan
    Write-Host "  Fichiers volumineux, exclus de Prettier (.prettierignore)." -ForegroundColor DarkYellow
    Write-Host "  Modifications locales detectees:" -ForegroundColor Yellow
    $kbChanges | Select-Object -First 10 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkYellow }
    if ($kbChanges.Count -gt 10) {
        Write-Host "   - ... $($kbChanges.Count - 10) autre(s)" -ForegroundColor DarkYellow
    }
    Write-Host ""
    Write-Host "  Inclure la knowledge base dans CE deploiement ?" -ForegroundColor Cyan
    Write-Host "    oui : commit Git + pull VPS (recommande si MASTER_CONSOLIDE.md a change)"
    Write-Host "    non : deployer le reste du code sans toucher a server/knowledge_base/"
    Write-Host ""

    $answer = Read-Host "  Inclure la knowledge base ? (oui/non)"
    if ($answer -match "^(o|oui|y|yes)$") {
        return $true
    }
    if ($answer -match "^(n|non|no)$") {
        return $false
    }

    Stop-Step "Reponse invalide. Utilisez oui ou non."
}

function Unstage-KnowledgeBase {
    $stagedKb = @(git diff --cached --name-only -- "$KNOWLEDGE_BASE_PREFIX" 2>$null)
    if ($stagedKb.Count -eq 0) {
        return
    }

    Write-Host "  Retrait de la knowledge base du staging Git ($($stagedKb.Count) fichier(s))." -ForegroundColor DarkYellow
    & git restore --staged -- "$KNOWLEDGE_BASE_PREFIX"
    if ($LASTEXITCODE -ne 0) {
        Stop-Step "Impossible de retirer server/knowledge_base/ du staging."
    }
}

function Invoke-SafeGitAdd {
    param([bool]$IncludeKnowledgeBaseFiles = $false)

    Write-Host "  Git add securise: staging du code en excluant DB, backups, logs et temporaires." -ForegroundColor Yellow
    if (-not $IncludeKnowledgeBaseFiles) {
        Write-Host "  Knowledge base: exclue de ce git add." -ForegroundColor DarkYellow
    }
    $changedFiles = @(git ls-files --modified --deleted --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) {
        Stop-Step "Impossible de lister les fichiers Git a ajouter."
    }

    $allowedFiles = @()
    $skippedFiles = @()
    foreach ($file in $changedFiles) {
        $isBlocked = $false
        foreach ($pattern in $BLOCKED_STAGED_PATTERNS) {
            if ($file -match $pattern) {
                $isBlocked = $true
                break
            }
        }

        if ($isBlocked) {
            $skippedFiles += $file
        }
        elseif (-not $IncludeKnowledgeBaseFiles -and $file -like "$KNOWLEDGE_BASE_PREFIX*") {
            $skippedFiles += $file
        }
        else {
            $allowedFiles += $file
        }
    }

    if ($skippedFiles.Count -gt 0) {
        Write-Host "  Fichiers ignores par le git add securise: $($skippedFiles.Count)" -ForegroundColor DarkYellow
        $skippedFiles | Select-Object -First 8 | ForEach-Object { Write-Host "   - $_" -ForegroundColor DarkYellow }
        if ($skippedFiles.Count -gt 8) {
            Write-Host "   - ... $($skippedFiles.Count - 8) autre(s)" -ForegroundColor DarkYellow
        }
    }

    if ($allowedFiles.Count -eq 0) {
        Write-Host "  Aucun fichier autorise a ajouter." -ForegroundColor DarkYellow
        return
    }

    & git add -- @allowedFiles
    if ($LASTEXITCODE -ne 0) {
        Stop-Step "git add securise a echoue."
    }
}

function Test-BlockedStagedFiles {
    $stagedEntries = @(git diff --cached --name-status)
    if ($LASTEXITCODE -ne 0) {
        Stop-Step "Impossible de verifier les fichiers stages."
    }

    $blocked = @()
    foreach ($entry in $stagedEntries) {
        $parts = $entry -split "`t"
        if ($parts.Count -lt 2) {
            continue
        }

        $status = $parts[0]
        $file = $parts[-1]

        if ($status -eq "D") {
            continue
        }

        foreach ($pattern in $BLOCKED_STAGED_PATTERNS) {
            if ($file -match $pattern) {
                $blocked += $file
                break
            }
        }
    }

    if ($blocked.Count -gt 0) {
        Write-Host ""
        Write-Host "  Fichiers interdits deja stages:" -ForegroundColor Red
        $blocked | Sort-Object -Unique | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        Write-Host ""
        Write-Host "  Retirer ces fichiers avant de relancer, par exemple:" -ForegroundColor DarkYellow
        Write-Host "  git restore --staged <fichier>" -ForegroundColor DarkYellow
        Stop-Step "Commit bloque pour eviter d'envoyer des donnees locales/runtime."
    }
}

function Show-DeployChoices {
    Write-Host ""
    Write-Host "  Choisir le type de deploiement" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1) Deploiement complet recommande" -ForegroundColor Green
    Write-Host "     Equivalent: .\deploy.ps1 -Message `"Votre message`""
    Write-Host "     Fait un git add securise, cree un commit, push GitHub, pull VPS,"
    Write-Host "     lance migrations, build Vite, rebuild Docker, restart et verification HTTP."
    Write-Host ""
    Write-Host "  2) Deployer sans nouveau commit"
    Write-Host "     Equivalent: .\deploy.ps1 -SkipCommit"
    Write-Host "     N'ajoute rien et ne commit rien. Utile si le commit est deja fait."
    Write-Host "     Le script push, pull VPS, migre, build, rebuild Docker et verifie."
    Write-Host ""
    Write-Host "  3) Deploiement rapide sans build Vite de validation"
    Write-Host "     Equivalent: .\deploy.ps1 -Message `"Votre message`" -SkipBuild"
    Write-Host "     Fait git add securise + commit + push, mais saute le build Vite hors Docker."
    Write-Host "     Le Docker build reste fait, donc le code applicatif est reconstruit."
    Write-Host ""
    Write-Host "  4) Redemarrer avec l'image Docker existante"
    Write-Host "     Equivalent: .\deploy.ps1 -SkipCommit -SkipBuild -SkipDockerBuild"
    Write-Host "     Ne cree pas de commit et ne rebuild pas Docker. Utile pour relancer le"
    Write-Host "     conteneur avec l'image deja presente, pas pour deployer du nouveau code."
    Write-Host ""
    Write-Host "  5) Annuler"
    Write-Host ""

    $choice = Read-Host "  Votre choix (1-5)"
    switch ($choice) {
        "1" {
            $script:SkipCommit = $false
            $script:SkipBuild = $false
            $script:SkipDockerBuild = $false
        }
        "2" {
            $script:SkipCommit = $true
            $script:SkipBuild = $false
            $script:SkipDockerBuild = $false
        }
        "3" {
            $script:SkipCommit = $false
            $script:SkipBuild = $true
            $script:SkipDockerBuild = $false
        }
        "4" {
            $script:SkipCommit = $true
            $script:SkipBuild = $true
            $script:SkipDockerBuild = $true
        }
        "5" {
            Stop-Step "Deploiement annule par l'utilisateur."
        }
        default {
            Stop-Step "Choix invalide."
        }
    }

    if (-not $script:SkipCommit -and -not $script:Message) {
        $script:Message = Read-Host "  Message de commit"
        if (-not $script:Message) {
            $script:Message = "Mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
    }

    if (-not $script:SkipCommit) {
        $script:IncludeKnowledgeBaseInDeploy = Resolve-KnowledgeBaseInclusion
    }

    Write-Host ""
    Write-Host "  Resume avant execution" -ForegroundColor Cyan
    Write-Host "  - Branche: $script:Branch"
    Write-Host "  - Commit local: $(-not $script:SkipCommit)"
    if (-not $script:SkipCommit) {
        Write-Host "  - Message: $script:Message"
        Write-Host "  - Git add: securise avec exclusions runtime"
        Write-Host "  - Knowledge base: $(if ($script:IncludeKnowledgeBaseInDeploy) { 'incluse' } else { 'exclue' })"
    }
    Write-Host "  - Build Vite: $(-not $script:SkipBuild)"
    Write-Host "  - Build Docker: $(-not $script:SkipDockerBuild)"
    Write-Host "  - Conteneur: $script:DockerApp"
    Write-Host ""

    $confirm = Read-Host "  Executer ce plan ? (oui/non)"
    if ($confirm -notmatch "^(o|oui|y|yes)$") {
        Stop-Step "Deploiement annule par l'utilisateur."
    }
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

if (-not $SCRIPT_STARTED_WITH_OPTIONS) {
    Show-DeployChoices
}

if (-not $SkipCommit) {
    if ($CommitAll) {
        Write-Host "  CommitAll actif: le git add reste filtre par securite." -ForegroundColor DarkYellow
    }

    # Mode direct (-Message, etc.) : question KB ici. Mode assistant : deja resolu dans Show-DeployChoices.
    if ($SCRIPT_STARTED_WITH_OPTIONS) {
        $script:IncludeKnowledgeBaseInDeploy = Resolve-KnowledgeBaseInclusion
    }

    if (-not $script:IncludeKnowledgeBaseInDeploy) {
        Unstage-KnowledgeBase
    }

    Invoke-SafeGitAdd -IncludeKnowledgeBaseFiles $script:IncludeKnowledgeBaseInDeploy
    Test-BlockedStagedFiles

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
