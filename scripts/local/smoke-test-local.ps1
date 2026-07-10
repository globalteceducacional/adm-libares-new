# Smoke test local: health, login e listagem de livros.
# Uso: powershell -ExecutionPolicy Bypass -File "scripts\local\smoke-test-local.ps1"

Param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUser = "teste.admin",
    [string]$AdminPassword = "Admin@123"
)

$ErrorActionPreference = "Stop"

function Test-Step([string]$label, [scriptblock]$Action) {
    Write-Host ""
    Write-Host "==> $label" -ForegroundColor Cyan
    try {
        & $Action
        Write-Host "[OK] $label" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[FALHA] $label" -ForegroundColor Red
        Write-Host "        $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$ok = $true

$ok = (Test-Step "Health" {
    $r = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -lt 200 -or $r.StatusCode -ge 300) {
        throw "HTTP $($r.StatusCode)"
    }
}) -and $ok

$token = $null
$ok = (Test-Step "Login admin" {
    $body = @{ username = $AdminUser; password = $AdminPassword } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
    $json = $r.Content | ConvertFrom-Json
    if (-not $json.token) {
        throw "Token ausente na resposta"
    }
    $script:token = $json.token
}) -and $ok

if ($token) {
    $ok = (Test-Step "Listar livros (campos estendidos)" {
        $headers = @{ Authorization = "Bearer $token" }
        $r = Invoke-WebRequest -Uri "$BaseUrl/api/v1/books" -Headers $headers -UseBasicParsing -TimeoutSec 15
        $books = $r.Content | ConvertFrom-Json
        if ($books.Count -eq 0) {
            Write-Host "        (lista vazia — OK se o banco nao tiver livros)" -ForegroundColor DarkGray
        } else {
            $sample = $books[0]
            Write-Host "        Livro #$($sample.id): $($sample.title)" -ForegroundColor DarkGray
            if ($null -ne $sample.views) {
                Write-Host "        views=$($sample.views) featured=$($sample.featured)" -ForegroundColor DarkGray
            } else {
                Write-Host "        [AVISO] Campo views ausente — reinicie o backend com codigo atualizado" -ForegroundColor Yellow
            }
        }
    }) -and $ok
}

Write-Host ""
if ($ok) {
    Write-Host "Smoke test concluido com sucesso." -ForegroundColor Green
    exit 0
}

Write-Host "Smoke test falhou. Verifique MySQL, backend e credenciais." -ForegroundColor Red
exit 1
