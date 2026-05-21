# scripts/auto-migrate.ps1
# Système de migration automatique pour PROQUELEC (Version Windows PowerShell)

$migrationsDir = Join-Path $PSScriptRoot "..\corpus-db\migrations"
$containerName = "proquelec-db"

if (-not (Test-Path $migrationsDir)) {
    Write-Error "Dossier des migrations non trouvé : $migrationsDir"
    exit 1
}

$files = Get-ChildItem -Path $migrationsDir -Filter *.sql | Sort-Object Name

Write-Host "🚀 Système Auto-Migrate PROQUELEC (PS1)" -ForegroundColor Cyan
Write-Host "📊 $($files.Count) fichiers SQL trouvés"

foreach ($file in $files) {
    Write-Host "📡 Migration : $($file.Name) ... " -NoNewline -ForegroundColor Gray
    try {
        # Lecture du contenu et injection via Docker psql
        Get-Content $file.FullName -Raw | docker exec -i $containerName psql -U postgres -d postgres > $null 2>&1
        Write-Host "✅ OK" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ ERREUR (Ignorée)" -ForegroundColor Yellow
    }
}

Write-Host "✨ Toutes les migrations ont été traitées." -ForegroundColor Cyan
