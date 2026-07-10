# Resolve caminhos do repo quando a pasta contem caracteres especiais (ex.: acento agudo),
# que quebram o compilador Kotlin em fallback no Windows.

function Get-DevProjectRoot {
    param(
        [string]$ScriptRoot = $PSScriptRoot
    )

    $repoRelative = Join-Path $ScriptRoot "../.."
    $repoItem = Get-Item -LiteralPath (Resolve-Path -LiteralPath $repoRelative).Path
    $repoRoot = $repoItem.FullName
    $junction = Join-Path (Split-Path $repoRoot -Parent) "adm-projeto"
    $needsJunction = $repoRoot -match '[^\u0000-\u007F]'

    if ($needsJunction) {
        if (-not (Test-Path -LiteralPath $junction)) {
            New-Item -ItemType Junction -Path $junction -Target $repoRoot | Out-Null
            Write-Host "[INFO] Junction para Gradle: $junction -> $repoRoot" -ForegroundColor Yellow
        }
        return @{
            Root         = $repoRoot
            GradleRoot   = (Get-Item -LiteralPath $junction).FullName
            UsesJunction = $true
        }
    }

    return @{
        Root         = $repoRoot
        GradleRoot   = $repoRoot
        UsesJunction = $false
    }
}

function Get-DevBackendPath {
    param([string]$ScriptRoot = $PSScriptRoot)

    $paths = Get-DevProjectRoot -ScriptRoot $ScriptRoot
    return Join-Path $paths.GradleRoot "backend"
}

function Get-DevFrontendPath {
    param([string]$ScriptRoot = $PSScriptRoot)

    $paths = Get-DevProjectRoot -ScriptRoot $ScriptRoot
    return Join-Path $paths.Root "frontend-admin"
}
