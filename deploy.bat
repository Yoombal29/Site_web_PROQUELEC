@echo off
REM ============================================================
REM  DEPLOY.SCRIPT — PROQUELEC
REM  Push to GitHub + Deploy to VPS (proquelec.sn)
REM ============================================================
echo.
echo  === PROQUELEC DEPLOY ===
echo.

REM ------ 1. Variables ------
set SSH_KEY=C:\Users\User\.ssh\gem_vps
set SSH_HOST=root@proquelec.sn
set REMOTE_PATH=/var/www/proquelec/www.proquelec.sn
set GIT_BRANCH=main

REM ------ 2. Git status ------
echo [1/5] Verification des modifications...
git status --short
echo.

set /p CONFIRM=Continuer le déploiement ? (O/N)
if /i not "%CONFIRM%"=="O" (
    echo Annule.
    pause
    exit /b
)

REM ------ 3. Add, Commit, Push ------
echo.
echo [2/5] Ajout des fichiers...
git add -A

set /p COMMIT_MSG=Message de commit :
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Mise a jour %DATE% %TIME%

echo [3/5] Commit et push vers GitHub...
git commit -m "%COMMIT_MSG%"
git push origin %GIT_BRANCH%

if %ERRORLEVEL% neq 0 (
    echo ERREUR: Le push a echoue.
    pause
    exit /b
)
echo OK: Push vers GitHub reussi.
echo.

REM ------ 4. Deploiement VPS ------
echo [4/5] Connexion au VPS et mise a jour...

ssh -i "%SSH_KEY%" %SSH_HOST% "cd %REMOTE_PATH% && git pull origin %GIT_BRANCH%"

if %ERRORLEVEL% neq 0 (
    echo ERREUR: Le pull sur le VPS a echoue.
    pause
    exit /b
)
echo OK: Code mis a jour sur le VPS.
echo.

REM ------ 5. Build distant ------
echo [5/5] Build sur le VPS (cela peut prendre 1-2 minutes)...

ssh -i "%SSH_KEY%" %SSH_HOST% "cd %REMOTE_PATH% && NODE_OPTIONS='--max-old-space-size=4096' npm run build"

if %ERRORLEVEL% neq 0 (
    echo ERREUR: Le build a echoue.
    pause
    exit /b
)

REM ------ 6. Redemarrage PM2 ------
ssh -i "%SSH_KEY%" %SSH_HOST% "pm2 restart proquelec-api"

echo.
echo ===========================================
echo  ✅ DEPLOIEMENT TERMINE !
echo ===========================================
echo  https://www.proquelec.sn
echo.
echo  Pensez a faire Ctrl+Shift+R pour vider le cache
echo.

pause
