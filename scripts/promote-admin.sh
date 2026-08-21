#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--" ]; then
  shift
fi

if [ "$#" -ne 1 ]; then
  echo "Usage: pnpm promote:admin -- admin@example.com" >&2
  exit 1
fi

email="$1"
if [[ ! "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$ ]]; then
  echo "A valid email address is required" >&2
  exit 1
fi

docker compose exec -T auth_postgres psql -U root -d auth_db \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = '$email';"
