#!/usr/bin/env bash
set -euo pipefail

# PRÉ-VOL — vérifie tout ce que le dépôt doit satisfaire avant d'être
# construit ou publié : oracle complet, tests, synchro des versions.
# Lecture seule : échoue proprement sans laisser d'état derrière lui.

cd "$(dirname "$0")/.."

echo "=== Oracle du dépôt ==="
node scripts/validate-skills.mjs

echo ""
echo "=== Tests ==="
node --test

echo ""
echo "=== Synchro des versions ==="
node scripts/sync-plugin-version.mjs --check

echo ""
echo "PRÉ-VOL OK — le dépôt peut être construit."
