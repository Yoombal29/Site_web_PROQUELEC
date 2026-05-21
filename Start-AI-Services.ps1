Write-Host "🚀 Le backend local haystack_backend a été retiré. Ce script ne démarre plus de services locaux." -ForegroundColor Cyan
Write-Host "" 
Write-Host "Configurez un service distant ou utilisez PROQUELEC_REMOTE_AI=1 avec un provider cloud." -ForegroundColor Yellow
Write-Host "" 
Write-Host "Exemples de configuration :" -ForegroundColor Green
Write-Host "  $env:PROQUELEC_REMOTE_AI = 1" -ForegroundColor White
Write-Host "  $env:PROQUELEC_AI_PROVIDER = 'openai'" -ForegroundColor White
Write-Host "  $env:PROQUELEC_API_KEY = 'sk-...';" -ForegroundColor White
Write-Host "" 
Write-Host "Le frontend reste disponible via npm run dev." -ForegroundColor Cyan
Write-Host "" 
Write-Host "👉 Pour démarrer uniquement l'UI : npm run dev" -ForegroundColor Green
