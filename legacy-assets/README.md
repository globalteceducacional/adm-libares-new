# Coloque aqui (ou monte via LEGACY_ASSETS_HOST_PATH) a raiz do PHP legado.
# Estrutura esperada:
#   images/          capas e imagens do catalogo (arquivos .jpg/.png, nao so a pasta thumbs)
#   images/thumbs/   miniaturas
#   uploads/         PDF/EPUB locais
#
# Exemplo no VPS:
#   rsync -a /caminho/adm-libares/images/ ./legacy-assets/images/
#   rsync -a /caminho/adm-libares/uploads/ ./legacy-assets/uploads/
#   export LEGACY_ASSETS_HOST_PATH=./legacy-assets
#   docker compose up -d --build
#
# Porta da API no host: 8081 (8080 costuma estar com luditeca-vps-nginx).
# O frontend em :5173 ja faz proxy interno para o container backend.