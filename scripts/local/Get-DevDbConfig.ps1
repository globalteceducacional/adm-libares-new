# Carrega scripts/local/dev.local.ps1 se existir (credenciais locais, gitignored).

function Import-DevLocalConfig {
    $configPath = Join-Path $PSScriptRoot "dev.local.ps1"
    if (Test-Path -LiteralPath $configPath) {
        . $configPath
        Write-Host "[OK] Config local: $configPath" -ForegroundColor DarkGray
        return $true
    }
    return $false
}

function Get-DevDbSettings {
    param(
        [string]$DefaultPassword = "root",
        [string]$DefaultUser = "root",
        [string]$DefaultHost = "localhost",
        [string]$DefaultPort = "3306",
        [string]$DefaultName = "adm_libare"
    )

    $null = Import-DevLocalConfig

    $hostName = if ($script:DevDbHost) { $script:DevDbHost } else { $DefaultHost }
    $port = if ($script:DevDbPort) { $script:DevDbPort } else { $DefaultPort }
    $user = if ($script:DevDbUser) { $script:DevDbUser } else { $DefaultUser }
    $password = if ($null -ne $script:DevDbPassword -and $script:DevDbPassword -ne "") {
        $script:DevDbPassword
    } else {
        $DefaultPassword
    }
    $name = if ($script:DevDbName) { $script:DevDbName } else { $DefaultName }

    $url = if ($script:DevDbUrl -and $script:DevDbUrl.Trim().Length -gt 0) {
        $script:DevDbUrl.Trim()
    } else {
        "jdbc:mysql://${hostName}:${port}/${name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
    }

    return @{
        Host     = $hostName
        Port     = $port
        User     = $user
        Password = $password
        Name     = $name
        Url      = $url
    }
}

function Set-DevDbEnvironment {
    param(
        [hashtable]$Settings
    )

    $env:DB_URL = $Settings.Url
    $env:DB_USER = $Settings.User
    $env:DB_PASSWORD = $Settings.Password
}

function Test-DevDbPasswordConfigured {
    param([string]$Password)

    if ($Password -eq "COLOQUE_SUA_SENHA_AQUI") {
        return $false
    }
    return $true
}
