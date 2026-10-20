#!/bin/sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
INFO="$PROJECT_DIR/src/appinfo/info.xml"
[ -f "$INFO" ] || { echo "ERROR: $INFO not found" >&2; exit 1; }

APP_ID="$(sed -n 's:.*<id>\([^<]*\)</id>.*:\1:p' "$INFO" | head -n 1)"
APP_NAME="$(sed -n 's:.*<name>\([^<]*\)</name>.*:\1:p' "$INFO" | head -n 1)"
[ -n "$APP_ID" ] || { echo "ERROR: app id not found" >&2; exit 1; }
[ -n "$APP_NAME" ] || APP_NAME="$APP_ID"

say(){ printf '%s\n' "$*"; }
die(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[ "$(id -u)" -eq 0 ] || die "Run this script with: sudo sh uninstall.sh"
command -v docker >/dev/null 2>&1 || die "Docker was not found."

container_has_occ(){ docker exec "$1" sh -c 'test -f /var/www/html/occ' >/dev/null 2>&1; }
WEB_CONTAINER=""
CRON_CONTAINER=""
if docker ps --format '{{.Names}}' | grep -qx 'nextcloud-app' && container_has_occ nextcloud-app; then WEB_CONTAINER=nextcloud-app; fi
if docker ps --format '{{.Names}}' | grep -qx 'nextcloud-cron' && container_has_occ nextcloud-cron; then CRON_CONTAINER=nextcloud-cron; fi
if [ -z "$WEB_CONTAINER" ]; then
 for c in $(docker ps --format '{{.Names}}' | grep -Ei 'nextcloud' || true); do
  case "$c" in *cron*) continue;; esac
  if container_has_occ "$c"; then WEB_CONTAINER="$c"; break; fi
 done
fi
if [ -z "$CRON_CONTAINER" ]; then
 for c in $(docker ps --format '{{.Names}}' | grep -Ei 'nextcloud.*cron|cron.*nextcloud' || true); do
  if container_has_occ "$c"; then CRON_CONTAINER="$c"; break; fi
 done
fi
[ -n "$WEB_CONTAINER" ] || die "Could not find the Nextcloud web container."

TARGET_DIR="/var/www/html/custom_apps/$APP_ID"
say "Nextcloud web container: $WEB_CONTAINER"
[ -n "$CRON_CONTAINER" ] && say "Nextcloud cron container: $CRON_CONTAINER"
say "Application: $APP_NAME ($APP_ID)"
say "Application code will be removed. Database data will be preserved."

if [ "${1:-}" != "--yes" ]; then
 printf 'Continue? [y/N] '
 read answer
 case "$answer" in y|Y|yes|YES|ano|ANO) ;; *) say "Uninstall cancelled."; exit 0;; esac
fi

BACKUP_DIR="$PROJECT_DIR/backups/${APP_ID}-uninstall-$(date +%Y%m%d-%H%M%S)"
if docker exec "$WEB_CONTAINER" sh -c "test -d '$TARGET_DIR'"; then
 mkdir -p "$BACKUP_DIR"
 docker cp "$WEB_CONTAINER:$TARGET_DIR/." "$BACKUP_DIR/"
 say "Application code backup: $BACKUP_DIR"
fi

if docker exec -u www-data "$WEB_CONTAINER" php /var/www/html/occ app:list --enabled 2>/dev/null | grep -q -- "- $APP_ID:"; then
 docker exec -u www-data "$WEB_CONTAINER" php /var/www/html/occ app:disable "$APP_ID"
fi

docker exec "$WEB_CONTAINER" rm -rf "$TARGET_DIR"
if [ -n "$CRON_CONTAINER" ] && [ "$CRON_CONTAINER" != "$WEB_CONTAINER" ]; then
 docker exec "$CRON_CONTAINER" rm -rf "$TARGET_DIR"
fi
docker exec "$WEB_CONTAINER" php -r 'if (function_exists("opcache_reset")) { opcache_reset(); }' >/dev/null 2>&1 || true

if docker exec "$WEB_CONTAINER" sh -c "test -e '$TARGET_DIR'"; then
 die "Application directory still exists: $TARGET_DIR"
fi
say "$APP_NAME was disabled and its application code was removed."
say "Database data was preserved for a possible later reinstall."
