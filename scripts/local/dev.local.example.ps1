# Copie para dev.local.ps1 (nao versionado) e ajuste a senha do seu MySQL local.
#   Copy-Item dev.local.example.ps1 dev.local.ps1
#
# O start-dev.ps1 e start-backend.ps1 carregam este ficheiro automaticamente.

$script:DevDbHost = "localhost"
$script:DevDbPort = "3306"
$script:DevDbUser = "root"
$script:DevDbPassword = "COLOQUE_SUA_SENHA_AQUI"
$script:DevDbName = "adm_libare"

# URL JDBC completa (opcional; se vazio, montada a partir dos campos acima)
$script:DevDbUrl = ""
