#!/usr/bin/env bash
# Publica o painel em https://admin.alenxandriaglobaltec.com nesta VPS.
# Pre-requisito: DNS A do dominio apontando para o IP desta maquina (187.127.0.245).
# Uso: bash scripts/deploy/setup-domain-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

DOMAIN="admin.alenxandriaglobaltec.com"
CONF_SRC="$ROOT/scripts/deploy/nginx-admin.alenxandriaglobaltec.com.conf"
CONF_DST="/etc/nginx/sites-available/$DOMAIN"
HOST_IP="$(hostname -I | awk '{print $1}')"

echo "==> IP desta VPS: $HOST_IP"
echo "==> DNS atual de $DOMAIN:"
getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u || true

if ! getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1}' | grep -qx "$HOST_IP"; then
  echo
  echo "!! ATENCAO: o DNS de $DOMAIN ainda NAO aponta para $HOST_IP"
  echo "   No painel DNS (Hostinger/Cloudflare), crie/altere o registro A:"
  echo "   $DOMAIN  ->  $HOST_IP"
  echo "   Aguarde propagar e rode este script de novo."
  echo
  read -r -p "Continuar mesmo assim? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES) ;;
    *) exit 1 ;;
  esac
fi

echo "==> Instalando nginx + certbot (se preciso)..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Instalando site nginx..."
cp "$CONF_SRC" "$CONF_DST"
ln -sfn "$CONF_DST" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

echo "==> Emitindo certificado Let's Encrypt..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
  echo "!! Certbot falhou (DNS ainda propagando?). O proxy HTTP em :80 ja esta ativo."
  echo "   Depois do DNS ok: certbot --nginx -d $DOMAIN"
}

echo "==> Ajustando compose para URL publica HTTPS..."
export LEGACY_PUBLIC_BASE_URL="https://$DOMAIN"
export CORS_ALLOWED_ORIGIN_PATTERNS="https://$DOMAIN,https://*.alenxandriaglobaltec.com,http://localhost:*,http://127.0.0.1:*,http://187.127.0.245:*"
# Persiste em .env para recreates futuros
cat > "$ROOT/.env" <<EOF
LEGACY_PUBLIC_BASE_URL=$LEGACY_PUBLIC_BASE_URL
CORS_ALLOWED_ORIGIN_PATTERNS=$CORS_ALLOWED_ORIGIN_PATTERNS
LEGACY_ASSETS_HOST_PATH=./legacy-assets
EOF

docker compose up -d --force-recreate backend

echo
echo "==> Testes locais:"
curl -sI "http://127.0.0.1:5173" | head -5
curl -s "http://127.0.0.1:5173/actuator/health" || true
echo
echo "==> Testes pelo dominio (pode falhar ate o DNS apontar aqui):"
curl -sI "https://$DOMAIN" | head -8 || curl -sI "http://$DOMAIN" | head -8 || true
echo
echo "==> Pronto. Acesse: https://$DOMAIN"
