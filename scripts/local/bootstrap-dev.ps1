Param(
    [switch]$StartFrontend,
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$SkipDbCheck,
    [switch]$StrictPrereq,
    [Alias("Help")]
    [switch]$ShowHelp
)

$ErrorActionPreference = "Stop"

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

function Get-VersionFromText($text, $pattern) {
    $match = [regex]::Match($text, $pattern)
    if ($match.Success) {
        return $match.Groups[1].Value
    }
    return $null
}

function Test-MinVersion($currentVersion, $minimumVersion) {
    try {
        return ([version]$currentVersion) -ge ([version]$minimumVersion)
    } catch {
        return $false
    }
}

function Show-Usage {
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Cyan
    Write-Host "  .\scripts\local\bootstrap-dev.ps1 [opcoes]"
    Write-Host ""
    Write-Host "Opcoes disponiveis:" -ForegroundColor Cyan
    Write-Host "  -StartFrontend   Inicia frontend em modo dev ao final."
    Write-Host "  -SkipBuild       Pula npm install/build do frontend."
    Write-Host "  -SkipTests       Pula testes do backend."
    Write-Host "  -SkipDbCheck     Pula validacao de banco (porta, dump e seed)."
    Write-Host "  -StrictPrereq    Falha rapido se Java/Node/NPM nao atenderem requisitos minimos."
    Write-Host "  -Help            Exibe esta ajuda."
    Write-Host ""
    Write-Host "Cenarios recomendados:" -ForegroundColor Cyan
    Write-Host "  Setup inicial local"
    Write-Host "    .\scripts\local\bootstrap-dev.ps1"
    Write-Host ""
    Write-Host "  CI (checagem estrita)"
    Write-Host "    .\scripts\local\bootstrap-dev.ps1 -StrictPrereq"
    Write-Host ""
    Write-Host "  Desenvolvimento rapido"
    Write-Host "    .\scripts\local\bootstrap-dev.ps1 -SkipDbCheck -SkipTests -StartFrontend"
    Write-Host ""
    Write-Host "Codigos de saida:" -ForegroundColor Cyan
    Write-Host "  0 = concluido sem alertas"
    Write-Host "  1 = erro critico (falha na execucao)"
    Write-Host "  2 = concluido com alertas"
    Write-Host ""
}

function Get-ExitCodeFromStatus($statusMap) {
    $values = @($statusMap.Values)
    if ($values -contains "ERRO") {
        return 1
    }
    if ($values -contains "ALERTA") {
        return 2
    }
    return 0
}

function Test-TcpPort($targetHost, $targetPort) {
    try {
        $result = Test-NetConnection -ComputerName $targetHost -Port $targetPort -WarningAction SilentlyContinue
        return $result.TcpTestSucceeded
    } catch {
        return $false
    }
}

function Test-DbSeed($dbHost, $dbPort, $dbUser, $dbName) {
    if (-not (Test-Command "mysql")) {
        return @{
            Checked = $false
            Seeded = $false
            Message = "Cliente mysql nao encontrado no PATH (checagem profunda de seed ignorada)."
        }
    }

    try {
        $safeDbName = $dbName.Replace("'", "''")
        $query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$safeDbName' AND table_name IN ('tbl_users','tbl_books','tbl_comments','tbl_admin');"
        $output = & mysql -h $dbHost -P $dbPort -u $dbUser -N -e $query 2>$null
        if ($LASTEXITCODE -ne 0) {
            return @{
                Checked = $true
                Seeded = $false
                Message = "Falha ao consultar banco para validar seed."
            }
        }
        $count = 0
        [void][int]::TryParse(($output | Select-Object -First 1), [ref]$count)

        if ($count -ge 4) {
            return @{
                Checked = $true
                Seeded = $true
                Message = "Dump parece importado (tabelas essenciais encontradas)."
            }
        }

        return @{
            Checked = $true
            Seeded = $false
            Message = "Dump ainda nao importado (faltam tabelas essenciais)."
        }
    } catch {
        return @{
            Checked = $true
            Seeded = $false
            Message = "Falha ao consultar banco para validar seed."
        }
    }
}

