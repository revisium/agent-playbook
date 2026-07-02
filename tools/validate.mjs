#!/usr/bin/env node

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const shouldBuildCatalogs = process.argv.includes("--build-catalogs");
const markdownValidationRoots = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "method",
  "roles",
  "pipelines",
  "references",
  "stacks",
  "adapters",
  "templates",
  "checklists",
];
const envBoundaryRoots = [
  ...markdownValidationRoots,
  ".github",
  "tools",
];
const ignoredEnvBoundaryPrefixes = ["legacy/"];
const allowedNonPipelineSkillWrappers = new Set(["agent-method"]);
const allowedRoleSurfaces = new Set([
  "any",
  "backend",
  "frontend",
  "repo",
  "deployment",
  "method",
]);
const allowedRoleRights = new Set([
  "read-only",
  "write-working-tree",
  "git-gh",
  "deploy-read",
  "qa-live",
  "deterministic-script",
]);
const allowedModelLevels = new Set(["cheap", "standard", "deep"]);
const allowedConsensusModes = new Set([
  "none",
  "single-reviewer",
  "dual-model",
  "adversarial-consensus",
]);
const allowedRunnerIds = new Set([
  "claude-code",
  "codex",
  "revo-integrator",
  "revo-merger",
  "revo-deterministic",
  "other",
]);

function rel(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function fail(path, message, line = null) {
  failures.push(`${rel(path)}${line ? `:${line}` : ""} - ${message}`);
}

function read(path) {
  return readFileSync(path, "utf8");
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function walk(dir, predicate = () => true) {
  const entries = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      entries.push(...walk(path, predicate));
    } else if (predicate(path)) {
      entries.push(path);
    }
  }
  return entries;
}

function filesUnder(paths, predicate = () => true) {
  const files = [];
  for (const entry of paths) {
    const path = join(root, entry);
    if (!exists(path)) {
      continue;
    }

    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path, predicate));
    } else if (predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

function stripInlineComment(value) {
  const hashIndex = value.indexOf(" #");
  return hashIndex === -1 ? value : value.slice(0, hashIndex).trimEnd();
}

function parseFrontmatter(path, requiredKeys = ["name", "description"]) {
  const lines = read(path).split(/\r?\n/);
  if (lines[0] !== "---") {
    fail(path, "missing YAML frontmatter opening marker", 1);
    return null;
  }

  const end = lines.findIndex((line, index) => index > 0 && line === "---");
  if (end === -1) {
    fail(path, "missing YAML frontmatter closing marker", 1);
    return null;
  }

  const data = {};
  for (let index = 1; index < end; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      fail(path, "frontmatter line must be `key: value`", index + 1);
      continue;
    }

    const [, key, rawValue] = match;
    const value = stripInlineComment(rawValue.trim());
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (!quoted && /:\s/.test(value)) {
      fail(path, "frontmatter value containing `: ` must be quoted", index + 1);
    }

    data[key] = quoted ? value.slice(1, -1) : value;
  }

  for (const key of requiredKeys) {
    if (!data[key]) {
      fail(path, `frontmatter is missing \`${key}\``);
    }
  }

  return data;
}

function markdownBody(path) {
  const lines = read(path).split(/\r?\n/);
  if (lines[0] !== "---") {
    return lines.join("\n");
  }

  const end = lines.findIndex((line, index) => index > 0 && line === "---");
  if (end === -1) {
    return lines.join("\n");
  }

  return lines.slice(end + 1).join("\n").replace(/^\n/, "");
}

function parseTomlAssignments(path) {
  const data = {};
  read(path)
    .split(/\r?\n/)
    .forEach((line, index) => {
      const match = line.match(/^([A-Za-z0-9_-]+)\s*=\s*"(.*)"\s*$/);
      if (match) {
        data[match[1]] = match[2];
        return;
      }
      if (/^[A-Za-z0-9_-]+\s*=/.test(line) && !line.includes('"""')) {
        fail(
          path,
          "TOML assignment must be a quoted string in adapter wrappers",
          index + 1,
        );
      }
    });
  return data;
}

function parseCatalog(path) {
  const records = new Map();
  const lines = read(path).split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    const header = line.match(/^### `([^`]+)`/);
    if (header) {
      current = { id: header[1], fields: {} };
      records.set(current.id, current.fields);
      continue;
    }

    const field = line.match(/^- ([a-z_]+):\s*(.*)$/);
    if (current && field) {
      current.fields[field[1]] = normalizeCatalogValue(field[2]);
    }
  }

  return records;
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function extractMarkdownLinks(path) {
  const text = read(path);
  const links = [];
  const pattern = /!?\[[^\]]*]\(([^)\n]+)\)/g;

  for (const match of text.matchAll(pattern)) {
    const destination = parseMarkdownDestination(match[1]);
    if (!destination) {
      continue;
    }
    links.push({
      destination,
      line: lineForOffset(text, match.index ?? 0),
    });
  }

  return links;
}

function parseMarkdownDestination(rawValue) {
  const raw = rawValue.trim();
  if (!raw || raw.startsWith("#")) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return null;
  }

  let destination = raw;
  if (destination.startsWith("<")) {
    const endIndex = destination.indexOf(">");
    destination =
      endIndex === -1 ? destination.slice(1) : destination.slice(1, endIndex);
  } else {
    destination = destination.split(/\s+/)[0];
  }

  destination = destination.replace(/^['"]|['"]$/g, "");
  if (!destination || destination.includes("{{")) {
    return null;
  }

  return destination;
}

function stripFragmentAndQuery(destination) {
  const hashIndex = destination.indexOf("#");
  const queryIndex = destination.indexOf("?");
  const cutoffIndexes = [hashIndex, queryIndex].filter((index) => index !== -1);
  if (cutoffIndexes.length === 0) {
    return destination;
  }
  return destination.slice(0, Math.min(...cutoffIndexes));
}

function normalizeCatalogValue(value) {
  return value.trim().replace(/^`([^`]+)`$/, "$1");
}

function parseCatalogRecords(path) {
  const records = new Map();
  const lines = read(path).split(/\r?\n/);
  let current = null;
  let currentField = null;

  for (const line of lines) {
    const header = line.match(/^### `([^`]+)`/);
    if (header) {
      current = { id: header[1], fields: {} };
      records.set(current.id, current.fields);
      currentField = null;
      continue;
    }

    const field = line.match(/^- ([a-z_]+):\s*(.*)$/);
    if (current && field) {
      currentField = field[1];
      current.fields[currentField] = field[2];
      continue;
    }

    if (current && currentField && /^  /.test(line) && line.trim()) {
      current.fields[currentField] += `\n${line.trim()}`;
      continue;
    }

    if (line.trim()) {
      currentField = null;
    }
  }

  return records;
}

