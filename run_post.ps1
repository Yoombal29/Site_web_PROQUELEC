$p = '{"prompt":"Bonjour","currentContent":{"text":"Test"},"pageKey":"test-page"}'
Set-Content -Path payload.json -Value $p -Encoding utf8
Write-Output 'Sending POST...'
$j = Get-Content payload.json -Raw
try {
    $r = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/ai/content-generation' -Method Post -Body $j -ContentType 'application/json' -TimeoutSec 120
    Write-Output 'RESPONSE:'
    $r | ConvertTo-Json -Depth 5
} catch {
    Write-Output 'REQUEST-ERROR'
    Write-Output $_.Exception.Message
}
Write-Output '--- SERVER OUT (last 200 lines) ---'
if (Test-Path server_out.log) { Get-Content server_out.log -Tail 200 } else { Write-Output 'no server_out.log' }
Write-Output '--- SERVER ERR (last 200 lines) ---'
if (Test-Path server_err.log) { Get-Content server_err.log -Tail 200 } else { Write-Output 'no server_err.log' }
