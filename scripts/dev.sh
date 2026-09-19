#!/usr/bin/env bash
set -euo pipefail

# DÉVELOPPER — installe l'environnement de travail local : liens des skills
# vers ~/.agents/skills, oracle et tests. Idempotent : relançable sans risque.

cd "$(dirname "$0")/.."

echo "=== Liens locaux des skills ==="
bash scripts/link-skills.sh

echo ""
echo "=== Oracle du dépôt ==="
node scripts/validate-skills.mjs

echo ""
echo "=== Tests ==="
node --test
