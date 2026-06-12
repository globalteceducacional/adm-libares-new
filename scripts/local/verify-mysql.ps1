# Testa conexao MySQL com credenciais de dev.local.ps1 ou padrao root/root.
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevDbConfig.ps1")
$settings = Get-DevDbSettings

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path -LiteralPath $mysql)) {
    throw "mysql.exe nao encontrado."
}

Write-Host "Testando $($settings.User)@$($settings.Host):$($settings.Port)/$($settings.Name) ..." -ForegroundColor Cyan
& $mysql "-u$($settings.User)" "-p$($settings.Password)" "-h$($settings.Host)" "-P$($settings.Port)" -e "SELECT 'OK' AS status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] MySQL acessivel." -ForegroundColor Green
    exit 0
}

Write-Host "[ERRO] Falha na conexao. Execute reset-mysql-password.ps1 como Administrador." -ForegroundColor Red
exit 1
