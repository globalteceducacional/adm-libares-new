#!/usr/bin/env bash
# Deploy completo do painel no VPS (do zero ou atualizando).
#
# Uso:
#   cd /opt/adm-libares-new
#   bash scripts/deploy/deploy-vps.sh
#
# Variaveis opcionais:
#   PUBLIC_BASE_URL=https://admin.alenxandriaglobaltec.com bash scripts/deploy/deploy-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# IP publico do proprio host, usado nos links absolutos de upload.
HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://${HOST_IP}:5173}"

export LEGACY_PUBLIC_BASE_URL="$PUBLIC_BASE_URL"
export LEGACY_ASSETS_HOST_PATH="${LEGACY_ASSETS_HOST_PATH:-./legacy-assets}"
export LEGACY_ASSETS_ROOT="${LEGACY_ASSETS_ROOT:-/legacy-assets}"

echo "==> Repo:            $ROOT"
echo "==> URL publica:     $PUBLIC_BASE_URL"

echo "==> Atualizando codigo (main)..."
git fetch origin
git checkout main
git reset --hard origin/main
echo "==> Commit: $(git log -1 --oneline)"

echo "==> Pastas de assets legados (capas e arquivos de livro)..."
mkdir -p legacy-assets/images/thumbs legacy-assets/uploads

echo "==> Build das imagens..."
docker compose build --no-cache backend frontend

echo "==> Subindo containers..."
docker compose up -d --force-recreate

echo "==> Aguardando backend (ate 120s)..."
for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:5173/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
    echo
    echo "=========================================="
    echo " OK: painel disponivel em $PUBLIC_BASE_URL"
    echo " Login: teste.admin / Admin@123"
    echo "=========================================="
    docker compose ps
    exit 0
  fi
  sleep 2
done

echo
echo "!! Backend nao respondeu UP. Diagnostico:"
bash scripts/deploy/diagnose-backend-vps.sh
exit 1
