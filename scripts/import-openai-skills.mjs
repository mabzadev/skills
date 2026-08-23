#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const API_BASE = process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1";
const API_KEY = process.env.OPENAI_API_KEY;
const PROJECT = process.env.OPENAI_PROJECT;
const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = path.resolve(process.cwd(), "skills");

if (!API_KEY && !DRY_RUN) {
  console.error("OPENAI_API_KEY is required (or run with --dry-run).");
  process.exit(1);
}

async function listSkillDirs() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(ROOT, entry.name);
    try {
      await fs.access(path.join(dir, "SKILL.md"));
      dirs.push({ name: entry.name, dir });
    } catch {
      // Ignore non-skill folders.
    }
  }
  return dirs.sort((a, b) => a.name.localeCompare(b.name));
}

async function walkFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, base)));
    } else if (entry.isFile()) {
      files.push({ full, rel: path.relative(base, full).replaceAll(path.sep, "/") });
    }
  }
  return files;
}

function headers(extra = {}) {
  const h = {
    Authorization: `Bearer ${API_KEY}`,
    ...extra,
  };
  if (PROJECT) h["OpenAI-Project"] = PROJECT;
  return h;
}

async function listRemoteSkills() {
  const names = new Set();
  let after;
  do {
    const url = new URL(`${API_BASE}/skills`);
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error(`List skills failed: ${res.status} ${await res.text()}`);
    const body = await res.json();
    for (const item of body.data ?? []) {
      if (item?.name) names.add(item.name);
    }
    after = body.has_more ? body.last_id : undefined;
  } while (after);
  return names;
}

async function uploadSkill(skill) {
  const files = await walkFiles(skill.dir);

  if (DRY_RUN) {
    console.log(`[dry-run] ${skill.name}: ${files.length} files`);
    return;
  }

  const form = new FormData();
  form.append("name", skill.name);

  for (const file of files) {
    const bytes = await fs.readFile(file.full);
    form.append("files", new Blob([bytes]), file.rel);
  }

  const res = await fetch(`${API_BASE}/skills`, {
    method: "POST",
    headers: headers(),
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload ${skill.name} failed: ${res.status} ${await res.text()}`);
  }

  const body = await res.json();
  console.log(`Uploaded ${skill.name}${body?.id ? ` (${body.id})` : ""}`);
}

const localSkills = await listSkillDirs();
console.log(`Found ${localSkills.length} local skills.`);

if (DRY_RUN) {
  for (const skill of localSkills) await uploadSkill(skill);
  process.exit(0);
}

const remoteNames = await listRemoteSkills();
let uploaded = 0;
let skipped = 0;

for (const skill of localSkills) {
  if (remoteNames.has(skill.name)) {
    console.log(`Skip ${skill.name}: already exists remotely.`);
    skipped += 1;
    continue;
  }
  await uploadSkill(skill);
  uploaded += 1;
}

console.log(`Done. Uploaded: ${uploaded}. Skipped: ${skipped}.`);
