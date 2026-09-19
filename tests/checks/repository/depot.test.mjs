// Test de régression du dépôt lui-même — propriétaire : règles générales.
// Le dépôt doit passer son propre oracle complet : journal, arborescence des
// skills, index, pages de documentation et versions. C'est ce test qui
// échoue si une modification casse un invariant, avant même la CI.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectErrors } from "../../lints/rules.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

test("le dépôt réel passe l'oracle complet", () => {
  const { errors, report } = collectErrors(repo);
  assert.deepEqual(errors, []);
  assert.match(report, /journal : \d+ entrée/);
  assert.match(report, /skills : \d+/);
});
