# Sobe apenas o backend Spring Boot com credenciais de scripts/local/dev.local.ps1
# Uso: powershell -ExecutionPolicy Bypass -File "scripts\local\start-backend.ps1"
#      powershell -ExecutionPolicy Bypass -File "scripts\local\start-backend.ps1" -DbPassword "minhasenha"

Param(
    [string]$DbPassword = "",
    [switch]$WaitForHealth
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevDbConfig.ps1")
. (Join-Path $PSScriptRoot "Get-DevProjectRoot.ps1")

function Write-Step([string]$message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Test-HttpOk([string]$url) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    } catch {
        return $false
    }
}

try {
    $paths = Get-DevProjectRoot -ScriptRoot $PSScriptRoot
    $backendPath = Join-Path $paths.GradleRoot "backend"

    if (-not (Test-Path -LiteralPath (Join-Path $backendPath "gradlew.bat"))) {
        throw "gradlew.bat nao encontrado em $backendPath"
    }

    if ($paths.UsesJunction) {
        Write-Host "[INFO] Gradle via junction: $($paths.GradleRoot)" -ForegroundColor DarkGray
    }

    $settings = Get-DevDbSettings
    if ($DbPassword) {
        $settings.Password = $DbPassword
    }

    if (-not (Test-DevDbPasswordConfigured $settings.Password)) {
        Write-Host ""
        Write-Host "[ERRO] Senha MySQL nao configurada." -ForegroundColor Red
        Write-Host "  1) Copy-Item scripts\local\dev.local.example.ps1 scripts\local\dev.local.ps1" -ForegroundColor Yellow
        Write-Host "  2) Edite DevDbPassword em dev.local.ps1" -ForegroundColor Yellow
        Write-Host "  3) Ou passe -DbPassword `"sua_senha`"" -ForegroundColor Yellow
        exit 1
    }

    Set-DevDbEnvironment $settings
    $env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"

    Write-Step "Backend (MySQL $($settings.User)@$($settings.Host):$($settings.Port)/$($settings.Name))"
    Push-Location -LiteralPath $backendPath
    try {
        if ($WaitForHealth) {
            .\gradlew.bat bootRun --no-daemon
        } else {
            $cmd = @"
Set-Location -LiteralPath '$backendPath'
`$env:DB_URL = '$($settings.Url)'
`$env:DB_USER = '$($settings.User)'
`$env:DB_PASSWORD = '$($settings.Password -replace "'", "''")'
`$env:JAVA_TOOL_OPTIONS = '-Dfile.encoding=UTF-8'
Write-Host 'Iniciando backend...' -ForegroundColor Cyan
.\gradlew.bat bootRun --no-daemon
"@
            Start-Process powershell -ArgumentList @("-NoExit", "-Command", $cmd) | Out-Null
            Write-Host "[OK] Janela do backend aberta. Aguardando health..." -ForegroundColor Green

            $healthy = $false
            for ($i = 1; $i -le 30; $i++) {
                if (Test-HttpOk "http://localhost:8080/actuator/health") {
                    $healthy = $true
                    break
                }
                Start-Sleep -Seconds 3
            }

            if ($healthy) {
                Write-Host "[OK] http://localhost:8080/actuator/health" -ForegroundColor Green
            } else {
                Write-Host "[AVISO] Backend ainda nao respondeu. Verifique senha MySQL e logs na janela Gradle." -ForegroundColor Yellow
                exit 2
            }
        }
    } finally {
        Pop-Location
    }
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
