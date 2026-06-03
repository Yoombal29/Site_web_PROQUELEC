# PROQUELEC Deploy Script (PowerShell)
# Usage: .\deploy.ps1
# =============================================

$SSH_KEY = "$env:USERPROFILE\.ssh\gem_vps"
$SSH_HOST = "root@proquelec.sn"
$REMOTE_PATH = "/var/www/proquelec/www.proquelec.sn"

Write-Host ""
Write-Host "  === PROQUELEC DEPLOY ===" -ForegroundColor Cyan
Write-Host ""

# 1. Message de commit
$msg = Read-Host "  Message de commit"
if (-not $msg) {
    $msg = "Mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# 2. Commit + Push
Write-Host "`n  [1/3] Push vers GitHub..." -ForegroundColor Yellow
git add -A
git commit -m "$msg"
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {
    Write-Host "  ❌ Erreur git commit" -ForegroundColor Red
    exit 1
}
git push origin chore/remove-unused-docker-services
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {
    Write-Host "  ❌ Erreur git push" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Push GitHub reussi" -ForegroundColor Green

# 3. VPS pull + build
Write-Host "`n  [2/3] Pull code sur le VPS..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SSH_HOST "cd $REMOTE_PATH && git stash && git pull origin chore/remove-unused-docker-services"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erreur pull VPS" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Code mis a jour sur le VPS" -ForegroundColor Green

# 4. Build on VPS
Write-Host "`n  [3/3] Build sur le VPS (1-2 min)..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SSH_HOST "cd $REMOTE_PATH && NODE_OPTIONS='--max-old-space-size=4096' npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Erreur build" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Build reussi" -ForegroundColor Green

# 5. Restart PM2
Write-Host "`n  Redemarrage du serveur API..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SSH_HOST "pm2 restart proquelec-api"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ✅ DEPLOIEMENT TERMINE !" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  https://www.proquelec.sn"
Write-Host "  https://github.com/Yoombal29/Site_web_PROQUELEC"
Write-Host ""
pause
