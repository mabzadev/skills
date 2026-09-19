// Tests des règles de l'oracle — propriétaire : règles générales du dépôt.
// Les règles vivent dans tests/lints/rules.mjs ; ces tests les éprouvent
// sur des journaux jetables construits depuis tests/fixtures/feedback/.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkFeedback, collectErrors, parseFrontmatter } from "../../lints/rules.mjs";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../../fixtures/feedback");

function journal(entries = []) {
  const root = mkdtempSync(join(tmpdir(), "oracle-"));
  mkdirSync(join(root, ".agents/feedback"), { recursive: true });
  writeFileSync(join(root, ".agents/feedback/README.md"), "# Journal\n");
  writeFileSync(join(root, ".agents/feedback/TEMPLATE.md"), "---\ntype: fonctionnalite\n---\n");
  for (const { from, as } of entries) {
    copyFileSync(join(fixtures, from), join(root, ".agents/feedback", as));
  }
  return root;
}

test("parseFrontmatter lit les champs du frontmatter", () => {
  const fm = parseFrontmatter("---\ndate: 2026-01-31\ntype: concept\nstatut: ouvert\n---\n\nCorps.");
  assert.equal(fm.date, "2026-01-31");
  assert.equal(fm.type, "concept");
  assert.equal(fm.statut, "ouvert");
  assert.equal(parseFrontmatter("Pas de frontmatter."), null);
});

test("README et TEMPLATE ne sont jamais comptés comme entrées", () => {
  const root = journal();
  try {
    const { errors, count } = checkFeedback(root);
    assert.equal(count, 0);
    assert.deepEqual(errors, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("une entrée valide passe sans erreur", () => {
  const root = journal([{ from: "2026-01-31-entree-valide.md", as: "2026-01-31-entree-valide.md" }]);
  try {
    const { errors, count } = checkFeedback(root);
    assert.equal(count, 1);
    assert.deepEqual(errors, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("une entrée cassée signale chacun de ses problèmes", () => {
  const root = journal([{ from: "entree-cassee.md", as: "2026-01-31-entree-cassee.md" }]);
  try {
    const { errors, count } = checkFeedback(root);
    assert.equal(count, 1);
    assert.equal(errors.length, 7);
    assert.ok(errors.some((e) => e.includes("la date du frontmatter (2026-01-30) ne correspond pas au nom de fichier (2026-01-31)")), errors.join("\n"));
    assert.ok(errors.some((e) => e.includes("type inconnu « mauvais-type »")));
    assert.ok(errors.some((e) => e.includes("champ `cible` vide")));
    for (const sec of ["Contexte", "Action proposée", "Critère de vérification"]) {
      assert.ok(errors.some((e) => e.includes(`section « ${sec} » manquante`)), `section ${sec}`);
    }
    assert.ok(errors.some((e) => e.includes("statut « integre » mais aucune section « ## Trace »")));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("le mode feedback de collectErrors vérifie le journal et rien d'autre", () => {
  const root = journal([{ from: "2026-01-31-entree-valide.md", as: "2026-01-31-entree-valide.md" }]);
  try {
    const { errors, report } = collectErrors(root, { mode: "feedback" });
    assert.deepEqual(errors, []);
    assert.match(report, /1 entrée/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
