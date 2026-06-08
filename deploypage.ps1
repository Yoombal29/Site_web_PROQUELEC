# PROQUELEC - Deploiement PAGES Builder vers le VPS
# Usage:
#   .\deploypage.ps1 -Page "formations"              # Une seule page
#   .\deploypage.ps1 -AllPages                        # Toutes les pages
#   .\deploypage.ps1 -Page "formations" -StageOnly    # Sans publier
#   .\deploypage.ps1 -AllPages -Yes                   # Auto sans confirmation si dry-run OK

param(
    [string]$Page = "",
    [switch]$AllPages,
    [string]$LocalPassword = "",
    [string]$ProdPassword = "",
    [string]$LocalBaseUrl = "http://localhost:5175",
    [string]$ProdBaseUrl = "https://www.proquelec.sn",
    [string]$LocalEmail = "",
    [string]$ProdEmail = "oumarkebe@proquelec.sn",
    [switch]$StageOnly,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Stop-Step { param([string]$Message) Write-Host "`n  ERREUR: $Message" -ForegroundColor Red; exit 1 }

function Normalize-BaseUrl { param([string]$Url) return $Url.TrimEnd("/") }

function Convert-SecretToPlainText {
    param([System.Security.SecureString]$Secret)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secret)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Read-Default { param([string]$Prompt, [string]$Default)
    if ($Default) { $v = Read-Host "$Prompt [$Default]"; if (-not $v) { return $Default }; return $v }
    return Read-Host $Prompt
}

function Invoke-Api {
    param([string]$Method, [string]$Url, [object]$Body = $null, [string]$Token = "")
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        if ($null -eq $Body) { return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers }
        $json = $Body | ConvertTo-Json -Depth 100
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -ContentType "application/json" -Body $json
    } catch {
        $detail = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) { $detail = $_.ErrorDetails.Message }
        throw "Appel API echoue: $Method $Url`n$detail"
    }
}

function Get-AuthToken {
    param([string]$BaseUrl, [string]$Email, [string]$Password, [string]$Label)
    Write-Host "  Login $Label..." -ForegroundColor Yellow
    $response = Invoke-Api -Method "POST" -Url "$BaseUrl/api/auth/login" -Body @{ email = $Email; password = $Password }
    if (-not $response.access_token) { Stop-Step "Aucun token recu pour $Label." }
    if ($response.user.role -ne "admin" -and $response.user.role -ne "superadmin") { Stop-Step "Le compte $Email n'est pas admin sur $Label." }
    return $response.access_token
}

