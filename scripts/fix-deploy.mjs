import fs from 'fs';
let c = fs.readFileSync('./deploypage.ps1', 'utf-8');

// When analysis fails, create candidate (stage mode)
c = c.replace(
  '    try { $analysis = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/analyze" -Token $ProdToken -Body @{ package = $package } } catch { $analysis = $null; Write-Host "  Analyse indisponible, creation candidat" -ForegroundColor DarkYellow }',
  '    try { $analysis = Invoke-Api -Method "POST" -Url "$ProdBaseUrl/api/admin/pages/release/analyze" -Token $ProdToken -Body @{ package = $package } } catch { Write-Host "  Analyse indisponible, creation candidat" -ForegroundColor DarkYellow }'
);

// Default mode is always "stage" (candidate) - safe even with checksum mismatch
c = c.replace(
  "    if ((-not \$analysis -or -not \$StageOnly) -and (\$analysis -eq \$null -or \$analysis.can_publish -eq \$true)) {\n        if (\$Yes) { \$mode = \"stage\" }\n        else {\n            \$confirm = Read-Host \"  Publier directement ? [O/n]\"\n            if (-not \$confirm -or \$confirm.ToLowerInvariant() -eq \"o\" -or \$confirm.ToLowerInvariant() -eq \"oui\") { \$mode = \"safe-apply\" }\n        }\n    }",
  "    if (\$analysis -and -not \$StageOnly -and \$analysis.can_publish -eq \$true) {\n        if (\$Yes) { \$mode = \"safe-apply\" }\n        else {\n            \$confirm = Read-Host \"  Publier directement ? [O/n]\"\n            if (-not \$confirm -or \$confirm.ToLowerInvariant() -eq \"o\" -or \$confirm.ToLowerInvariant() -eq \"oui\") { \$mode = \"safe-apply\" }\n        }\n    }"
);

fs.writeFileSync('./deploypage.ps1', c, 'utf-8');
console.log('OK');
