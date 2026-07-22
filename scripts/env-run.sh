#!/usr/bin/env sh
set -eu

_script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$_script_dir/env-load.sh"
cd "$_script_dir/.."
exec "$@"
