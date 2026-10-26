#!/usr/bin/env bash
#
# Stage-1 smoke test against a Local (or any WP-CLI) site. Run from Local Site Shell
# when possible so DB credentials match. Optional: export WP_PATH to WordPress root.
#
# Usage:
#   export WP_PATH="/Users/you/Local Sites/yoursite/app/public"
#   ./tests/smoke-local.sh
#
set -euo pipefail

PLUGIN_SLUG="s2j-alliance-manager"
PLUGIN_ENTRY="${PLUGIN_SLUG}/${PLUGIN_SLUG}.php"
REST_NAMESPACE="s2j-alliance-manager/v1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ADMIN_JS="${PLUGIN_ROOT}/dist/js/s2j-alliance-manager-settings.js"
BLOCK_JSON="${PLUGIN_ROOT}/dist/blocks/alliance-banner/block.json"

WP_ARGS=()
if [[ -n "${WP_PATH:-}" ]]; then
	WP_ARGS+=(--path="${WP_PATH}")
fi

if ! command -v wp >/dev/null 2>&1; then
	echo "FAIL: wp (WP-CLI) not found. Use Local → Site Shell." >&2
	exit 1
fi

if ! wp "${WP_ARGS[@]}" core is-installed >/dev/null 2>&1; then
	echo "FAIL: WordPress not reachable. Set WP_PATH to the site public directory (Local Site Shell sets cwd)." >&2
	exit 1
fi

if ! wp "${WP_ARGS[@]}" plugin is-installed "${PLUGIN_SLUG}" >/dev/null 2>&1; then
	echo "FAIL: Plugin ${PLUGIN_SLUG} is not installed under wp-content/plugins." >&2
	exit 1
fi

wp "${WP_ARGS[@]}" plugin activate "${PLUGIN_SLUG}" >/dev/null 2>&1 || true

if ! wp "${WP_ARGS[@]}" plugin is-active "${PLUGIN_SLUG}" >/dev/null 2>&1; then
	echo "FAIL: Plugin could not be activated." >&2
	exit 1
fi

if [[ ! -f "${ADMIN_JS}" ]]; then
	echo "WARN: ${ADMIN_JS} missing. Run npm run build:production for admin UI assets." >&2
fi

if [[ ! -f "${BLOCK_JSON}" ]]; then
	echo "WARN: ${BLOCK_JSON} missing. Run npm run build:production for the alliance-banner block." >&2
fi

wp "${WP_ARGS[@]}" eval "
do_action( 'rest_api_init' );
\$route = '/' . '${REST_NAMESPACE}' . '/settings';
\$routes = rest_get_server()->get_routes();
if ( ! isset( \$routes[ \$route ] ) ) {
	exit( 1 );
}
if ( ! class_exists( 'S2J_Alliance_Manager_RestController' ) ) {
	exit( 2 );
}
if ( ! post_type_exists( 's2j_am_rank_label' ) ) {
	exit( 3 );
}
echo 'ok';
"

echo "PASS: ${PLUGIN_SLUG} active; REST /settings, RestController, and rank CPT present."
