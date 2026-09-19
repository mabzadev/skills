#!/usr/bin/env node
// Oracle de la boucle d'auto-amélioration — la définition de « le dépôt est correct ».
// Commande d'exploitation : la logique vit dans tests/lints/rules.mjs, partagée
// avec les tests de tests/checks/.
//
// Usage :
//   node scripts/validate-skills.mjs                 # vérification complète
//   node scripts/validate-skills.mjs --feedback      # journal uniquement (rapide, après une capture)
//   node scripts/validate-skills.mjs --skill <nom>   # un skill et ses références (rapide, après une modification)
//   node scripts/validate-skills.mjs --root <chemin> # vérifier une autre racine (bac à sable des tests e2e)
//
// Sortie : une erreur par ligne (« chemin : problème »), puis un bilan.
// Exit 0 si tout passe, 1 sinon. Aucune dépendance, aucun accès réseau.

import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectErrors } from "../tests/lints/rules.mjs";

const args = process.argv.slice(2);
const defaultRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

let mode = "full";
let skill = null;
let root = defaultRoot;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--feedback") mode = "feedback";
  else if (args[i] === "--skill") { skill = args[++i]; mode = "skill"; }
  else if (args[i] === "--root") root = resolve(args[++i]);
  else { console.error(`argument inconnu : ${args[i]}`); process.exit(2); }
}

if (mode === "skill" && !skill) {
  console.error("usage : validate-skills.mjs --skill <nom>");
  process.exit(2);
}

const { errors, report } = collectErrors(root, { mode, skill });

if (errors.length) {
  console.error(`ÉCHEC — ${errors.length} problème(s) :`);
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n${report}`);
  process.exit(1);
}
console.log(`OK — ${report}`);