function parseInlineList(value) {
  const normalized = (value ?? "").replaceAll("\n", " ").trim();
  if (!normalized || normalized === "[]") {
    return [];
  }

  return normalized
    .split(",")
    .map((item) => normalizeCatalogValue(item.trim()))
    .filter(Boolean);
}

function parseAlternativeRoles(value) {
  const normalized = (value ?? "").trim();
  if (!normalized || normalized === "[]") {
    return [];
  }

  const groups = [];
  let current = null;
  for (const line of normalized.split(/\r?\n/).map((entry) => entry.trim())) {
    const group = line.match(/^- group_id:\s*(.+)$/);
    if (group) {
      current = { group_id: group[1], roles: [], resolution: "" };
      groups.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    const roles = line.match(/^roles:\s*(.+)$/);
    if (roles) {
      current.roles = parseInlineList(roles[1]);
      continue;
    }

    const resolution = line.match(/^resolution:\s*(.+)$/);
    if (resolution) {
      current.resolution = resolution[1].trim();
    }
  }

  return groups;
}

function trimSentence(value) {
  return value.trim().replace(/\.$/, "");
}

function knownRoleIds() {
  return new Set(parseCatalogRecords(join(root, "roles/INDEX.md")).keys());
}

function markdownBullets(text) {
  const bullets = [];
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const bullet = line.match(/^- (.*)$/);
    if (bullet) {
      current = bullet[1];
      bullets.push(current);
      continue;
    }

    if (current !== null && /^  /.test(line) && line.trim()) {
      current += ` ${line.trim()}`;
      bullets[bullets.length - 1] = current;
    }
  }

  return bullets;
}

function stripYamlComment(line) {
  let quote = null;

  function isEscaped(index) {
    let backslashes = 0;
    for (
      let cursor = index - 1;
      cursor >= 0 && line[cursor] === "\\";
      cursor -= 1
    ) {
      backslashes += 1;
    }
    return backslashes % 2 === 1;
  }

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (quote === "'") {
      if (char === "'" && line[index + 1] === "'") {
        index += 1;
      } else if (char === "'") {
        quote = null;
      }
      continue;
    }

    if (quote === '"') {
      if (char === '"' && !isEscaped(index)) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === "#" && (index === 0 || /\s/.test(line[index - 1]))) {
      return line.slice(0, index);
    }
  }

  return line;
}

function parseYamlScalar(value) {
  const trimmed = stripYamlComment(value).trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

function normalizeYamlBlock(block) {
  return block
    .split(/\r?\n/)
    .map((line) => stripYamlComment(line).trimEnd())
    .filter((line) => line.trim())
    .join("\n");
}

function extractExecutionPolicy(path) {
  const block = extractYamlBlockAfterHeading(path, "## Execution Policy");
  const bullets = markdownBullets(sectionText(path, "Execution Policy"));

  const policy = {
    recommended_model_levels: {},
    model_level_rules: [],
    consensus_defaults: [],
    consensus_escalations: [],
    iteration_cap: "",
    raw: bullets,
  };

  if (block === null) {
    return policy;
  }

  const lines = block.split(/\r?\n/);
  if (lines[0] !== "execution_policy:") {
    fail(path, "Execution Policy YAML block must start with `execution_policy:`");
    return policy;
  }

  const knownRoles = knownRoleIds();
  let section = null;
  let currentListItem = null;

  function pushListItem() {
    if (!currentListItem) {
      return;
    }
    if (section === "model_level_rules") {
      for (const key of ["role", "level", "when"]) {
        if (!currentListItem[key]) {
          fail(path, `model_level_rules item missing \`${key}\``);
        }
      }
      if (currentListItem.role && !knownRoles.has(currentListItem.role)) {
        fail(path, `model_level_rules references unknown role \`${currentListItem.role}\``);
      }
      if (currentListItem.level && !allowedModelLevels.has(currentListItem.level)) {
        fail(path, `model_level_rules level has invalid value \`${currentListItem.level}\``);
      }
      policy.model_level_rules.push(currentListItem);
    } else if (section === "consensus_defaults") {
      for (const key of ["scope", "value"]) {
        if (!currentListItem[key]) {
          fail(path, `consensus_defaults item missing \`${key}\``);
        }
      }
      if (
        currentListItem.value &&
        !allowedConsensusModes.has(currentListItem.value)
      ) {
        fail(path, `consensus_defaults value has invalid value \`${currentListItem.value}\``);
      }
      policy.consensus_defaults.push(currentListItem);
    } else if (section === "consensus_escalations") {
      for (const key of ["value", "when"]) {
        if (!currentListItem[key]) {
          fail(path, `consensus_escalations item missing \`${key}\``);
        }
      }
      if (
        currentListItem.value &&
        !allowedConsensusModes.has(currentListItem.value)
      ) {
        fail(path, `consensus_escalations value has invalid value \`${currentListItem.value}\``);
      }
      if (currentListItem.when) {
        currentListItem.when = trimSentence(currentListItem.when);
      }
      policy.consensus_escalations.push(currentListItem);
    }
    currentListItem = null;
  }

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const topLevel = line.match(/^  ([a-z_]+):(?:\s*(.*))?$/);
    if (topLevel) {
      pushListItem();
      section = topLevel[1];
      const value = parseYamlScalar(topLevel[2] ?? "");
      if (section === "iteration_cap") {
        policy.iteration_cap = value;
        section = null;
      } else if (
        ![
          "recommended_model_levels",
          "model_level_rules",
          "consensus_defaults",
          "consensus_escalations",
        ].includes(section)
      ) {
        fail(path, `Execution Policy has unknown key \`${section}\``, index + 1);
      } else if (value) {
        fail(path, `Execution Policy key \`${section}\` must use nested values`, index + 1);
      }
      continue;
    }

    if (section === "recommended_model_levels") {
      const entry = line.match(/^    ([a-z][a-z-]*):\s*(cheap|standard|deep)\s*$/);
      if (!entry) {
        fail(path, "recommended_model_levels entries must be `role: level`", index + 1);
        continue;
      }
      if (!knownRoles.has(entry[1])) {
        fail(path, `recommended_model_levels references unknown role \`${entry[1]}\``, index + 1);
        continue;
      }
      policy.recommended_model_levels[entry[1]] = entry[2];
      continue;
    }

    if (
      ["model_level_rules", "consensus_defaults", "consensus_escalations"].includes(
        section ?? "",
      )
    ) {
      const itemStart = line.match(/^    - ([a-z_]+):\s*(.*)$/);
      if (itemStart) {
        pushListItem();
        currentListItem = {
          [itemStart[1]]: parseYamlScalar(itemStart[2]),
        };
        continue;
      }

      const itemField = line.match(/^      ([a-z_]+):\s*(.*)$/);
      if (itemField && currentListItem) {
        currentListItem[itemField[1]] = parseYamlScalar(itemField[2]);
        continue;
      }
    }

    fail(path, "unrecognized Execution Policy YAML line", index + 1);
  }

  pushListItem();

  if (Object.keys(policy.recommended_model_levels).length === 0) {
    fail(path, "Execution Policy must define recommended_model_levels");
  }
  if (!policy.iteration_cap) {
    fail(path, "Execution Policy must define iteration_cap");
  }

  return policy;
}

