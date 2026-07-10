# Sobe apenas o frontend Vite (porta 5173).
# Uso: powershell -ExecutionPolicy Bypass -File "scripts\local\start-frontend.ps1"

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevProjectRoot.ps1")

function Test-TcpPort([string]$targetHost, [int]$targetPort) {
    try {
        $result = Test-NetConnection -ComputerName $targetHost -Port $targetPort -WarningAction SilentlyContinue
        return $result.TcpTestSucceeded
    } catch {
        return $false
    }
}

try {
    $frontendPath = Get-DevFrontendPath -ScriptRoot $PSScriptRoot

    if (-not (Test-Path -LiteralPath $frontendPath)) {
        throw "Frontend nao encontrado: $frontendPath"
    }

    if (Test-TcpPort "localhost" 5173) {
        Write-Host "[OK] Frontend ja ativo em http://localhost:5173" -ForegroundColor Green
        exit 0
    }

    if (-not (Test-Path -LiteralPath (Join-Path $frontendPath "node_modules"))) {
        Write-Host "[INFO] Executando npm install..." -ForegroundColor Yellow
        Push-Location -LiteralPath $frontendPath
        try {
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install falhou."
            }
        } finally {
            Pop-Location
        }
    }

    $envExample = Join-Path $frontendPath ".env.example"
    $envFile = Join-Path $frontendPath ".env"
    if (-not (Test-Path -LiteralPath $envFile) -and (Test-Path -LiteralPath $envExample)) {
        Copy-Item -LiteralPath $envExample -Destination $envFile
        Write-Host "[OK] .env criado a partir de .env.example" -ForegroundColor Green
    }

    $cmd = @"
Set-Location -LiteralPath '$frontendPath'
Write-Host 'Iniciando frontend (npm run dev)...' -ForegroundColor Cyan
npm run dev
"@
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $cmd) | Out-Null
    Write-Host "[OK] Janela do frontend aberta: http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
