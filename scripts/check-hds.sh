#!/bin/sh
# Spouští externí kontrolor HDS, nemění genealogická data ani aplikaci.
# HDS_CHECKER je cesta k instalačně nezávislému kontrolnímu Python skriptu.
set -eu
PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
if [ -z "${HDS_CHECKER:-}" ] || [ ! -f "$HDS_CHECKER" ]; then
  printf '%s\n' 'CHYBA: nastav HDS_CHECKER=/cesta/k/HDS/scripts/hacesoft_standard_check.py' >&2
  exit 3
fi
exec python3 "$HDS_CHECKER" "$PROJECT_DIR" --config "$PROJECT_DIR/hacesoft-standard.json" --run-syntax "$@"
