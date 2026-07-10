# Sobe o ambiente de desenvolvimento local: MySQL (Docker, opcional), backend Spring e frontend Vite.
# Uso tipico (na raiz do repositorio):
#   powershell -ExecutionPolicy Bypass -File "scripts\local\start-dev.ps1"
#
# Opcoes:
#   -SkipDb          Nao tenta subir MySQL via Docker
#   -SkipBackend     Nao inicia bootRun
#   -SkipFrontend    Nao inicia npm run dev
#   -DbPassword      Senha MySQL para o backend (padrao: root)

Param(
    [switch]$SkipDb,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [string]$DbPassword = ""
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevDbConfig.ps1")
. (Join-Path $PSScriptRoot "Get-DevProjectRoot.ps1")

function Write-Step([string]$message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Test-TcpPort([string]$targetHost, [int]$targetPort) {
    try {
        $result = Test-NetConnection -ComputerName $targetHost -Port $targetPort -WarningAction SilentlyContinue
        return $result.TcpTestSucceeded
    } catch {
        return $false
    }
}

function Test-HttpOk([string]$url) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    } catch {
        return $false
    }
}

function Wait-HttpOk([string]$url, [int]$maxAttempts, [int]$sleepSeconds) {
    for ($i = 1; $i -le $maxAttempts; $i++) {
        if (Test-HttpOk $url) {
            return $true
        }
        Start-Sleep -Seconds $sleepSeconds
    }
    return $false
}

