#!/usr/bin/env bash
set -euo pipefail

set -a
source ./.env
set +a

for database_url in \
  "$AUTH_DATABASE_URL_WRITE" \
  "$PRODUCT_DATABASE_URL_WRITE" \
  "$ORDER_DATABASE_URL_WRITE"; do
  DATABASE_URL_WRITE="$database_url" pnpm exec prisma migrate deploy
done
