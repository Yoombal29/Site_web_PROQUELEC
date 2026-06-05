# PROQUELEC - Deploiement PAGE Builder vers le VPS
# Usage:
#   .\deploypage.ps1
#   .\deploypage.ps1 -Page formations
#   .\deploypage.ps1 -Page formations -StageOnly
#
# Fonction:
#   Ce script deploie le CONTENU d'une page Builder, pas le code.
#   Il utilise le Builder Release Manager API:
#   1. login admin local,
#   2. export du package de release depuis la page locale,
#   3. login admin VPS,
#   4. analyse anti-conflit sur le VPS,
#   5. publication automatique seulement si aucun conflit,
#      sinon creation d'un candidat de release a reviser.
#
# Important:
#   - Ne lance aucun git pull, aucune migration, aucun build.
#   - Ne remplace pas toute la base VPS.
#   - Respecte les changements faits par les autres admins sur le VPS.
#   - Si conflit, utiliser /admin/builder-release-manager pour reviser.

param(
    [string]$Page = "",
    [string]$LocalBaseUrl = "http://localhost:5175",
    [string]$ProdBaseUrl = "https://www.proquelec.sn",
    [string]$LocalEmail = "",
    [string]$ProdEmail = "oumarkebe@proquelec.sn",
    [switch]$StageOnly,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Stop-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "  ERREUR: $Message" -ForegroundColor Red
    exit 1
}

function Normalize-BaseUrl {
    param([string]$Url)
    return $Url.TrimEnd("/")
}

function Convert-SecretToPlainText {
    param([System.Security.SecureString]$Secret)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secret)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Read-Default {
    param(
        [string]$Prompt,
        [string]$Default
    )
    if ($Default) {
        $value = Read-Host "$Prompt [$Default]"
        if (-not $value) { return $Default }
        return $value
    }
    return Read-Host $Prompt
}

function Invoke-Api {
    param(
        [ValidateSet("GET", "POST", "PUT", "DELETE")]
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Token = ""
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    try {
        if ($null -eq $Body) {
            return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
        }

        $json = $Body | ConvertTo-Json -Depth 100
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -ContentType "application/json" -Body $json
    }
    catch {
        $detail = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $detail = $_.ErrorDetails.Message
        }
        Stop-Step "Appel API echoue: $Method $Url`n$detail"
    }
}

function Get-AuthToken {
    param(
        [string]$BaseUrl,
        [string]$Email,
        [string]$Password,
        [string]$Label
    )

    Write-Host "  Login $Label..." -ForegroundColor Yellow
    $response = Invoke-Api -Method "POST" -Url "$BaseUrl/api/auth/login" -Body @{
        email = $Email
        password = $Password
    }

    $token = $response.access_token
    if (-not $token) {
        Stop-Step "Aucun token recu pour $Label."
    }
    if ($response.user.role -ne "admin") {
        Stop-Step "Le compte $Email n'est pas admin sur $Label."
    }

    return $token
}

function Format-ListValue {
    param([object]$Value)
    if ($null -eq $Value) { return "-" }
    if ($Value -is [array]) { return ($Value -join ", ") }
    return [string]$Value
}

$LocalBaseUrl = Normalize-BaseUrl $LocalBaseUrl
$ProdBaseUrl = Normalize-BaseUrl $ProdBaseUrl

Write-Host ""
Write-Host "  === PROQUELEC DEPLOY PAGE BUILDER ===" -ForegroundColor Cyan
Write-Host "  Local: $LocalBaseUrl"
Write-Host "  VPS:   $ProdBaseUrl"
Write-Host ""

if (-not $Page) {
    $Page = Read-Host "  Slug ou ID de la page locale a publier"
}
if (-not $Page) {
    Stop-Step "Page obligatoire."
}

if (-not $LocalEmail) {
    $LocalEmail = Read-Default "  Email admin local" $ProdEmail
}
if (-not $ProdEmail) {
    $ProdEmail = Read-Host "  Email admin VPS"
}

$localPasswordSecure = Read-Host "  Mot de passe admin local" -AsSecureString
$prodPasswordSecure = Read-Host "  Mot de passe admin VPS" -AsSecureString

