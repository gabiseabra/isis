#!/usr/bin/env sh
set -eu

docker compose run --rm --no-deps -e NODE_ENV=development api \
  sh -lc 'npm install --include=dev "$@"' sh "$@"
