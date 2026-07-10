Param(
    [switch]$StartBackend
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevProjectRoot.ps1")

function Write-Step($message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Test-Command($name) {
    return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Invoke-RequiredCommand([scriptblock]$Command, [string]$ErrorMessage) {
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$ErrorMessage (codigo de saida: $LASTEXITCODE)"
    }
}

function Assert-Directory($path, $description) {
    if (-not (Test-Path -Path $path -PathType Container)) {
        throw "$description nao encontrado em: $path"
    }
}

function Test-Url($url) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    } catch {
        return $false
    }
}

try {
    $paths = Get-DevProjectRoot -ScriptRoot $PSScriptRoot
    $backendPath = Join-Path $paths.GradleRoot "backend"
    Assert-Directory $backendPath "Diretorio do backend"

    if ($paths.UsesJunction) {
        Write-Host "[INFO] Gradle via junction: $($paths.GradleRoot)" -ForegroundColor DarkGray
    }

    Write-Step "Preparando backend"
    Push-Location -LiteralPath $backendPath
    try {
        $hasGradle = Test-Command "gradle"
        $hasWrapper = Test-Path ".\gradlew.bat"

        if (-not $hasWrapper) {
            if (-not $hasGradle) {
                throw "Gradle nao encontrado e gradlew.bat inexistente. Instale o Gradle e execute novamente."
            }

            Write-Host "[INFO] Gerando Gradle Wrapper..." -ForegroundColor Yellow
            Invoke-RequiredCommand { gradle wrapper } "Falha ao gerar Gradle Wrapper"
            $hasWrapper = Test-Path ".\gradlew.bat"
            if (-not $hasWrapper) {
                throw "Falha ao gerar gradlew.bat."
            }
            Write-Host "[OK] Gradle Wrapper gerado com sucesso." -ForegroundColor Green
        } else {
            Write-Host "[OK] gradlew.bat encontrado." -ForegroundColor Green
        }

        Write-Step "Executando testes do backend"
        $env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"
        Invoke-RequiredCommand { .\gradlew.bat test --no-daemon } "Falha ao executar testes do backend"
        Write-Host "[OK] Testes executados com sucesso." -ForegroundColor Green

        if ($StartBackend) {
            Write-Step "Subindo backend (bootRun)"
            Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bootRun" -NoNewWindow

            Write-Step "Validando health endpoint"
            $healthUrl = "http://localhost:8080/actuator/health"
            $maxAttempts = 18
            $attempt = 0
            $healthy = $false

            while ($attempt -lt $maxAttempts) {
                $attempt++
                if (Test-Url $healthUrl) {
                    $healthy = $true
                    break
                }
                Start-Sleep -Seconds 5
            }

            if ($healthy) {
                Write-Host "[OK] Backend pronto em $healthUrl" -ForegroundColor Green
            } else {
                Write-Host "[ALERTA] Backend nao respondeu health a tempo." -ForegroundColor Yellow
            }
        }
        Write-Host "[OK] backend-ready finalizado"
        exit 0
    } finally {
        Pop-Location
    }
} catch {
    Write-Host ""
    Write-Host "[ERRO] Falha critica durante preparacao do backend." -ForegroundColor Red
    Write-Host "       Detalhe: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
