perl -0pi -e 's/^\\restrict dbmate\n//m' "${1:-$(dirname "$0")/../db/schema/schema.sql}"
perl -0pi -e "s/^SELECT pg_catalog\.set_config\('search_path', '', false\);$/SET search_path = public;/m" "${1:-$(dirname "$0")/../db/schema/schema.sql}"
perl -0pi -e 's/^\\unrestrict dbmate\n//m' "${1:-$(dirname "$0")/../db/schema/schema.sql}"
