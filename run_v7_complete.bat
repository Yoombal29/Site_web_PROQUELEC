@echo off
chcp 65001 >nul
title PROQUELEC AI V7 - LAUNCHER

echo =======================================================
echo    🚀 PROQUELEC AI V7 (MILITARY GRADE) - LAUNCHER
echo =======================================================
echo.
echo [1/2] Demarrage du Frontend React (Port 5173)...
start "PROQUELEC FRONTEND" cmd /k "npm run dev"

echo [2/2] Backend local haystack_backend retiré.
echo       Configurez PROQUELEC_REMOTE_AI=1 et un service distant compatible.

echo.
echo [INFO] Le dashboard distant sera disponible via le service IA configuré.

echo.
echo ✅ SYSTEME DÉMARRÉ !
echo    - Backend: http://localhost:8002
echo    - Frontend: http://localhost:5173
echo    - Dashboard: http://localhost:8002/reports/dashboard_chat.html
echo.
echo Appuyez sur une touche pour fermer ce lanceur (les serveurs resteront ouverts).
pause
