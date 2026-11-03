// Parcours complet de la boucle d'auto-amélioration, en bac à sable.
// Reproduit le cycle réel — amorçage du journal, capture d'une entrée cassée
// détectée par l'oracle, remplacement par une entrée valide, oracle au vert —
// sans jamais toucher le vrai journal du dépôt.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, copyFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../..");
const oracle = join(repo, "scripts/validate-skills.mjs");
const fixtures = join(repo, "tests/fixtures/feedback");

const run = (root) => spawnSync(process.execPath, [oracle, "--root", root, "--feedback"], { encoding: "utf8" });

test("la boucle complète : journal vide → capture cassée → correction → vert", () => {
  const root = mkdtempSync(join(tmpdir(), "boucle-e2e-"));
  const journal = join(root, ".agents/feedback");
  try {
    // 1. Amorçage (ce que fait note-mabza à la première capture)
    mkdirSync(journal, { recursive: true });
    writeFileSync(join(journal, "README.md"), "# Journal\n");
    let r = run(root);
    assert.equal(r.status, 0, `journal vide : ${r.stderr}`);
    assert.match(r.stdout, /OK/);

    // 2. Capture d'une entrée cassée → l'oracle doit la signaler
    copyFileSync(join(fixtures, "entree-cassee.md"), join(journal, "2026-01-31-entree-cassee.md"));
    r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /ÉCHEC/);
    assert.match(r.stderr, /type inconnu « mauvais-type »/);

    // 3. Remplacement par une entrée valide → l'oracle repasse au vert
    unlinkSync(join(journal, "2026-01-31-entree-cassee.md"));
    copyFileSync(join(fixtures, "2026-01-31-entree-valide.md"), join(journal, "2026-01-31-entree-valide.md"));
    r = run(root);
    assert.equal(r.status, 0, `entrée valide : ${r.stderr}`);
    assert.match(r.stdout, /1 entrée/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