try {
    $paths = Get-DevProjectRoot -ScriptRoot $PSScriptRoot
    $root = $paths.Root
    $backendPath = Join-Path $paths.GradleRoot "backend"
    $frontendPath = Join-Path $root "frontend-admin"
    $startDbScript = Join-Path $PSScriptRoot "start-db.ps1"

    if ($paths.UsesJunction) {
        Write-Host "[INFO] Gradle usa junction: $($paths.GradleRoot)" -ForegroundColor DarkGray
    }

    if (-not (Test-Path -LiteralPath $backendPath)) {
        throw "Backend nao encontrado: $backendPath"
    }
    if (-not (Test-Path -LiteralPath $frontendPath)) {
        throw "Frontend nao encontrado: $frontendPath"
    }

    # --- MySQL ---
    if (-not $SkipDb) {
        Write-Step "MySQL (porta 3306)"
        if (Test-TcpPort "localhost" 3306) {
            Write-Host "[OK] Porta 3306 ja esta em uso (MySQL provavelmente ativo)." -ForegroundColor Green
        } elseif (Test-Path -LiteralPath $startDbScript) {
            Write-Host "[INFO] Tentando subir MySQL via Docker..." -ForegroundColor Yellow
            & powershell -NoProfile -ExecutionPolicy Bypass -File $startDbScript
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[AVISO] Nao foi possivel subir MySQL automaticamente. Inicie manualmente ou use Docker." -ForegroundColor Yellow
            }
        } else {
            Write-Host "[AVISO] Script start-db.ps1 nao encontrado. Inicie MySQL manualmente." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[INFO] Subida de MySQL ignorada (-SkipDb)." -ForegroundColor DarkGray
    }

    # --- Backend ---
    if (-not $SkipBackend) {
        Write-Step "Backend Spring Boot (porta 8080)"
        if (Test-TcpPort "localhost" 8080) {
            Write-Host "[OK] Porta 8080 ja esta em uso (backend provavelmente ativo)." -ForegroundColor Green
        } else {
            if (-not (Test-Path (Join-Path $backendPath "gradlew.bat"))) {
                throw "gradlew.bat nao encontrado em $backendPath"
            }

            $dbSettings = Get-DevDbSettings
            if ($DbPassword) {
                $dbSettings.Password = $DbPassword
            }
            if (-not (Test-DevDbPasswordConfigured $dbSettings.Password)) {
                Write-Host "[AVISO] Configure scripts\local\dev.local.ps1 ou use -DbPassword." -ForegroundColor Yellow
                Write-Host "        Backend nao sera iniciado." -ForegroundColor Yellow
            } else {
            Set-DevDbEnvironment $dbSettings
            $env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"

            $backendCmd = @"
Set-Location -LiteralPath '$backendPath'
`$env:DB_URL = '$($dbSettings.Url)'
`$env:DB_USER = '$($dbSettings.User)'
`$env:DB_PASSWORD = '$($dbSettings.Password -replace "'", "''")'
`$env:JAVA_TOOL_OPTIONS = '-Dfile.encoding=UTF-8'
Write-Host 'Iniciando backend (bootRun)...' -ForegroundColor Cyan
.\gradlew.bat bootRun --no-daemon
"@
            Start-Process powershell -ArgumentList @("-NoExit", "-Command", $backendCmd) | Out-Null
            Write-Host "[INFO] Janela do backend aberta. Aguardando health..." -ForegroundColor Yellow

            if (Wait-HttpOk "http://localhost:8080/actuator/health" 24 5) {
                Write-Host "[OK] Backend responde em http://localhost:8080/actuator/health" -ForegroundColor Green
            } else {
                Write-Host "[AVISO] Backend ainda nao respondeu. Verifique a janela do Gradle (MySQL/senha?)." -ForegroundColor Yellow
            }
            }
        }
    } else {
        Write-Host "[INFO] Subida do backend ignorada (-SkipBackend)." -ForegroundColor DarkGray
    }

    # --- Frontend ---
    if (-not $SkipFrontend) {
        Write-Step "Frontend Vite (porta 5173)"
        if (Test-TcpPort "localhost" 5173) {
            Write-Host "[OK] Porta 5173 ja esta em uso (frontend provavelmente ativo)." -ForegroundColor Green
        } else {
            if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
                Write-Host "[INFO] Executando npm install..." -ForegroundColor Yellow
                Push-Location $frontendPath
                try {
                    npm install
                    if ($LASTEXITCODE -ne 0) {
                        throw "npm install falhou."
                    }
                } finally {
                    Pop-Location
                }
            }

            if (-not (Test-Path (Join-Path $frontendPath ".env")) -and (Test-Path (Join-Path $frontendPath ".env.example"))) {
                Copy-Item (Join-Path $frontendPath ".env.example") (Join-Path $frontendPath ".env")
                Write-Host "[OK] .env criado a partir de .env.example" -ForegroundColor Green
            }

            $frontendCmd = @"
Set-Location '$frontendPath'
Write-Host 'Iniciando frontend (npm run dev)...' -ForegroundColor Cyan
npm run dev
"@
            Start-Process powershell -ArgumentList @("-NoExit", "-Command", $frontendCmd) | Out-Null
            Write-Host "[INFO] Janela do frontend aberta." -ForegroundColor Yellow

            if (Wait-HttpOk "http://localhost:5173" 12 2) {
                Write-Host "[OK] Frontend em http://localhost:5173" -ForegroundColor Green
            } else {
                Write-Host "[AVISO] Frontend ainda a iniciar. Abra http://localhost:5173 em instantes." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "[INFO] Subida do frontend ignorada (-SkipFrontend)." -ForegroundColor DarkGray
    }

    Write-Step "Ambiente de desenvolvimento"
    Write-Host "  Painel:   http://localhost:5173" -ForegroundColor White
    Write-Host "  API:      http://localhost:8080" -ForegroundColor White
    Write-Host "  Health:   http://localhost:8080/actuator/health" -ForegroundColor White
    Write-Host "  Login:    admin / password (se seed Flyway padrao)" -ForegroundColor White
    Write-Host ""
    Write-Host "Para parar: feche as janelas do backend e frontend; MySQL Docker: docker compose stop db" -ForegroundColor DarkGray
}
catch {
    Write-Host ""
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
