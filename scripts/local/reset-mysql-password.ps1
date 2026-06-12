# Redefine senha root MySQL 8.0 (Windows) via skip-grant-tables no my.ini + servico MySQL80.
# EXECUTE COMO ADMINISTRADOR em scripts\local:
#   powershell -ExecutionPolicy Bypass -File ".\reset-mysql-password.ps1"

#Requires -RunAsAdministrator

Param(
    [string]$NewPassword = "root",
    [string]$DatabaseName = "adm_libare"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$myIni = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$myIniBackup = "$myIni.adm-libare.bak"
$mysql = Join-Path $mysqlBin "mysql.exe"

if (-not (Test-Path -LiteralPath $myIni)) {
    throw "my.ini nao encontrado: $myIni"
}

function Write-MyIniLines([string[]]$lines) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllLines($myIni, $lines, $utf8NoBom)
}

function Read-MyIniLines() {
    return [System.IO.File]::ReadAllLines($myIni)
}

function Test-Tcp3306 {
    try {
        return (Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue).TcpTestSucceeded
    } catch {
        return $false
    }
}

function Wait-Tcp3306([int]$seconds) {
    for ($i = 1; $i -le $seconds; $i++) {
        if (Test-Tcp3306) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Stop-MySqlAll {
    Write-Step "Parando MySQL..."
    if (Get-Service MySQL80 -ErrorAction SilentlyContinue) {
        Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 3
    Get-Process mysqld -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

function Add-MysqldFlag([string]$flagLine) {
    $lines = Read-MyIniLines
    if ($lines -contains $flagLine) { return }
    $out = New-Object System.Collections.Generic.List[string]
    $added = $false
    foreach ($line in $lines) {
        $out.Add($line)
        if (-not $added -and $line.Trim() -eq "[mysqld]") {
            $out.Add($flagLine)
            $added = $true
        }
    }
    if (-not $added) {
        throw "Secao [mysqld] nao encontrada em my.ini"
    }
    Write-MyIniLines ($out.ToArray())
}

function Remove-MysqldFlags {
    param([string[]]$Prefixes)
    $lines = Read-MyIniLines
    $filtered = $lines | Where-Object {
        $line = $_
        $keep = $true
        foreach ($prefix in $Prefixes) {
            if ($line.Trim().StartsWith($prefix)) {
                $keep = $false
                break
            }
        }
        $keep
    }
    Write-MyIniLines ($filtered)
}

function Restore-MyIniBackup {
    if (Test-Path -LiteralPath $myIniBackup) {
        Copy-Item -LiteralPath $myIniBackup -Destination $myIni -Force
    } else {
        Remove-MysqldFlags @("skip-grant-tables", "init-file=")
    }
}

function Start-MySqlServiceOrThrow {
    try {
        Start-Service MySQL80 -ErrorAction Stop
    } catch {
        $detail = (Get-Service MySQL80).Status
        throw "Falha ao iniciar MySQL80 (status atual: $detail). Verifique Event Viewer > Windows Logs > Application, origem MySQL."
    }
}

if (-not (Test-Path -LiteralPath $myIniBackup)) {
    Copy-Item -LiteralPath $myIni -Destination $myIniBackup -Force
    Write-Host "[INFO] Backup my.ini -> $myIniBackup" -ForegroundColor DarkGray
}

try {
    Stop-MySqlAll
    Remove-MysqldFlags @("skip-grant-tables", "init-file=")

    Write-Step "Ativando skip-grant-tables no my.ini..."
    Add-MysqldFlag "skip-grant-tables"

    Write-Step "Iniciando MySQL80 em modo recovery..."
    Start-MySqlServiceOrThrow
    if (-not (Wait-Tcp3306 60)) {
        throw "MySQL80 nao abriu a porta 3306 em 60s."
    }
    Start-Sleep -Seconds 3

    Write-Step "Redefinindo senha via mysql client..."
    $resetSql = @"
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NewPassword';
CREATE DATABASE IF NOT EXISTS $DatabaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
FLUSH PRIVILEGES;
"@

    $connected = $false
    $attempts = @(
        @{ Args = @("-uroot", "-h", "127.0.0.1", "-P", "3306", "--protocol=TCP") },
        @{ Args = @("-uroot", "-h", "localhost", "-P", "3306", "--protocol=TCP") },
        @{ Args = @("-uroot", "--protocol=pipe") },
        @{ Args = @("-uroot") }
    )

    foreach ($attempt in $attempts) {
        Write-Host ("[INFO] Tentativa: mysql " + ($attempt.Args -join " ")) -ForegroundColor DarkGray
        $resetSql | & $mysql @($attempt.Args) 2>&1 | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -eq 0) {
            $connected = $true
            break
        }
    }

    if (-not $connected) {
        throw "Nao foi possivel conectar ao MySQL em modo skip-grant-tables."
    }

    Write-Step "Desativando skip-grant-tables e reiniciando..."
    Stop-MySqlAll
    Remove-MysqldFlags @("skip-grant-tables", "init-file=")
    Start-MySqlServiceOrThrow
    if (-not (Wait-Tcp3306 60)) {
        throw "MySQL80 nao voltou na porta 3306 apos reinicio."
    }
    Start-Sleep -Seconds 4

    Write-Step "Validando nova senha..."
    & $mysql -uroot "-p$NewPassword" -h 127.0.0.1 -P 3306 --protocol=TCP -e "SELECT 'OK' AS status; SHOW DATABASES LIKE '$DatabaseName';" 2>&1 | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "Senha '$NewPassword' ainda nao funciona apos reset."
    }

    Write-Host ""
    Write-Host "[OK] Senha root = $NewPassword" -ForegroundColor Green
    Write-Host "[OK] Base $DatabaseName pronta." -ForegroundColor Green
    Write-Host "[OK] MySQL80 em execucao." -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passo:" -ForegroundColor Cyan
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\verify-mysql.ps1" -ForegroundColor White
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\start-backend.ps1" -ForegroundColor White
}
catch {
    Write-Host ""
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Restaurando my.ini e tentando religar MySQL..." -ForegroundColor Yellow
    Stop-MySqlAll
    Restore-MyIniBackup
    Remove-MysqldFlags @("skip-grant-tables", "init-file=")
    try {
        Start-MySqlServiceOrThrow
    } catch {
        Write-Host "[ERRO] MySQL80 ainda nao inicia. Abra 'Servicos' (services.msc) e inicie MySQL80 manualmente." -ForegroundColor Red
    }
    exit 1
}
