# Compila ou sobe o backend via junction (contorna caracteres especiais no caminho do repo).
# Uso:
#   powershell -ExecutionPolicy Bypass -File "scripts\local\run-backend-junction.ps1"
#   powershell -ExecutionPolicy Bypass -File "scripts\local\run-backend-junction.ps1" -Task compile
#   powershell -ExecutionPolicy Bypass -File "scripts\local\run-backend-junction.ps1" -Task bootRun

Param(
    [ValidateSet("compile", "bootRun")]
    [string]$Task = "bootRun"
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Get-DevDbConfig.ps1")
. (Join-Path $PSScriptRoot "Get-DevProjectRoot.ps1")

$backendPath = Get-DevBackendPath -ScriptRoot $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $backendPath "gradlew.bat"))) {
    throw "Backend nao encontrado em $backendPath"
}

$dbSettings = Get-DevDbSettings
if (-not (Test-DevDbPasswordConfigured $dbSettings.Password)) {
    throw "Configure scripts\local\dev.local.ps1 com a senha MySQL."
}

Set-DevDbEnvironment $dbSettings
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"

Set-Location -LiteralPath $backendPath
Write-Host "==> Backend ($Task) em $backendPath" -ForegroundColor Cyan

if ($Task -eq "compile") {
    .\gradlew.bat compileKotlin --no-daemon
} else {
    .\gradlew.bat bootRun --no-daemon
}
