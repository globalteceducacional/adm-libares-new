# Sobe apenas o MySQL (servico `db`) definido em docker-compose.yml na raiz do repositorio.
# Requer Docker Engine / Docker Desktop com o CLI no PATH ou em caminho padrao de instalacao.
# Apos sucesso: localhost:3306, base adm_libare, root / root (conforme compose).

$ErrorActionPreference = "Stop"

function Write-Step([string]$message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Get-DockerExecutable {
    $cmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }
    $candidates = @(
        "$env:ProgramFiles\Docker\Docker\resources\bin\docker.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\resources\bin\docker.exe",
        "$env:LocalAppData\Programs\Docker\Docker\resources\bin\docker.exe"
    )
    foreach ($path in $candidates) {
        if ($path -and (Test-Path -LiteralPath $path)) {
            return $path
        }
    }
    return $null
}

try {
    $root = Resolve-Path (Join-Path $PSScriptRoot "../..")
    $composeFile = Join-Path $root "docker-compose.yml"
    if (-not (Test-Path -LiteralPath $composeFile)) {
        throw "docker-compose.yml nao encontrado em: $root"
    }

    $docker = Get-DockerExecutable
    if (-not $docker) {
        Write-Host ""
        Write-Host "[ERRO] Docker CLI nao encontrado." -ForegroundColor Red
        Write-Host "Instale o Docker Desktop para Windows e reinicie o PowerShell, ou adicione o docker ao PATH."
        Write-Host "Download: https://docs.docker.com/desktop/install/windows-install/"
        Write-Host ""
        Write-Host "Alternativa sem Docker: instale MySQL 8.x, crie a base adm_libare e use as credenciais no backend (DB_URL / DB_USER / DB_PASSWORD)."
        exit 1
    }

    Write-Host "[INFO] Usando Docker: $docker" -ForegroundColor DarkGray
    Push-Location $root
    try {
        Write-Step "Subindo servico db (MySQL 8.4)..."
        & $docker compose -f $composeFile up -d db
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose falhou (codigo $LASTEXITCODE)."
        }

        Write-Step "Aguardando MySQL ficar saudavel (ate ~3 min na primeira carga)..."
        $containerName = "adm-libare-db"
        $deadline = (Get-Date).AddMinutes(3)
        $healthy = $false
        while ((Get-Date) -lt $deadline) {
            $inspect = & $docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}no-health{{end}}" $containerName 2>$null
            if ($inspect -eq "healthy") {
                $healthy = $true
                break
            }
            if ($inspect -eq "unhealthy") {
                Write-Host "[ERRO] Container reportou unhealthy. Veja os logs:" -ForegroundColor Red
                Write-Host "  docker compose logs db" -ForegroundColor Yellow
                exit 1
            }
            Start-Sleep -Seconds 3
        }

        if (-not $healthy) {
            Write-Host "[AVISO] Nao confirmamos 'healthy' a tempo. O servico pode ainda estar a iniciar." -ForegroundColor Yellow
            Write-Host "Verifique: docker compose ps" -ForegroundColor Yellow
            exit 0
        }

        Write-Host ""
        Write-Host "[OK] MySQL no ar." -ForegroundColor Green
        Write-Host "  Host:     localhost:3306" -ForegroundColor Gray
        Write-Host "  Base:     adm_libare" -ForegroundColor Gray
        Write-Host "  Usuario:  root" -ForegroundColor Gray
        Write-Host "  Senha:    root" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Backend local (PowerShell na pasta backend):" -ForegroundColor Cyan
        Write-Host '  $env:DB_PASSWORD = "root"; .\gradlew.bat bootRun' -ForegroundColor White
    }
    finally {
        Pop-Location
    }
}
catch {
    Write-Host ""
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