function Invoke-Bootstrap {
Write-Step "Verificando pre-requisitos do ambiente"

$hasJava = Test-Command "java"
$hasNode = Test-Command "node"
$hasNpm = Test-Command "npm"
$hasGradle = Test-Command "gradle"
$hasDocker = Test-Command "docker"
$status = @{}
$status["Pre-requisitos"] = "OK"
$status["Banco"] = "OK"
$status["Frontend"] = "Pendente"
$status["Backend"] = "Pendente"
$status["FrontendDev"] = "Nao solicitado"

$minimumNodeVersion = "18.0.0"
$minimumJavaVersion = "17.0.0"

if ($hasJava) {
    Write-Host "[OK] Java encontrado" -ForegroundColor Green
    $javaVersionOutput = & java -version 2>&1 | Out-String
    Write-Host $javaVersionOutput.Trim()
    $javaVersion = Get-VersionFromText $javaVersionOutput 'version "([^"]+)"'
    if ($javaVersion -and (Test-MinVersion $javaVersion $minimumJavaVersion)) {
        Write-Host "[OK] Java atende versao minima ($minimumJavaVersion)" -ForegroundColor Green
    } else {
        Write-Host "[ALERTA] Java abaixo da versao minima recomendada ($minimumJavaVersion)." -ForegroundColor Yellow
        $status["Pre-requisitos"] = "ALERTA"
        if ($StrictPrereq) {
            throw "Java abaixo da versao minima requerida em modo estrito: $minimumJavaVersion"
        }
    }
} else {
    Write-Host "[ERRO] Java nao encontrado no PATH" -ForegroundColor Red
    $status["Pre-requisitos"] = "ERRO"
    if ($StrictPrereq) {
        throw "Java nao encontrado no PATH em modo estrito."
    }
}

if ($hasNode -and $hasNpm) {
    Write-Host "[OK] Node/NPM encontrados" -ForegroundColor Green
    $nodeVersionOutput = & node -v
    $nodeVersion = $nodeVersionOutput.TrimStart("v")
    Write-Host $nodeVersionOutput
    npm -v
    if (Test-MinVersion $nodeVersion $minimumNodeVersion) {
        Write-Host "[OK] Node atende versao minima ($minimumNodeVersion)" -ForegroundColor Green
    } else {
        Write-Host "[ALERTA] Node abaixo da versao minima recomendada ($minimumNodeVersion)." -ForegroundColor Yellow
        if ($status["Pre-requisitos"] -ne "ERRO") {
            $status["Pre-requisitos"] = "ALERTA"
        }
        if ($StrictPrereq) {
            throw "Node abaixo da versao minima requerida em modo estrito: $minimumNodeVersion"
        }
    }
} else {
    Write-Host "[ERRO] Node ou NPM nao encontrados no PATH" -ForegroundColor Red
    $status["Pre-requisitos"] = "ERRO"
    if ($StrictPrereq) {
        throw "Node ou NPM nao encontrados no PATH em modo estrito."
    }
}

if ($hasGradle) {
    Write-Host "[OK] Gradle encontrado" -ForegroundColor Green
    gradle -v
} else {
    Write-Host "[ALERTA] Gradle nao encontrado. O backend sem wrapper nao roda localmente." -ForegroundColor Yellow
}

if ($hasDocker) {
    Write-Host "[OK] Docker encontrado" -ForegroundColor Green
    docker --version
} else {
    Write-Host "[ALERTA] Docker nao encontrado. docker compose nao podera ser usado." -ForegroundColor Yellow
}

$root = Resolve-Path "$PSScriptRoot/../.."
$frontendPath = Join-Path $root "frontend-admin"
$backendPath = Join-Path $root "backend"
$dumpPath = Join-Path $root "u778451386_ebook.sql"

Assert-Directory $frontendPath "Diretorio do frontend"
Assert-Directory $backendPath "Diretorio do backend"

$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "adm_libare" }
$parsedDbPort = 0
if (-not [int]::TryParse($dbPort, [ref]$parsedDbPort)) {
    throw "DB_PORT invalido: '$dbPort'. Informe um numero inteiro."
}

Write-Step "Validando banco de dados e carga inicial"

