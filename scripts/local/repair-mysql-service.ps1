# Religa o servico MySQL80 se ficou parado apos um reset incompleto.
#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

$myIni = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
if (Test-Path -LiteralPath $myIni) {
    $lines = Get-Content -LiteralPath $myIni | Where-Object { $_ -notmatch '^init-file=' }
    Set-Content -LiteralPath $myIni -Value $lines -Encoding ASCII
}

Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Start-Service MySQL80
Start-Sleep -Seconds 4

$ok = (Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue).TcpTestSucceeded
if ($ok) {
    Write-Host "[OK] MySQL80 em execucao na porta 3306." -ForegroundColor Green
} else {
    Write-Host "[ERRO] MySQL80 nao respondeu na porta 3306." -ForegroundColor Red
    exit 1
}
