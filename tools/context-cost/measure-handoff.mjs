#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const assertMode = args.includes("--assert");
const files = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--assert") continue;
  if (args[index] !== "--file" || !args[index + 1] || args[index + 1].startsWith("--")) {
    throw new Error("Usage: measure-handoff.mjs [--assert] [--file <named-file>]...");
  }
  files.push(resolve(args[++index]));
}

// Lexical regression only: does not parse YAML or establish snapshot identity.
function scoreHandoff(text) {
  const versions = (pattern) => [...new Set([...text.matchAll(pattern)].map((match) => match[1]))];
  const analysis = versions(/\banalysis[- ]v(\d+)\b/gi);
  const architecture = versions(/\barchitecture[- ]v(\d+)\b/gi);
  const rounds = versions(/\b(?:review-)?round-(\d+)\b/gi);
  return { analysis, architecture, rounds, invalid: [analysis, architecture, rounds].some((pins) => pins.length > 1) };
}

const fixtures = [
  ["good-review-handoff.md", false],
  ["bad-review-handoff.md", true],
];
for (const [name, invalid] of fixtures) {
  const score = scoreHandoff(readFileSync(join(here, "fixtures", name), "utf8"));
  assert.equal(score.invalid, invalid, `${name}: unexpected lexical result`);
  console.log(`${name}: ${invalid ? "rejected" : "accepted"} as expected`);
}
// Each kind must fail independently; repeated mentions of one pin are allowed.
for (const kind of ["analysis-v", "architecture-v", "review-round-"]) {
  assert.equal(scoreHandoff(`${kind}1 ${kind}2`).invalid, true, `${kind}: conflicting pins`);
  assert.equal(scoreHandoff(`${kind}1 ${kind}1`).invalid, false, `${kind}: repeated current pin`);
}
assert.equal(scoreHandoff("initial review: no previous pin").invalid, false);

let failures = 0;
for (const file of files) {
  const score = scoreHandoff(readFileSync(file, "utf8"));
  if (score.invalid) failures += 1;
  console.log(`${file}: ${JSON.stringify(score)}`);
}
if (assertMode && failures) process.exit(1);
console.log(failures
  ? "Handoff report contains conflicting versions (use --assert to fail)."
  : "Handoff lexical regression checks passed. Field/snapshot semantics require runtime validation.");