function Publish-OnePage {
    param([string]$PageId, [string]$LocalToken, [string]$ProdToken)

    $pageRef = [System.Uri]::EscapeDataString($PageId)
    Write-Host "`n  --- Page: $PageId ---" -ForegroundColor Cyan

    Write-Host "  [1/3] Export local..." -ForegroundColor Yellow
    $package = Invoke-Api -Method "GET" -Url "$LocalBaseUrl/api/admin/pages/$pageRef/release/export?environment=local" -Token $LocalToken
    if (-not $package.checksum) { Stop-Step "Package invalide: checksum absent." }

    Write-Host "  Titre: $($package.page.title) / Slug: $($package.page.slug)"

    Write-Host "  [2/3] Analyse dry-run VPS..." -ForegroundColor Yellow
    $analysis = $null
    try {
        $analysis = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/analyze" -Token $ProdToken -Body @{ package = $package }
        if ($analysis.conflict) {
            Write-Host "  Conflit detecte: $($analysis.conflict_reason)" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host "  Analyse indisponible, import en candidat uniquement" -ForegroundColor DarkYellow
    }

    $mode = "stage"
    if ($analysis -and -not $StageOnly -and $analysis.can_publish -eq $true) {
        if ($Yes) { $mode = "safe-apply" }
        else {
            $confirm = Read-Host "  Publier directement ? [O/n]"
            if (-not $confirm -or $confirm.ToLowerInvariant() -eq "o" -or $confirm.ToLowerInvariant() -eq "oui") { $mode = "safe-apply" }
        }
    } elseif ($StageOnly) {
        Write-Host "  StageOnly actif: creation candidat sans publication" -ForegroundColor DarkYellow
    } else {
        Write-Host "  Publication directe bloquee: creation candidat" -ForegroundColor DarkYellow
    }

    Write-Host "  [3/3] Import mode $mode..." -ForegroundColor Yellow
    $result = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/import" -Token $ProdToken -Body @{ package = $package; mode = $mode }

    if ($result.mode -eq "published") {
        Write-Host "  ✅ Publiee: $ProdBaseUrl/$($result.page.slug)" -ForegroundColor Green
    } else {
        Write-Host "  📋 Candidat cree: $($result.candidate.id)" -ForegroundColor Yellow
    }
}

# ========== MAIN ==========

$LocalBaseUrl = Normalize-BaseUrl $LocalBaseUrl
$ProdBaseUrl = Normalize-BaseUrl $ProdBaseUrl

Write-Host "`n  === PROQUELEC DEPLOY PAGES BUILDER ===" -ForegroundColor Cyan
Write-Host "  Local: $LocalBaseUrl"
Write-Host "  VPS:   $ProdBaseUrl`n"

if (-not $LocalEmail) { $LocalEmail = Read-Default "  Email admin local" $ProdEmail }
if (-not $ProdEmail) { $ProdEmail = Read-Host "  Email admin VPS" }

if ($LocalPassword -and $ProdPassword) {
    $localPassword = $LocalPassword
    $prodPassword = $ProdPassword
    Write-Host "  Utilisation des mots de passe fournis en paramètres" -ForegroundColor DarkYellow
} else {
    $localPasswordSecure = Read-Host "  Mot de passe admin local" -AsSecureString
    $prodPasswordSecure = Read-Host "  Mot de passe admin VPS" -AsSecureString
    $localPassword = Convert-SecretToPlainText $localPasswordSecure
    $prodPassword = Convert-SecretToPlainText $prodPasswordSecure
}

try {
    $localToken = Get-AuthToken -BaseUrl $LocalBaseUrl -Email $LocalEmail -Password $localPassword -Label "local"
    $prodToken = Get-AuthToken -BaseUrl $ProdBaseUrl -Email $ProdEmail -Password $prodPassword -Label "VPS"

    # Si AllPages, recuperer la liste depuis le local
    if ($AllPages) {
        Write-Host "`n  Recuperation de la liste des pages locales..." -ForegroundColor Yellow
        $allPagesData = Invoke-Api -Method "GET" -Url "$LocalBaseUrl/api/admin/pages" -Token $localToken
        $pages = $allPagesData | Where-Object { $_.slug -and $_.slug -ne "" }
        Write-Host "  $($pages.Count) pages trouvees"

        # Afficher la liste
        $i = 0
        $pages | ForEach-Object { Write-Host "  [$i] $($_.slug) - $($_.title)"; $i++ }

        # Choix: une page ou toutes
        if (-not $Page) {
            if ($Yes) { $choice = "all" } else { $choice = Read-Host "`n  Numero de la page a deployer (ou 'all' pour toutes)" }
            if ($choice.ToLowerInvariant() -eq "all") {
                $pagesToDeploy = $pages
            } else {
                $idx = 0
                if (-not [int]::TryParse($choice, [ref]$idx)) { Stop-Step "Choix invalide: $choice" }
                if ($idx -lt 0 -or $idx -ge $pages.Count) { Stop-Step "Index de page invalide: $idx" }
                $pagesToDeploy = @($pages[$idx])
            }
        } else {
            $pagesToDeploy = $pages | Where-Object { $_.slug -eq $Page -or $_.id -eq $Page }
        }
    }
    elseif ($Page) {
        # Une page specifique
        $pagesToDeploy = @(@{ slug = $Page; title = $Page })
    }
    else {
        # Aucun parametre -> lister les pages avec choix
        Write-Host ""
        Write-Host "  Recuperation de la liste des pages locales..." -ForegroundColor Yellow
        $allPagesData = Invoke-Api -Method "GET" -Url "$LocalBaseUrl/api/admin/pages" -Token $localToken
        $pages = $allPagesData | Where-Object { $_.slug -and $_.slug -ne "" }
        Write-Host "  $($pages.Count) pages trouvees"
        $i = 0
        $pages | ForEach-Object { Write-Host "  [$i] $($_.slug) - $($_.title)"; $i++ }
        $choice = Read-Host "  Numero de la page (ou 'all' pour toutes, ou 'quit')"
        if ($choice.ToLowerInvariant() -eq "quit") { exit 0 }
        if ($choice.ToLowerInvariant() -eq "all") {
            $pagesToDeploy = $pages
        } else {
            $idx = 0
            if (-not [int]::TryParse($choice, [ref]$idx)) { Stop-Step "Choix invalide: $choice" }
            if ($idx -lt 0 -or $idx -ge $pages.Count) { Stop-Step "Index de page invalide: $idx" }
            $pagesToDeploy = @($pages[$idx])
        }
    }

    if (-not $pagesToDeploy -or $pagesToDeploy.Count -eq 0) {
        Stop-Step "Aucune page a deployer."
    }

    # Deployer chaque page
    $success = 0; $fail = 0
    foreach ($p in $pagesToDeploy) {
        try {
            Publish-OnePage -PageId $p.slug -LocalToken $localToken -ProdToken $prodToken
            $success++
        } catch {
            Write-Host "  ❌ Echec: $($p.slug) - $($_.Exception.Message)" -ForegroundColor Red
            $fail++
        }
    }

    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "  DEPLOIEMENT PAGES TERMINE" -ForegroundColor Green
    Write-Host "  Reussites: $success / Echecs: $fail" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan

} finally {
    $localPassword = $null; $prodPassword = $null
}
