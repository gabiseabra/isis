#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

for workspace in api admin web; do
  target="$ROOT_DIR/$workspace/.env"

  ln -s ../.env "$target" 2>/dev/null || true
done
