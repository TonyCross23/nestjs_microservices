#!/bin/bash
set -e

cat >> "$PGDATA/pg_hba.conf" <<PGHBA
host replication root 0.0.0.0/0 md5
host all root 0.0.0.0/0 md5
PGHBA