#!/usr/bin/env bash
#
# Install WordPress core and the PHPUnit test library (no Docker).
# Based on the WordPress plugin handbook install script.
#
# Usage: install-wp-tests.sh <db-name> <db-user> <db-pass> [db-host] [wp-version] [skip-db-create]
#
set -euo pipefail

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [skip-db-create]"
	exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASSWORD=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}
SKIP_DB_CREATE=${6-false}

if [ "${DB_NAME}" = "local" ]; then
	echo "Refusing to install tests against database \"local\" (Local site database)." >&2
	echo "Pass a dedicated test database name, e.g. wordpress_test." >&2
	exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TMPDIR=${TMPDIR-/tmp}
TMPDIR=$(echo "$TMPDIR" | sed 's/\/$//')
WP_TESTS_DIR=${WP_TESTS_DIR-"${PLUGIN_DIR}/tests/.wordpress-tests-lib"}
WP_CORE_DIR=${WP_CORE_DIR-"${PLUGIN_DIR}/tests/.wordpress"}

resolve_wp_version() {
	if [ "$WP_VERSION" != "latest" ]; then
		return 0
	fi
	local API_JSON
	API_JSON="$(download "https://api.wordpress.org/core/version-check/1.7/")"
	WP_VERSION="$(php -r '
		$data = json_decode( stream_get_contents( STDIN ), true );
		echo is_array( $data ) && ! empty( $data["offers"][0]["version"] )
			? $data["offers"][0]["version"]
			: "6.7";
	' <<<"$API_JSON")"
	echo "Using WordPress ${WP_VERSION} for core and test library."
}

download() {
	if [ "$(which curl)" ]; then
		curl -s "$1"
	elif [ "$(which wget)" ]; then
		wget -nv -O- "$1"
	else
		echo "Error: curl or wget is required."
		exit 1
	fi
}

install_db() {
	if [ "${SKIP_DB_CREATE}" = "true" ]; then
		return 0
	fi

	local DB_HOSTNAME="$DB_HOST"
	local DB_SOCK=""
	if [[ "$DB_HOST" == *:* ]]; then
		DB_HOSTNAME="${DB_HOST%%:*}"
		DB_SOCK="${DB_HOST#*:}"
	fi

	local MYSQL_ARGS=( --user="$DB_USER" --password="$DB_PASSWORD" )
	if [ -n "$DB_SOCK" ]; then
		MYSQL_ARGS+=( --socket="$DB_SOCK" )
	elif [ "$DB_HOSTNAME" != "localhost" ]; then
		MYSQL_ARGS+=( --host="$DB_HOSTNAME" --protocol=tcp )
	fi

	local MYSQL_ERR
	if ! MYSQL_ERR="$(mysql "${MYSQL_ARGS[@]}" --execute="CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;" 2>&1)"; then
		echo "Could not create database \"${DB_NAME}\". Check .env.tests (see .env.tests.example)." >&2
		if [ -n "$MYSQL_ERR" ]; then
			echo "$MYSQL_ERR" >&2
		fi
		exit 1
	fi
}

install_wp() {
	if [ -d "$WP_CORE_DIR/wp-includes" ]; then
		return 0
	fi

	mkdir -p "$WP_CORE_DIR"

	if [ "$WP_VERSION" = "trunk" ]; then
		if [ "$(which svn)" ]; then
			svn export --force --quiet "https://develop.svn.wordpress.org/trunk/src/" "$WP_CORE_DIR"
		else
			echo "Error: svn is required for WP_VERSION=trunk." >&2
			exit 1
		fi
	else
		download "https://wordpress.org/wordpress-${WP_VERSION}.tar.gz" | tar xz -C "$WP_CORE_DIR" --strip-components=1
	fi
}

install_test_suite() {
	if [ -d "$WP_TESTS_DIR/includes" ] && [ -f "$WP_TESTS_DIR/wp-tests-config.php" ]; then
		return 0
	fi

	mkdir -p "$WP_TESTS_DIR"

	if [ "$WP_VERSION" = "trunk" ]; then
		local BRANCH="trunk"
	else
		local BRANCH="tags/${WP_VERSION}"
	fi

	if [ ! -d "$WP_TESTS_DIR/includes" ]; then
		if [ "$(which svn)" ]; then
			svn export --force --quiet "https://develop.svn.wordpress.org/${BRANCH}/tests/phpunit/includes/" "$WP_TESTS_DIR/includes"
			svn export --force --quiet "https://develop.svn.wordpress.org/${BRANCH}/tests/phpunit/data/" "$WP_TESTS_DIR/data"
		else
			echo "Error: svn is required to download the WordPress test suite."
			exit 1
		fi
	fi

	if [ ! -f "$WP_TESTS_DIR/wp-tests-config.php" ]; then
		download "https://develop.svn.wordpress.org/${BRANCH}/wp-tests-config-sample.php" > "$WP_TESTS_DIR/wp-tests-config.php"
		WP_TESTS_CONFIG_FILE="$WP_TESTS_DIR/wp-tests-config.php" \
		WP_TESTS_ABSPATH="$WP_CORE_DIR/" \
		WP_TESTS_DB_NAME="$DB_NAME" \
		WP_TESTS_DB_USER="$DB_USER" \
		WP_TESTS_DB_PASSWORD="$DB_PASSWORD" \
		WP_TESTS_DB_HOST="$DB_HOST" \
		php <<'PHP'
<?php
$file = getenv( 'WP_TESTS_CONFIG_FILE' );
if ( ! is_string( $file ) || '' === $file ) {
	fwrite( STDERR, "WP_TESTS_CONFIG_FILE is not set.\n" );
	exit( 1 );
}
$config = file_get_contents( $file );
if ( false === $config ) {
	fwrite( STDERR, "Could not read wp-tests-config.php.\n" );
	exit( 1 );
}
$abspath = getenv( 'WP_TESTS_ABSPATH' );
$config  = str_replace( "dirname( __FILE__ ) . '/src/'", var_export( $abspath, true ), $config );
$config  = str_replace( 'youremptytestdbnamehere', (string) getenv( 'WP_TESTS_DB_NAME' ), $config );
$config  = str_replace( 'yourusernamehere', (string) getenv( 'WP_TESTS_DB_USER' ), $config );
$config  = str_replace( 'yourpasswordhere', (string) getenv( 'WP_TESTS_DB_PASSWORD' ), $config );
$config  = preg_replace(
	"/define\\( 'DB_HOST', '[^']*' \\);/",
	"define( 'DB_HOST', " . var_export( (string) getenv( 'WP_TESTS_DB_HOST' ), true ) . ' );',
	$config,
	1
);
if ( false === file_put_contents( $file, $config ) ) {
	fwrite( STDERR, "Could not write wp-tests-config.php.\n" );
	exit( 1 );
}
PHP
	fi
}

resolve_wp_version
install_db
install_wp
install_test_suite

echo "WordPress test library installed."
echo "  WP_CORE_DIR=${WP_CORE_DIR}"
echo "  WP_TESTS_DIR=${WP_TESTS_DIR}"
