// Règles d'analyse du dépôt — la source de vérité partagée entre l'oracle
// (scripts/validate-skills.mjs) et les tests (tests/checks/). Ce fichier ne
// contient aucune commande : il exporte des règles pures, paramétrées par
// la racine du dépôt à vérifier.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

export const TYPES = ["fonctionnalite", "concept", "amelioration", "rejet"];
export const STATUS = ["ouvert", "integre", "rejete"];
export const ENTRY_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;
export const PROMOTED = ["engineering", "productivity"];
export const CATEGORIES = ["engineering", "productivity", "marketing", "misc", "in-progress", "deprecated"];
export const ENTRY_SECTIONS = ["## Observation", "## Contexte", "## Action proposée", "## Critère de vérification"];

const read = (root, p) => readFileSync(join(root, p), "utf8");
const exists = (root, p) => existsSync(join(root, p));

export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

const skillLinks = (text) => [...text.matchAll(/skills\/([a-z0-9-]+)\/SKILL\.md/g)].map((m) => m[1]);
const relLinks = (text) => [...text.matchAll(/\]\((\.{1,2}\/[^)#]+)\)/g)].map((m) => m[1]);

// ---- Journal d'amélioration -------------------------------------------------

export function checkFeedback(root) {
  const dir = ".agents/feedback";
  const files = exists(root, dir) ? readdirSync(join(root, dir)) : [];
  const errors = [];
  let count = 0;
  for (const name of files) {
    if (!ENTRY_RE.test(name)) continue; // README.md, TEMPLATE.md : jamais des entrées
    count++;
    const path = `${dir}/${name}`;
    const text = read(root, path);
    const fm = parseFrontmatter(text);
    if (!fm) { errors.push(`${path} : frontmatter absent`); continue; }
    if (!fm.date) errors.push(`${path} : champ \`date\` manquant`);
    else if (fm.date !== name.slice(0, 10)) errors.push(`${path} : la date du frontmatter (${fm.date}) ne correspond pas au nom de fichier (${name.slice(0, 10)})`);
    if (!TYPES.includes(fm.type)) errors.push(`${path} : type inconnu « ${fm.type} » (attendu : ${TYPES.join(", ")})`);
    if (!STATUS.includes(fm.statut)) errors.push(`${path} : statut inconnu « ${fm.statut} » (attendu : ${STATUS.join(", ")})`);
    if (!fm.cible) errors.push(`${path} : champ \`cible\` vide`);
    for (const sec of ENTRY_SECTIONS) {
      if (!text.includes(sec)) errors.push(`${path} : section « ${sec.replace("## ", "")} » manquante`);
    }
    if (fm.statut && fm.statut !== "ouvert" && !text.includes("## Trace")) {
      errors.push(`${path} : statut « ${fm.statut} » mais aucune section « ## Trace »`);
    }
  }
  return { errors, count };
}

// ---- Skills, index, documentation, versions -----------------------------------

export function categoryOf(root, skill) {
  for (const cat of CATEGORIES) {
    const readme = `catalog/${cat}/README.md`;
    if (exists(root, readme) && skillLinks(read(root, readme)).includes(skill)) return cat;
  }
  return null;
}

export function checkSkill(root, skill) {
  const dir = `skills/${skill}`;
  const path = `${dir}/SKILL.md`;
  const errors = [];
  if (!exists(root, path)) { errors.push(`${dir} : SKILL.md manquant`); return errors; }
  const text = read(root, path);
  const fm = parseFrontmatter(text);
  if (!fm) errors.push(`${path} : frontmatter absent`);
  else {
    if (fm.name !== skill) errors.push(`${path} : name du frontmatter « ${fm.name} » ≠ nom du dossier « ${skill} »`);
    if (!fm.description || fm.description.length < 10) errors.push(`${path} : description manquante ou trop courte`);
  }
  const yamlPath = `${dir}/agents/openai.yaml`;
  if (!exists(root, yamlPath)) errors.push(`${dir} : agents/openai.yaml manquant`);
  else {
    const y = read(root, yamlPath);
    for (const key of ["display_name", "short_description"]) {
      if (!y.includes(key)) errors.push(`${yamlPath} : « ${key} » manquant`);
    }
  }

  const cat = categoryOf(root, skill);
  if (!cat) { errors.push(`${dir} : aucune catégorie du catalogue ne référence ce skill`); return errors; }

  const rootHas = skillLinks(read(root, "README.md")).includes(skill);
  if (PROMOTED.includes(cat) || cat === "marketing") {
    if (!rootHas) errors.push(`README.md : le skill promu « ${skill} » (${cat}) n'y est pas référencé`);
  } else if (rootHas) {
    errors.push(`README.md : le skill « ${skill} » (${cat}, catégorie non promue) ne doit pas apparaître dans la liste publique`);
  }

  if (PROMOTED.includes(cat)) {
    const page = `docs/${cat}/${skill}.md`;
    if (!exists(root, page)) errors.push(`${page} : page de documentation manquante pour un skill promu`);
    else {
      const t = read(root, page);
      if (/^# /m.test(t)) errors.push(`${page} : un H1 est interdit (le titre vient du slug)`);
      if (!/^## Ce qu[’']il fait/m.test(t)) errors.push(`${page} : section « Ce qu’il fait » manquante`);
      if (!/^## Quand l[’']utiliser/m.test(t)) errors.push(`${page} : section « Quand l’utiliser » manquante`);
    }
  }

  const yaml = exists(root, yamlPath) ? read(root, yamlPath) : "";
  // Le routeur couvre les skills publics : la règle s'applique aux catégories
  // promues ; les bêta (in-progress, misc) restent volontairement hors du
  // flux public, comme hors du README racine.
  if (yaml.includes("allow_implicit_invocation: false") && PROMOTED.includes(cat)) {
    if (!read(root, "skills/ask-mabza/SKILL.md").includes(skill)) {
      errors.push(`skills/ask-mabza/SKILL.md : le skill réservé à l'utilisateur « ${skill} » (${cat}) n'est pas référencé par le routeur`);
    }
  }
  return errors;
}

export function checkTree(root) {
  const errors = [];
  const dir = join(root, "skills");
  if (!existsSync(dir)) return { errors, count: 0 };
  const names = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "node_modules")
    .map((d) => d.name).sort();
  for (const name of names) errors.push(...checkSkill(root, name));
  return { errors, count: names.length };
}

export function checkLinks(root) {
  const errors = [];
  const files = ["README.md", "skills/ask-mabza/SKILL.md",
    ...CATEGORIES.filter((c) => exists(root, `catalog/${c}/README.md`)).map((c) => `catalog/${c}/README.md`)];
  for (const f of files) {
    if (!exists(root, f)) continue;
    const base = dirname(join(root, f));
    for (const link of relLinks(read(root, f))) {
      if (!existsSync(resolve(base, link))) errors.push(`${f} : lien cassé ${link}`);
    }
  }
  return errors;
}

export function checkVersions(root) {
  const errors = [];
  const pkgPath = join(root, "package.json");
  const pluginPath = join(root, ".codex-plugin/plugin.json");
  if (!existsSync(pkgPath) || !existsSync(pluginPath)) return errors;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")).version;
  const plugin = JSON.parse(readFileSync(pluginPath, "utf8")).version;
  if (pkg !== plugin) errors.push(`.codex-plugin/plugin.json : version ${plugin} ≠ package.json ${pkg}`);
  return errors;
}

// ---- Orchestration -------------------------------------------------------------

export function collectErrors(root, { mode = "full", skill = null } = {}) {
  const errors = [];
  let report;
  if (mode === "feedback") {
    const { errors: e, count } = checkFeedback(root);
    errors.push(...e);
    report = `journal : ${count} entrée(s) vérifiée(s)`;
  } else if (mode === "skill") {
    errors.push(...checkSkill(root, skill));
    report = `skill ${skill} : vérifié avec ses références`;
  } else {
    const fb = checkFeedback(root);
    const tree = checkTree(root);
    errors.push(...fb.errors, ...tree.errors, ...checkLinks(root), ...checkVersions(root));
    report = `journal : ${fb.count} entrée(s) — skills : ${tree.count} — index, pages et versions : vérifiés`;
  }
  return { errors, report };
}
