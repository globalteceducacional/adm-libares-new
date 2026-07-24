# Coloque aqui (ou monte via LEGACY_ASSETS_HOST_PATH) a raiz do PHP legado.
# Estrutura esperada:
#   images/          capas e imagens do catalogo
#   images/thumbs/   miniaturas
#   uploads/         PDF/EPUB locais
#
# Exemplo no VPS:
#   rsync -a /caminho/adm-libares/images/ ./legacy-assets/images/
#   rsync -a /caminho/adm-libares/uploads/ ./legacy-assets/uploads/
#   export LEGACY_ASSETS_HOST_PATH=./legacy-assets
#   docker compose up -d --build
