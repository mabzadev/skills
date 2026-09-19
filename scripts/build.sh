#!/usr/bin/env bash
set -euo pipefail

# CONSTRUIRE — assemble ./dist, le plugin prêt à publier, à partir des
# sources : le manifeste .codex-plugin/plugin.json et les skills qu'il
# référence. Le pré-vol est exécuté d'abord ; ./dist est toujours
# reconstruit depuis la source et n'est jamais versionné.

cd "$(dirname "$0")/.."

bash scripts/prepare-dist.sh

echo ""
echo "=== Assemblage de ./dist ==="
rm -rf dist
mkdir -p dist
cp -R .codex-plugin dist/.codex-plugin
cp -R skills dist/skills

echo "Plugin assemblé dans ./dist :"
echo "  skills : $(find dist/skills -name SKILL.md | wc -l | tr -d ' ')"
echo "  manifeste : dist/.codex-plugin/plugin.json"
