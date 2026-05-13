#!/usr/bin/env bash
# TheWealth local startup script

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f ".env" ]; then
  # shellcheck disable=SC1091
  source ".env"
fi

API_BASE="${VITE_API_BASE_URL:-http://localhost:8005}"
WS_URL="${VITE_WS_URL:-ws://localhost:8005/ws/market}"

export VITE_API_BASE_URL="$API_BASE"
export VITE_WS_URL="$WS_URL"

echo "[INFO] Starting TheWealth dev server"
echo "[INFO] API: ${VITE_API_BASE_URL}"
echo "[INFO] WS:  ${VITE_WS_URL}"

exec npm run dev
