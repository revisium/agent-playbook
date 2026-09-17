#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const assertMode = process.argv.includes("--assert");
const read = (path) => readFileSync(join(root, path), "utf8");

// The two adapter formats have deliberately small, explicit startup blocks.
function wrapperReads(text, toml) {
  const section = toml
    ? text.match(/Before acting, read[^\n]+/i)?.[0]
    : text.split(/Before acting, read:/i)[1]?.split(/Follow the canonical/i)[0];
  return section?.match(/[\w./-]+\.md/g) ?? [];
}

assert.deepEqual(wrapperReads("Before acting, read roles/example/ROLE.md.", true), ["roles/example/ROLE.md"]);
assert.deepEqual(wrapperReads("Before acting, read roles/example/ROLE.md, roles/example/references/core.md.", true), ["roles/example/ROLE.md", "roles/example/references/core.md"]);
assert.deepEqual(wrapperReads("Before acting, read:\n- `roles/example/ROLE.md`\n- `references/quality/verification.md`\nFollow the canonical role.", false), ["roles/example/ROLE.md", "references/quality/verification.md"]);
assert.deepEqual(wrapperReads("No startup block", false), []);

const failures = [];
const roles = JSON.parse(read("catalog/roles.json"));
let wrapperCount = 0;
console.log("Static startup reads (estimated tokens = ceil(UTF-8 bytes / 4))");
for (const role of roles) {
  const content = read(role.path);
  const bytes = Buffer.byteLength(content);
  const estimate = Math.ceil(bytes / 4);
  const budget = role.id === "orchestrator" ? 4000 : 2000;
  if (estimate > budget) failures.push(`${role.id}: ${estimate} estimated tokens exceeds ${budget}`);
  if (!content.includes("## Context Loading\n")) failures.push(`${role.id}: missing context triggers`);
  for (const [adapter, path] of Object.entries(role.wrappers)) {
    const files = wrapperReads(read(path), path.endsWith(".toml"));
    wrapperCount += 1;
    if (files.length !== 1 || files[0] !== role.path) {
      failures.push(`${path}: expected only ${role.path}, got ${files.join(", ") || "no reads"}`);
    }
    console.log(`${adapter.padEnd(11)} ${role.id.padEnd(22)} reads=${files.length} bytes=${bytes} estTokens=${estimate}/${budget}`);
  }
}

for (const adapter of ["codex", "claude-code"]) {
  const path = `adapters/${adapter}/materialized/skills/agent-method/SKILL.md`;
  const files = [...read(path).matchAll(/^\d+\. Read `([^`]+)`/gm)].map((match) => match[1]);
  if (files.length !== 1 || files[0] !== "method/manual-run.md") {
    failures.push(`${path}: initial Read step must name only method/manual-run.md`);
  }
}
console.log(`${wrapperCount} role wrappers checked; 2 intake skill wrappers checked.`);
for (const failure of failures) console.error(failure);
if (assertMode && failures.length) process.exit(1);
console.log(failures.length ? "Static report has regressions (use --assert to fail)." : "Static checks passed.");
