_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." >/dev/null && pwd)
_env=${ENV:-${APP_ENV:-${NODE_ENV:-}}}

set -a
[ -f "$_root/.env" ] && . "$_root/.env"
[ -f "$_root/.env.local" ] && . "$_root/.env.local"
[ -n "$_env" ] && [ -f "$_root/.env.$_env" ] && . "$_root/.env.$_env"
set +a

unset _root _env