function buildRoleCatalog() {
  const catalog = parseCatalogRecords(join(root, "roles/INDEX.md"));
  return [...catalog]
    .map(([roleId, fields]) => {
      const rolePath = join(root, normalizeCatalogValue(fields.path ?? ""));
      const frontmatter = exists(rolePath)
        ? parseFrontmatter(rolePath, [
            "id",
            "surface",
            "rights",
            "default_model_level",
            "runner_id",
          ])
        : {};
      return {
        id: roleId,
        path: normalizeCatalogValue(fields.path ?? ""),
        surface: frontmatter?.surface ?? "",
        rights: frontmatter?.rights ?? "",
        default_model_level: frontmatter?.default_model_level ?? "",
        runner_id: frontmatter?.runner_id ?? "",
        wrappers: {
          codex: `adapters/codex/materialized/agents/${roleId}.toml`,
          claude_code: `adapters/claude-code/materialized/agents/${roleId}.md`,
        },
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function buildPipelineCatalog() {
  const catalog = parseCatalogRecords(join(root, "pipelines/INDEX.md"));
  return [...catalog]
    .map(([pipelineId, fields]) => {
      const pipelinePath = normalizeCatalogValue(fields.path ?? "");
      return {
        id: pipelineId,
        path: pipelinePath,
        triggers: parseInlineList(fields.triggers),
        required_roles: parseInlineList(fields.required_roles),
        alternative_roles: parseAlternativeRoles(fields.alternative_roles),
        optional_roles: parseInlineList(fields.optional_roles),
        route_gates: parseInlineList(fields.route_gates),
        platform_invocation: normalizeCatalogValue(
          fields.platform_invocation ?? "",
        ),
        execution_policy: extractExecutionPolicy(join(root, pipelinePath)),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function expectedPlaybookManifest() {
  return {
    id: "revisium-agent-playbook",
    name: "Revisium Agent Playbook",
    schema_version: 2,
    package: "@revisium/agent-playbook",
    catalogs: {
      roles: "catalog/roles.json",
      pipelines: "catalog/pipelines.json",
    },
    supported_runtimes: ["codex", "claude-code", "revo"],
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeCatalogFiles() {
  mkdirSync(join(root, "catalog"), { recursive: true });
  writeFileSync(
    join(root, "catalog/roles.json"),
    stableJson(buildRoleCatalog()),
  );
  writeFileSync(
    join(root, "catalog/pipelines.json"),
    stableJson(buildPipelineCatalog()),
  );
  writeFileSync(
    join(root, "playbook.json"),
    stableJson(expectedPlaybookManifest()),
  );
}

function validateJsonFile(path, expectedValue) {
  if (!exists(path)) {
    fail(path, "missing generated JSON file");
    return;
  }

  const expected = stableJson(expectedValue);
  const actual = read(path);
  if (actual !== expected) {
    fail(
      path,
      "generated JSON is stale; run `node tools/validate.mjs --build-catalogs`",
    );
  }
}

function validateGeneratedCatalogs() {
  validateJsonFile(join(root, "catalog/roles.json"), buildRoleCatalog());
  validateJsonFile(join(root, "catalog/pipelines.json"), buildPipelineCatalog());
  validateJsonFile(join(root, "playbook.json"), expectedPlaybookManifest());
}

function validateMarkdownAdapters() {
  const adapterDirs = [
    join(root, "adapters/claude-code/materialized/agents"),
    join(root, "adapters/claude-code/materialized/skills"),
    join(root, "adapters/codex/materialized/skills"),
  ];

  for (const dir of adapterDirs) {
    for (const path of walk(dir, (entry) => extname(entry) === ".md")) {
      const frontmatter = parseFrontmatter(path);
      if (!frontmatter) {
        continue;
      }

      const roleWrapper = rel(path).startsWith(
        "adapters/claude-code/materialized/agents/",
      );
      if (roleWrapper && basename(path, ".md") !== frontmatter.name) {
        fail(
          path,
          `frontmatter name must match filename \`${basename(path, ".md")}\``,
        );
      }

      const skillWrapper = rel(path).includes("/materialized/skills/");
      if (skillWrapper && basename(dirname(path)) !== frontmatter.name) {
        fail(
          path,
          `frontmatter name must match skill directory \`${basename(dirname(path))}\``,
        );
      }
    }
  }
}

function validateCodexAgentToml() {
  const dir = join(root, "adapters/codex/materialized/agents");
  for (const path of walk(dir, (entry) => extname(entry) === ".toml")) {
    const data = parseTomlAssignments(path);
    for (const key of ["name", "description"]) {
      if (!data[key]) {
        fail(path, `TOML wrapper is missing \`${key}\``);
      }
    }

    const id = basename(path, ".toml");
    if (data.name && data.name !== id) {
      fail(path, `TOML name must match filename \`${id}\``);
    }
  }
}

function validateRoleCatalog() {
  const catalogPath = join(root, "roles/INDEX.md");
  const catalog = parseCatalog(catalogPath);
  const roleIds = walk(
    join(root, "roles"),
    (entry) => basename(entry) === "ROLE.md",
  )
    .map((path) => rel(dirname(path)).replace(/^roles\//, ""))
    .sort();

  for (const roleId of roleIds) {
    if (!catalog.has(roleId)) {
      fail(catalogPath, `missing catalog record for role \`${roleId}\``);
    }
  }

  for (const [roleId, fields] of catalog) {
    const rolePath = join(root, fields.path ?? "");
    if (!fields.path || !exists(rolePath)) {
      fail(
        catalogPath,
        `role \`${roleId}\` points to missing path \`${fields.path ?? ""}\``,
      );
    }

    const codexPath = join(
      root,
      `adapters/codex/materialized/agents/${roleId}.toml`,
    );
    const claudePath = join(
      root,
      `adapters/claude-code/materialized/agents/${roleId}.md`,
    );
    if (!exists(codexPath)) {
      fail(catalogPath, `role \`${roleId}\` is missing Codex wrapper`);
    }
    if (!exists(claudePath)) {
      fail(catalogPath, `role \`${roleId}\` is missing Claude Code wrapper`);
    }
  }

  const catalogRoleIds = new Set(catalog.keys());
  const wrapperSets = [
    {
      dir: join(root, "adapters/codex/materialized/agents"),
      extension: ".toml",
      label: "Codex",
    },
    {
      dir: join(root, "adapters/claude-code/materialized/agents"),
      extension: ".md",
      label: "Claude Code",
    },
  ];

  for (const { dir, extension, label } of wrapperSets) {
    for (const path of walk(dir, (entry) => extname(entry) === extension)) {
      const roleId = basename(path, extension);
      if (!catalogRoleIds.has(roleId)) {
        fail(path, `${label} wrapper has no role catalog record \`${roleId}\``);
      }
    }
  }
}

function validateRoleFrontmatter() {
  const catalogPath = join(root, "roles/INDEX.md");
  const catalog = parseCatalog(catalogPath);

  for (const path of walk(
    join(root, "roles"),
    (entry) => basename(entry) === "ROLE.md",
  )) {
    const roleId = rel(dirname(path)).replace(/^roles\//, "");
    const frontmatter = parseFrontmatter(path, [
      "id",
      "surface",
      "rights",
      "default_model_level",
      "runner_id",
    ]);
    if (!frontmatter) {
      continue;
    }

    if (frontmatter.id !== roleId) {
      fail(path, `frontmatter id must match role directory \`${roleId}\``);
    }
    if (!allowedRoleSurfaces.has(frontmatter.surface)) {
      fail(
        path,
        `frontmatter surface has invalid enum value \`${frontmatter.surface}\``,
      );
    }
    if (!allowedRoleRights.has(frontmatter.rights)) {
      fail(
        path,
        `frontmatter rights has invalid enum value \`${frontmatter.rights}\``,
      );
    }
    if (!allowedModelLevels.has(frontmatter.default_model_level)) {
      fail(
        path,
        `frontmatter default_model_level has invalid enum value \`${frontmatter.default_model_level}\``,
      );
    }
    if (!allowedRunnerIds.has(frontmatter.runner_id)) {
      fail(
        path,
        `frontmatter runner_id has invalid enum value \`${frontmatter.runner_id}\``,
      );
    }

    const catalogFields = catalog.get(roleId);
    if (catalogFields && catalogFields.surface !== frontmatter.surface) {
      fail(
        path,
        `frontmatter surface \`${frontmatter.surface}\` must match roles/INDEX.md \`${catalogFields.surface}\``,
      );
    }

    const modelSection = sectionText(path, "Default Model Level").toLowerCase();
    if (
      frontmatter.default_model_level &&
      !new RegExp(`\\b${frontmatter.default_model_level}\\b`).test(modelSection)
    ) {
      fail(
        path,
        `Default Model Level section must include frontmatter value \`${frontmatter.default_model_level}\``,
      );
    }
  }
}

function validatePipelineCatalog() {
  const catalogPath = join(root, "pipelines/INDEX.md");
  const catalog = parseCatalog(catalogPath);
  const pipelineIds = walk(
    join(root, "pipelines"),
    (entry) => basename(entry) === "PIPELINE.md",
  )
    .map((path) => rel(dirname(path)).replace(/^pipelines\//, ""))
    .sort();

  for (const pipelineId of pipelineIds) {
    if (!catalog.has(pipelineId)) {
      fail(
        catalogPath,
        `missing catalog record for pipeline \`${pipelineId}\``,
      );
    }
  }

  for (const [pipelineId, fields] of catalog) {
    const pipelinePath = join(root, fields.path ?? "");
    if (!fields.path || !exists(pipelinePath)) {
      fail(
        catalogPath,
        `pipeline \`${pipelineId}\` points to missing path \`${fields.path ?? ""}\``,
      );
    }

    if (fields.platform_invocation === "skill-wrapper") {
      const codexPath = join(
        root,
        `adapters/codex/materialized/skills/${pipelineId}/SKILL.md`,
      );
      const claudePath = join(
        root,
        `adapters/claude-code/materialized/skills/${pipelineId}/SKILL.md`,
      );
      if (!exists(codexPath)) {
        fail(
          catalogPath,
          `skill-wrapper pipeline \`${pipelineId}\` is missing Codex skill`,
        );
      }
      if (!exists(claudePath)) {
        fail(
          catalogPath,
          `skill-wrapper pipeline \`${pipelineId}\` is missing Claude Code skill`,
        );
      }
    }
  }

  const skillWrapperPipelineIds = new Set(
    [...catalog]
      .filter(([, fields]) => fields.platform_invocation === "skill-wrapper")
      .map(([pipelineId]) => pipelineId),
  );
  const skillWrapperDirs = [
    {
      dir: join(root, "adapters/codex/materialized/skills"),
      label: "Codex",
    },
    {
      dir: join(root, "adapters/claude-code/materialized/skills"),
      label: "Claude Code",
    },
  ];

  for (const { dir, label } of skillWrapperDirs) {
    for (const path of walk(dir, (entry) => basename(entry) === "SKILL.md")) {
      const skillId = basename(dirname(path));
      if (
        !skillWrapperPipelineIds.has(skillId) &&
        !allowedNonPipelineSkillWrappers.has(skillId)
      ) {
        fail(
          path,
          `${label} skill wrapper has no pipeline catalog record \`${skillId}\``,
        );
      }
    }
  }
}

function validatePipelineFrontmatter() {
  const catalogPath = join(root, "pipelines/INDEX.md");
  const catalog = parseCatalog(catalogPath);

  for (const path of walk(
    join(root, "pipelines"),
    (entry) => basename(entry) === "PIPELINE.md",
  )) {
    const pipelineId = rel(dirname(path)).replace(/^pipelines\//, "");
    const frontmatter = parseFrontmatter(path, ["id"]);
    if (!frontmatter) {
      continue;
    }

    if (frontmatter.id !== pipelineId) {
      fail(
        path,
        `frontmatter id must match pipeline directory \`${pipelineId}\``,
      );
    }
    if (!catalog.has(pipelineId)) {
      fail(
        path,
        `frontmatter id \`${pipelineId}\` is missing from pipelines/INDEX.md`,
      );
    }
  }
}

function validateModelLevels() {
  for (const path of walk(
    join(root, "roles"),
    (entry) => basename(entry) === "ROLE.md",
  )) {
    const lines = read(path).split(/\r?\n/);
    const headingIndex = lines.findIndex(
      (line) => line === "## Default Model Level",
    );
    if (headingIndex === -1) {
      fail(path, "missing `## Default Model Level` section");
      continue;
    }

    const sectionLines = [];
    for (let index = headingIndex + 1; index < lines.length; index += 1) {
      if (lines[index].startsWith("## ")) {
        break;
      }
      if (lines[index].trim()) {
        sectionLines.push(lines[index].trim());
      }
    }

    const section = sectionLines.join(" ").toLowerCase();
    const words = [...section.matchAll(/\b[a-z][a-z-]*\b/g)].map(
      (match) => match[0],
    );
    if (!words.some((word) => allowedModelLevels.has(word))) {
      fail(path, "`Default Model Level` must include cheap, standard, or deep");
    }
    if (section.includes("deterministic script")) {
      fail(path, "`deterministic script` is a runner type, not a model level");
    }
  }
}

function validateRoleSections() {
  const required = [
    "Purpose",
    "When To Use",
    "Rights",
    "Default Model Level",
    "Inputs",
    "Outputs",
    "Hard Rules",
    "References",
  ];

  for (const path of walk(
    join(root, "roles"),
    (entry) => basename(entry) === "ROLE.md",
  )) {
    const body = markdownBody(path);
    const roleId = rel(dirname(path)).replace(/^roles\//, "");
    if (!body.startsWith(`# Role: ${roleId}\n`)) {
      fail(path, `heading must be \`# Role: ${roleId}\``);
    }
    validateHeadings(path, required);
  }
}

function validatePipelineSections() {
  const required = [
    "Purpose",
    "Triggers",
    "Roles",
    "Steps",
    "Execution Policy",
    "Human Gates",
    "Adapter Notes",
  ];

  for (const path of walk(
    join(root, "pipelines"),
    (entry) => basename(entry) === "PIPELINE.md",
  )) {
    const body = markdownBody(path);
    const pipelineId = rel(dirname(path)).replace(/^pipelines\//, "");
    if (!body.startsWith(`# Pipeline: ${pipelineId}\n`)) {
      fail(path, `heading must be \`# Pipeline: ${pipelineId}\``);
    }
    validateHeadings(path, required);
  }
}

function validateRoleDefinitionOutputContract() {
  const path = join(root, "method/role-definition.md");
  const section = sectionText(path, "Output Contract");
  if (!section.includes("typed-contracts.md")) {
    fail(path, "`Output Contract` must delegate role_result schema to `typed-contracts.md`");
  }
  if (
    section.includes("```json") ||
    section.includes('"artifacts": {}') ||
    section.includes('"needsHuman": false')
  ) {
    fail(path, "`Output Contract` must not duplicate the portable role_result schema");
  }
}

function validateCommonGitignoreCoversLocalOverlays() {
  const path = join(root, "templates/common/gitignore");
  const entries = new Set(read(path).split(/\r?\n/).filter(Boolean));
  for (const entry of [
    ".agents/local.*",
    ".agents/runs/",
    ".claude/settings.local.json",
    "CLAUDE.local.md",
  ]) {
    if (!entries.has(entry)) {
      fail(path, `missing ignored local overlay pattern \`${entry}\``);
    }
  }
}

function validateReadmeCatalogCoverage() {
  const roleIds = [...parseCatalogRecords(join(root, "roles/INDEX.md")).keys()];
  const roleReadme = read(join(root, "roles/README.md"));
  for (const roleId of roleIds) {
    if (!roleReadme.includes(`\`${roleId}\``)) {
      fail(join(root, "roles/README.md"), `missing role \`${roleId}\` from README overview`);
    }
  }

  const pipelineIds = [
    ...parseCatalogRecords(join(root, "pipelines/INDEX.md")).keys(),
  ];
  const pipelineReadme = read(join(root, "pipelines/README.md"));
  for (const pipelineId of pipelineIds) {
    if (!pipelineReadme.includes(`\`${pipelineId}\``)) {
      fail(
        join(root, "pipelines/README.md"),
        `missing pipeline \`${pipelineId}\` from README overview`,
      );
    }
  }
}

function validateIntakeWorkTypesCoverPipelines() {
  const path = join(root, "method/intake.md");
  const workTypes = new Set(
    [...sectionText(path, "Work Types").matchAll(/^- `([^`]+)`/gm)].map(
      (match) => match[1],
    ),
  );
  for (const pipelineId of parseCatalogRecords(join(root, "pipelines/INDEX.md")).keys()) {
    if (!workTypes.has(pipelineId)) {
      fail(path, `Work Types is missing pipeline \`${pipelineId}\``);
    }
  }
}

function validateOrchestratorTieBreakersCoverPipelines() {
  const path = join(root, "roles/orchestrator/references/core.md");
  const section = sectionText(path, "Route Selection Tie-Breakers");
  for (const pipelineId of parseCatalogRecords(join(root, "pipelines/INDEX.md")).keys()) {
    if (!section.includes(`\`${pipelineId}\``)) {
      fail(path, `Route Selection Tie-Breakers is missing pipeline \`${pipelineId}\``);
    }
  }
}

function extractRoleIdsFromPipelineRolesSection(path) {
  const knownRoles = knownRoleIds();
  return new Set(
    [...sectionText(path, "Roles").matchAll(/`([^`]+)`/g)]
      .map((match) => match[1])
      .filter((roleId) => knownRoles.has(roleId)),
  );
}

function validatePipelineIndexRoleCoverage() {
  const catalogPath = join(root, "pipelines/INDEX.md");
  for (const [pipelineId, fields] of parseCatalogRecords(catalogPath)) {
    const pipelinePath = join(root, normalizeCatalogValue(fields.path ?? ""));
    if (!exists(pipelinePath)) {
      continue;
    }

    const indexedRoles = new Set([
      ...parseInlineList(fields.required_roles),
      ...parseInlineList(fields.optional_roles),
      ...parseAlternativeRoles(fields.alternative_roles).flatMap(
        (group) => group.roles,
      ),
    ]);
    const proseRoles = extractRoleIdsFromPipelineRolesSection(pipelinePath);
    for (const roleId of indexedRoles) {
      if (!proseRoles.has(roleId)) {
        fail(pipelinePath, `Roles section is missing catalog role \`${roleId}\``);
      }
    }
    for (const roleId of proseRoles) {
      if (!indexedRoles.has(roleId)) {
        fail(
          catalogPath,
          `pipeline \`${pipelineId}\` catalog omits role \`${roleId}\` from Roles section`,
        );
      }
    }
  }
}

function validateHeadings(path, required) {
  const headings = new Set(
    read(path)
      .split(/\r?\n/)
      .map((line) => line.match(/^## (.+)$/)?.[1])
      .filter(Boolean),
  );

  for (const heading of required) {
    if (!headings.has(heading)) {
      fail(path, `missing \`## ${heading}\` section`);
    }
  }
}

function sectionText(path, heading) {
  const lines = markdownBody(path).split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line === `## ${heading}`);
  if (headingIndex === -1) {
    return "";
  }

  const sectionLines = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("## ")) {
      break;
    }
    sectionLines.push(lines[index]);
  }

  return sectionLines.join("\n");
}

function extractYamlBlockAfterHeading(path, heading) {
  const lines = read(path).split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line === heading);
  if (headingIndex === -1) {
    fail(path, `missing \`${heading}\` section`);
    return null;
  }

  const openIndex = lines.findIndex(
    (line, index) => index > headingIndex && line === "```yaml",
  );
  if (openIndex === -1) {
    fail(path, `missing YAML block after \`${heading}\``);
    return null;
  }

  const closeIndex = lines.findIndex(
    (line, index) => index > openIndex && line === "```",
  );
  if (closeIndex === -1) {
    fail(path, `missing YAML block closing marker after \`${heading}\``);
    return null;
  }

  return lines.slice(openIndex + 1, closeIndex).join("\n");
}

function extractFirstYamlBlock(path) {
  const lines = read(path).split(/\r?\n/);
  const openIndex = lines.findIndex((line) => line === "```yaml");
  if (openIndex === -1) {
    fail(path, "missing YAML block");
    return null;
  }

  const closeIndex = lines.findIndex(
    (line, index) => index > openIndex && line === "```",
  );
  if (closeIndex === -1) {
    fail(path, "missing YAML block closing marker");
    return null;
  }

  return lines.slice(openIndex + 1, closeIndex).join("\n");
}

function validateBacktickPathReferences() {
  const roots = [
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    "method",
    "roles",
    "pipelines",
    "references",
    "stacks",
    "adapters",
    "templates",
    "checklists",
  ];
  const files = filesUnder(roots, (entry) => extname(entry) === ".md");
  const pathLike = /`([^`\n]+\.md(?:#[^`\s]+)?)`/g;
  const repoLocalOverlayDocs = new Set([
    "AGENTS.md",
    "CLAUDE.md",
    "REPOSITORY.md",
    "REVIEW.md",
    "VERIFICATION.md",
  ]);
  const consumerRepoExampleDocs = new Set(["docs/quality-gates.md"]);
  const runtimeDiscoveryPrefixes = [".agents/", ".codex/", ".claude/"];
  const bareTemplateDocs = new Set([
    "ROLE.md",
    "PIPELINE.md",
    "STACK.md",
    "SKILL.md",
    "RUN.md",
    "STATUS.md",
  ]);
  const genericReferenceExampleOwners = new Set([
    "method/role-definition.md",
    "references/quality/debt-taxonomy.md",
    "checklists/role-development.md",
  ]);
  const genericReferenceExampleDocs = new Set([
    "references/core.md",
    "references/review-checklist.md",
  ]);

  for (const path of files) {
    const text = read(path);
    for (const match of text.matchAll(pathLike)) {
      const destination = parseMarkdownDestination(match[1]);
      const sourcePath = rel(path);
      if (
        !destination ||
        destination.startsWith("@") ||
        destination.includes("*") ||
        destination.includes("{{") ||
        destination.includes("<") ||
        destination.startsWith(".agents/local.") ||
        runtimeDiscoveryPrefixes.some((prefix) => destination.startsWith(prefix)) ||
        repoLocalOverlayDocs.has(destination) ||
        consumerRepoExampleDocs.has(destination) ||
        (
          genericReferenceExampleOwners.has(sourcePath) &&
          genericReferenceExampleDocs.has(destination)
        ) ||
        bareTemplateDocs.has(destination)
      ) {
        continue;
      }
      if (destination.startsWith("/")) {
        fail(path, `backtick path must be relative: \`${destination}\``);
        continue;
      }
      const localDestination = stripFragmentAndQuery(destination);
      if (!localDestination) {
        continue;
      }
      const relativeTargetPath = join(dirname(path), localDestination);
      const rootTargetPath = join(root, localDestination);
      if (!exists(relativeTargetPath) && !exists(rootTargetPath)) {
        fail(
          path,
          `backtick path target does not exist: \`${destination}\``,
          lineForOffset(text, match.index ?? 0),
        );
      }
    }
  }
}

function validateArtifactTemplateOwnerLinks() {
  const dir = join(root, "templates/artifacts");
  const ownerLabels = [
    "Canonical schema owner",
    "Canonical policy owner",
    "Escalation vocabulary owner",
    "Related lifecycle contract",
  ];
  const ownerPatterns = [
    new RegExp(`(?:${ownerLabels.join("|")}): \`([^\`]+)\``, "g"),
    /Fillable copy of the schema owned by `([^`]+)`/g,
  ];

  for (const path of walk(dir, (entry) => extname(entry) === ".md")) {
    if (basename(path) === "README.md") {
      continue;
    }

    const text = read(path);
    const ownerRefs = [];
    for (const pattern of ownerPatterns) {
      for (const match of text.matchAll(pattern)) {
        ownerRefs.push(match[1]);
      }
    }

    if (ownerRefs.length === 0) {
      fail(path, "artifact template must declare a canonical owner");
      continue;
    }

    for (const ownerRef of ownerRefs) {
      if (ownerRef.startsWith("/") || /^[a-z]+:\/\//i.test(ownerRef)) {
        fail(path, `canonical owner must be a relative path: \`${ownerRef}\``);
        continue;
      }

      const ownerPath = join(dirname(path), ownerRef);
      if (!exists(ownerPath)) {
        fail(path, `canonical owner path does not exist: \`${ownerRef}\``);
      }
    }
  }
}

function validateArtifactSchemaSync() {
  const artifacts = [
    {
      canonicalPath: join(root, "roles/analyst/references/core.md"),
      templatePath: join(root, "templates/artifacts/task-spec.md"),
      heading: "## `task_spec`",
    },
    {
      canonicalPath: join(root, "roles/architect/references/core.md"),
      templatePath: join(root, "templates/artifacts/architecture-plan.md"),
      heading: "## `architecture_plan`",
    },
    {
      canonicalPath: join(root, "roles/developer/references/core.md"),
      templatePath: join(root, "templates/artifacts/implementation-brief.md"),
      heading: "## `implementation_brief`",
    },
    {
      canonicalPath: join(root, "checklists/requirements.md"),
      templatePath: join(root, "templates/artifacts/requirements-check.md"),
      heading: "## Output",
    },
    {
      canonicalPath: join(root, "method/route-plan.md"),
      templatePath: join(root, "templates/artifacts/route-plan.md"),
      heading: "## Route Plan Schema",
    },
    {
      canonicalPath: join(root, "method/route-plan.md"),
      templatePath: join(root, "templates/artifacts/run-state.md"),
      heading: "## Manual Run State",
    },
    {
      canonicalPath: join(root, "method/typed-contracts.md"),
      templatePath: join(root, "templates/artifacts/role-result.md"),
      heading: "## Role / Node Result",
    },
    {
      canonicalPath: join(root, "method/typed-contracts.md"),
      templatePath: join(root, "templates/artifacts/human-gate.md"),
      heading: "## Human Gate",
    },
    {
      canonicalPath: join(root, "method/typed-contracts.md"),
      templatePath: join(root, "templates/artifacts/artifact-ref.md"),
      heading: "## Artifact Ref",
    },
    {
      canonicalPath: join(root, "roles/auditor/references/core.md"),
      templatePath: join(root, "templates/artifacts/debt-ledger.md"),
      heading: "## `debt_ledger`",
    },
    {
      canonicalPath: join(root, "references/quality/verification.md"),
      templatePath: join(root, "templates/artifacts/verification-plan.md"),
      heading: "## `verification_plan`",
    },
    {
      canonicalPath: join(root, "references/quality/verification.md"),
      templatePath: join(root, "templates/artifacts/verification-result.md"),
      heading: "## `verification_result`",
    },
  ];

  for (const { canonicalPath, templatePath, heading } of artifacts) {
    const canonicalBlock = extractYamlBlockAfterHeading(canonicalPath, heading);
    const templateBlock = extractFirstYamlBlock(templatePath);
    if (
      canonicalBlock !== null &&
      templateBlock !== null &&
      normalizeYamlBlock(canonicalBlock) !== normalizeYamlBlock(templateBlock)
    ) {
      fail(
        templatePath,
        `YAML block must match ${rel(canonicalPath)} ${heading}`,
      );
    }
  }
}

function validateAdapterSkillSymmetry() {
  const codexPath = join(
    root,
    "adapters/codex/materialized/skills/agent-method/SKILL.md",
  );
  const claudePath = join(
    root,
    "adapters/claude-code/materialized/skills/agent-method/SKILL.md",
  );

  const codexExists = exists(codexPath);
  const claudeExists = exists(claudePath);
  if (!codexExists) {
    fail(codexPath, "missing Codex agent-method skill");
  }
  if (!claudeExists) {
    fail(claudePath, "missing Claude Code agent-method skill");
  }

  if (codexExists && claudeExists && read(codexPath) !== read(claudePath)) {
    fail(
      claudePath,
      `agent-method skill must match ${rel(codexPath)}`,
    );
  }
}

function validateMarkdownLinks() {
  const markdownFiles = filesUnder(
    markdownValidationRoots,
    (entry) => extname(entry) === ".md",
  );

  for (const path of markdownFiles) {
    for (const { destination, line } of extractMarkdownLinks(path)) {
      if (destination.startsWith("/")) {
        fail(path, `markdown link must be relative: \`${destination}\``, line);
        continue;
      }

      const localDestination = stripFragmentAndQuery(destination);
      if (!localDestination) {
        continue;
      }

      const targetPath = join(dirname(path), localDestination);
      if (!exists(targetPath)) {
        fail(
          path,
          `markdown link target does not exist: \`${destination}\``,
          line,
        );
      }
    }
  }
}

function validateRuntimeDoesNotLinkLegacy() {
  const runtimeFiles = filesUnder(
    markdownValidationRoots.filter((entry) => entry !== "README.md"),
    (entry) => extname(entry) === ".md",
  );

  for (const path of runtimeFiles) {
    for (const { destination, line } of extractMarkdownLinks(path)) {
      const localDestination = stripFragmentAndQuery(destination);
      const normalized = rel(join(dirname(path), localDestination));
      if (
        localDestination.startsWith("legacy/") ||
        localDestination.startsWith("../legacy/") ||
        normalized.startsWith("legacy/")
      ) {
        fail(
          path,
          `runtime markdown must not link to legacy: \`${destination}\``,
          line,
        );
      }
    }
  }
}

function validateEnvironmentBoundary() {
  const files = filesUnder(envBoundaryRoots, (entry) =>
    [".md", ".mjs", ".toml", ".yml", ".yaml"].includes(extname(entry)),
  );
  const forbiddenPatterns = [
    {
      pattern: /\/Users\//,
      message: "committed files must not contain absolute macOS home paths",
    },
    {
      pattern: /\/home\/[A-Za-z0-9._-]+\//,
      message: "committed files must not contain absolute Linux home paths",
    },
    {
      pattern: /\b[A-Za-z]:\\Users\\/,
      message: "committed files must not contain absolute Windows home paths",
    },
    {
      pattern: /(^|[\s`"'(])~\//,
      message: "committed files must not contain home-relative local paths",
    },
    {
      pattern: /anton62k\/agents/,
      message: "external repository coordinates must use revisium/agent-playbook",
    },
    {
      pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
      message: "committed files must not contain GitHub tokens",
    },
    {
      pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/,
      message: "committed files must not contain API keys",
    },
    {
      pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      message: "committed files must not contain private keys",
    },
    {
      pattern:
        /\bclaude-(?:opus|sonnet|haiku)-[A-Za-z0-9.-]+\b|\bgpt-[0-9][A-Za-z0-9.-]*\b/,
      message: "committed method must use model levels, not concrete model names",
    },
  ];

  for (const path of files) {
    const relativePath = rel(path);
    if (
      ignoredEnvBoundaryPrefixes.some((prefix) =>
        relativePath.startsWith(prefix),
      )
    ) {
      continue;
    }

    const lines = read(path).split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const { pattern, message } of forbiddenPatterns) {
        if (pattern.test(line)) {
          fail(path, message, index + 1);
        }
      }
    });
  }
}

if (shouldBuildCatalogs) {
  writeCatalogFiles();
}

validateMarkdownAdapters();
validateCodexAgentToml();
validateRoleCatalog();
validateRoleFrontmatter();
validatePipelineCatalog();
validatePipelineFrontmatter();
validateModelLevels();
validateRoleSections();
validatePipelineSections();
validateRoleDefinitionOutputContract();
validateCommonGitignoreCoversLocalOverlays();
validateReadmeCatalogCoverage();
validateIntakeWorkTypesCoverPipelines();
validateOrchestratorTieBreakersCoverPipelines();
validatePipelineIndexRoleCoverage();
validateArtifactTemplateOwnerLinks();
validateArtifactSchemaSync();
validateAdapterSkillSymmetry();
validateMarkdownLinks();
validateBacktickPathReferences();
validateRuntimeDoesNotLinkLegacy();
validateEnvironmentBoundary();
validateGeneratedCatalogs();

if (failures.length > 0) {
  console.error("Validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Validation passed.");
