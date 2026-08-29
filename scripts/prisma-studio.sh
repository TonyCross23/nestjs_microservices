#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: prisma-studio.sh <AUTH|PRODUCT|ORDER> <WRITE|READ> <port>" >&2
  exit 1
fi

service_name="$1"
connection_type="$2"
port="$3"

set -a
source ./.env
set +a

url_variable="${service_name}_DATABASE_URL_${connection_type}"
database_url="${!url_variable:-}"

if [ -z "$database_url" ]; then
  echo "Missing $url_variable in .env" >&2
  exit 1
fi

exec pnpm exec prisma studio --url "$database_url" --port "$port"