$localPassword = Convert-SecretToPlainText $localPasswordSecure
$prodPassword = Convert-SecretToPlainText $prodPasswordSecure

try {
    $localToken = Get-AuthToken -BaseUrl $LocalBaseUrl -Email $LocalEmail -Password $localPassword -Label "local"
    $prodToken = Get-AuthToken -BaseUrl $ProdBaseUrl -Email $ProdEmail -Password $prodPassword -Label "VPS"

    $pageRef = [System.Uri]::EscapeDataString($Page)

    Write-Host ""
    Write-Host "  [1/4] Export package local..." -ForegroundColor Yellow
    $package = Invoke-Api -Method "GET" -Url "$LocalBaseUrl/api/admin/pages/$pageRef/release/export?environment=local" -Token $localToken
    if (-not $package.checksum) {
        Stop-Step "Package local invalide: checksum absent."
    }

    Write-Host "  Page: $($package.page.title) / $($package.page.slug)"
    Write-Host "  Checksum: $($package.checksum)"

    Write-Host ""
    Write-Host "  [2/4] Analyse anti-conflit sur le VPS..." -ForegroundColor Yellow
    $analysis = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/analyze" -Token $prodToken -Body @{
        package = $package
    }

    Write-Host "  Cible VPS: $($analysis.target_slug)"
    Write-Host "  Existe deja: $($analysis.target_exists)"
    Write-Host "  Conflit: $($analysis.conflict)"
    Write-Host "  Publication directe possible: $($analysis.can_publish)"
    Write-Host "  Champs modifies: $(Format-ListValue $analysis.diff_summary.changed_fields)"
    Write-Host "  Champs critiques: $(Format-ListValue $analysis.diff_summary.critical_fields)"

    $mode = "stage"
    if (-not $StageOnly -and $analysis.can_publish -eq $true) {
        if ($Yes) {
            $mode = "safe-apply"
        }
        else {
            $confirm = Read-Host "  Aucun conflit. Publier directement sur le VPS ? [O/n]"
            if (-not $confirm -or $confirm.ToLowerInvariant() -eq "o" -or $confirm.ToLowerInvariant() -eq "oui") {
                $mode = "safe-apply"
            }
        }
    }

    if ($analysis.conflict -eq $true) {
        Write-Host ""
        Write-Host "  Conflit detecte: le script va creer un candidat, sans ecraser la page VPS." -ForegroundColor DarkYellow
    }
    elseif ($StageOnly) {
        Write-Host ""
        Write-Host "  StageOnly actif: creation d'un candidat sans publication directe." -ForegroundColor DarkYellow
    }

    Write-Host ""
    Write-Host "  [3/4] Import VPS en mode $mode..." -ForegroundColor Yellow
    $result = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/import" -Token $prodToken -Body @{
        package = $package
        mode = $mode
    }

    Write-Host ""
    if ($result.mode -eq "published") {
        Write-Host "  Page publiee sur le VPS." -ForegroundColor Green
        Write-Host "  URL publique: $ProdBaseUrl/$($result.page.slug)"
    }
    else {
        Write-Host "  Candidat cree sur le VPS: $($result.candidate.id)" -ForegroundColor Green
        Write-Host "  Statut: $($result.candidate.status)"
        Write-Host "  A reviser ici: $ProdBaseUrl/admin/builder-release-manager"
    }

    Write-Host ""
    Write-Host "  [4/4] Verification page publique..." -ForegroundColor Yellow
    $publicSlug = $package.page.slug
    try {
        $publicResponse = Invoke-WebRequest -Method GET -Uri "$ProdBaseUrl/$publicSlug" -UseBasicParsing
        Write-Host "  HTTP public: $($publicResponse.StatusCode)"
    }
    catch {
        Write-Host "  Verification publique non concluante: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  DEPLOIEMENT PAGE TERMINE" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Release Manager: $ProdBaseUrl/admin/builder-release-manager"
    Write-Host ""
}
finally {
    $localPassword = $null
    $prodPassword = $null
}