if ($SkipDbCheck) {
    Write-Host "[ALERTA] Validacoes de banco ignoradas por parametro (-SkipDbCheck)." -ForegroundColor Yellow
    $status["Banco"] = "Ignorado"
} else {
    $dbPortOpen = Test-TcpPort $dbHost $dbPort
    if ($dbPortOpen) {
        Write-Host "[OK] Banco acessivel em ${dbHost}:${dbPort}" -ForegroundColor Green
    } else {
        Write-Host "[ALERTA] Banco indisponivel em ${dbHost}:${dbPort}" -ForegroundColor Yellow
        $status["Banco"] = "ALERTA"
    }

    if (Test-Path $dumpPath) {
        Write-Host "[OK] Dump encontrado: $dumpPath" -ForegroundColor Green
    } else {
        Write-Host "[ALERTA] Dump nao encontrado em: $dumpPath" -ForegroundColor Yellow
        if ($status["Banco"] -ne "ERRO") {
            $status["Banco"] = "ALERTA"
        }
    }

    $seedCheck = Test-DbSeed $dbHost $dbPort $dbUser $dbName
    if (-not $seedCheck.Checked) {
        Write-Host "[ALERTA] $($seedCheck.Message)" -ForegroundColor Yellow
        Write-Host "         Se necessario, importe manualmente:" -ForegroundColor Yellow
        Write-Host "         mysql -h $dbHost -P $dbPort -u $dbUser -p $dbName < `"u778451386_ebook.sql`"" -ForegroundColor Yellow
        if ($status["Banco"] -ne "ERRO") {
            $status["Banco"] = "ALERTA"
        }
    } elseif ($seedCheck.Seeded) {
        Write-Host "[OK] $($seedCheck.Message)" -ForegroundColor Green
    } else {
        Write-Host "[ALERTA] $($seedCheck.Message)" -ForegroundColor Yellow
        Write-Host "         Importe o dump antes de validar backend em producao." -ForegroundColor Yellow
        if ($status["Banco"] -ne "ERRO") {
            $status["Banco"] = "ALERTA"
        }
    }
}

Write-Step "Preparando frontend"

if ($SkipBuild) {
    Write-Host "[ALERTA] Build do frontend ignorado por parametro (-SkipBuild)." -ForegroundColor Yellow
    $status["Frontend"] = "Ignorado"
} else {
    if (!(Test-Path (Join-Path $frontendPath ".env")) -and (Test-Path (Join-Path $frontendPath ".env.example"))) {
        Copy-Item (Join-Path $frontendPath ".env.example") (Join-Path $frontendPath ".env")
        Write-Host "[OK] .env criado a partir de .env.example" -ForegroundColor Green
    }

    Push-Location $frontendPath
    try {
        Invoke-RequiredCommand { npm install } "Falha ao executar npm install no frontend"
        Invoke-RequiredCommand { npm run build } "Falha ao executar npm run build no frontend"
        Write-Host "[OK] Frontend compilado com sucesso" -ForegroundColor Green
        $status["Frontend"] = "OK"
    } finally {
        Pop-Location
    }
}

Write-Step "Validando backend"
if ($SkipTests) {
    Write-Host "[ALERTA] Testes do backend ignorados por parametro (-SkipTests)." -ForegroundColor Yellow
    $status["Backend"] = "Ignorado"
} else {
    Push-Location $backendPath
    try {
        if (Test-Path ".\gradlew.bat") {
            Invoke-RequiredCommand { .\gradlew.bat test } "Falha nos testes do backend via gradlew"
            Write-Host "[OK] Testes backend executados com gradle wrapper" -ForegroundColor Green
            $status["Backend"] = "OK"
        } elseif ($hasGradle) {
            Invoke-RequiredCommand { gradle test } "Falha nos testes do backend via gradle local"
            Write-Host "[OK] Testes backend executados com gradle local" -ForegroundColor Green
            $status["Backend"] = "OK"
        } else {
            Write-Host "[ALERTA] Backend nao testado (sem gradle/gradlew)." -ForegroundColor Yellow
            Write-Host "         Proximo passo: instalar Gradle e executar 'gradle wrapper' em /backend." -ForegroundColor Yellow
            $status["Backend"] = "ALERTA"
        }
    } finally {
        Pop-Location
    }
}

if ($StartFrontend) {
    Write-Step "Iniciando frontend em modo desenvolvimento"
    Push-Location $frontendPath
    try {
        Invoke-RequiredCommand { npm run dev } "Falha ao iniciar frontend em modo desenvolvimento"
        $status["FrontendDev"] = "OK"
    } finally {
        Pop-Location
    }
}

Write-Step "Bootstrap finalizado"
Write-Host "Resumo de status:" -ForegroundColor Cyan
Write-Host "  - Pre-requisitos: $($status["Pre-requisitos"])"
Write-Host "  - Banco: $($status["Banco"])"
Write-Host "  - Frontend (build): $($status["Frontend"])"
Write-Host "  - Backend (testes): $($status["Backend"])"
Write-Host "  - Frontend dev: $($status["FrontendDev"])"
$exitCode = Get-ExitCodeFromStatus $status
Write-Host "Codigo de saida: $exitCode"
return $exitCode
}

if ($ShowHelp) {
    Show-Usage
    return
}

try {
    $bootstrapExitCode = Invoke-Bootstrap
    exit $bootstrapExitCode
} catch {
    Write-Host ""
    Write-Host "[ERRO] Falha critica durante bootstrap." -ForegroundColor Red
    Write-Host "       Detalhe: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
