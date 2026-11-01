import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";

export const LEGACY_VERSION = "3.1.5";
export const LEGACY_INTEGRITY =
  "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==";
export const LEGACY_SOURCE_HASH =
  "746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d";
export const ADVISORY = "GHSA-g3hv-75wg-m249";
const advisoryUrl = `https://github.com/advisories/${ADVISORY}`;
const severities = ["info", "low", "moderate", "high", "critical"];
const own = (value, key) => Object.hasOwn(value, key);
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const requireCondition = (condition, message) => {
  if (!condition) throw new Error(message);
};
const array = (value, message) => {
  requireCondition(Array.isArray(value), message);
  return value;
};

function validateCounts(metadata, findings, totalRequired) {
  const counts = metadata?.vulnerabilities;
  requireCondition(object(counts), "Missing vulnerability metadata");
  requireCondition(
    Object.keys(counts).every((key) => [...severities, "total"].includes(key)),
    "Unknown vulnerability metadata field"
  );
  for (const severity of severities) {
    requireCondition(
      Number.isInteger(counts[severity]) &&
        counts[severity] >= 0 &&
        counts[severity] ===
          findings.filter((item) => item === severity).length,
      `Inconsistent ${severity} vulnerability count`
    );
  }
  if (totalRequired || own(counts, "total")) {
    requireCondition(
      counts.total === findings.length,
      "Inconsistent total vulnerability count"
    );
  }
}

function legacyNode(lock, node) {
  requireCondition(
    typeof node === "string" &&
      node.startsWith("node_modules/") &&
      !node.split("/").includes("..") &&
      own(lock.packages, node),
    "Unknown installed dependency node"
  );
  const entry = lock.packages[node];
  requireCondition(
    entry.dev === true,
    `Audit finding reaches a production dependency: ${node}`
  );
  return entry;
}

function checkLegacyEntry(entry) {
  requireCondition(
    entry?.version === LEGACY_VERSION && entry.integrity === LEGACY_INTEGRITY,
    "Unexpected legacy minimatch version or integrity"
  );
}

export function validateNpmReport(report, lock) {
  requireCondition(
    object(report) &&
      !own(report, "error") &&
      report.auditReportVersion === 2 &&
      object(report.vulnerabilities) &&
      object(lock?.packages),
    "Invalid npm audit report"
  );
  const entries = report.vulnerabilities;
  validateCounts(
    report.metadata,
    Object.values(entries).map((item) => item.severity),
    true
  );
  let direct = 0;
  for (const [name, entry] of Object.entries(entries)) {
    requireCondition(
      entry.name === name && entry.severity === "moderate",
      "Invalid npm vulnerability entry"
    );
    const nodes = array(entry.nodes, "Missing npm dependency nodes");
    requireCondition(nodes.length > 0, "Empty npm dependency nodes");
    nodes.forEach((node) => legacyNode(lock, node));
    const via = array(entry.via, "Missing npm advisory references");
    requireCondition(via.length > 0, "Empty npm advisory references");
    for (const cause of via) {
      if (typeof cause === "string") {
        requireCondition(
          own(entries, cause),
          `Unknown transitive advisory reference: ${cause}`
        );
      } else {
        requireCondition(
          object(cause) &&
            name === "minimatch" &&
            cause.name === "minimatch" &&
            cause.dependency === "minimatch" &&
            cause.url === advisoryUrl &&
            cause.severity === "moderate" &&
            entry.severity === "moderate",
          `Untriaged npm security advisory in ${name}`
        );
        for (const node of nodes) {
          requireCondition(
            node.endsWith("/minimatch"),
            "Unexpected minimatch package location"
          );
          checkLegacyEntry(legacyNode(lock, node));
        }
        direct += 1;
      }
    }
  }
  // Dependency-carried findings can contain cycles. A cycle alone is not proof
  // that a known direct advisory accounts for the finding.
  for (const name of Object.keys(entries)) {
    const todo = [name];
    const seen = new Set();
    let reachesDirect = false;
    while (todo.length) {
      const current = todo.pop();
      if (seen.has(current)) continue;
      seen.add(current);
      for (const cause of entries[current].via) {
        if (typeof cause === "string") todo.push(cause);
        else reachesDirect = true;
      }
    }
    requireCondition(reachesDirect, `Unaccounted npm advisory cycle: ${name}`);
  }
  return { findings: Object.keys(entries).length, direct };
}

function snapshot(lock, name, version) {
  requireCondition(
    typeof version === "string",
    "Invalid pnpm dependency reference"
  );
  const key = `${name}@${version}`;
  requireCondition(own(lock.snapshots, key), `Unknown pnpm snapshot: ${key}`);
  return { key, value: lock.snapshots[key] };
}

export function validatePnpmProductionGraph(lock) {
  requireCondition(
    object(lock?.snapshots) && object(lock.importers?.["."]),
    "Invalid pnpm lockfile"
  );
  const root = lock.importers["."];
  const todo = Object.entries({
    ...root.dependencies,
    ...root.optionalDependencies,
  }).map(([name, entry]) => [name, entry.version]);
  const seen = new Set();
  while (todo.length) {
    const [name, version] = todo.pop();
    const current = snapshot(lock, name, version);
    if (seen.has(current.key)) continue;
    seen.add(current.key);
    requireCondition(
      current.key !== `minimatch@${LEGACY_VERSION}`,
      "Legacy minimatch reaches the pnpm production graph"
    );
    todo.push(
      ...Object.entries({
        ...current.value.dependencies,
        ...current.value.optionalDependencies,
      })
    );
  }
}

function validatePnpmPath(path, lock) {
  requireCondition(
    typeof path === "string" && path.startsWith(".>"),
    "Invalid pnpm finding path"
  );
  const names = path.slice(2).split(">");
  const root = lock.importers["."];
  const first = names.shift();
  requireCondition(
    own(root.devDependencies ?? {}, first) &&
      !own(root.dependencies ?? {}, first) &&
      !own(root.optionalDependencies ?? {}, first),
    "pnpm finding does not start in a development dependency"
  );
  let version = root.devDependencies[first].version;
  let current = snapshot(lock, first, version);
  let name = first;
  for (name of names) {
    const dependencies = {
      ...current.value.dependencies,
      ...current.value.optionalDependencies,
    };
    requireCondition(
      own(dependencies, name),
      "pnpm finding path does not match the lockfile"
    );
    version = dependencies[name];
    current = snapshot(lock, name, version);
  }
  requireCondition(
    name === "minimatch" && version === LEGACY_VERSION,
    "Unexpected pnpm finding version"
  );
}

export function validatePnpmReport(report, lock) {
  requireCondition(
    object(report) && !own(report, "error") && object(report.advisories),
    "Invalid pnpm audit report"
  );
  requireCondition(
    array(report.muted, "Missing pnpm muted findings").length === 0,
    "Unexpected muted pnpm advisories"
  );
  const actions = array(report.actions, "Missing pnpm audit actions");
  validatePnpmProductionGraph(lock);
  const entries = Object.values(report.advisories);
  if (entries.length) {
    requireCondition(
      lock.packages?.[`minimatch@${LEGACY_VERSION}`]?.resolution?.integrity ===
        LEGACY_INTEGRITY,
      "Unexpected pnpm minimatch integrity"
    );
  }
  const findings = [];
  for (const entry of entries) {
    requireCondition(
      entry.github_advisory_id === ADVISORY &&
        entry.module_name === "minimatch" &&
        entry.severity === "moderate" &&
        entry.url === advisoryUrl,
      "Untriaged pnpm security advisory"
    );
    const occurrences = array(entry.findings, "Missing pnpm advisory findings");
    requireCondition(occurrences.length > 0, "Empty pnpm advisory findings");
    for (const finding of occurrences) {
      requireCondition(
        finding.version === LEGACY_VERSION,
        "Unexpected pnpm minimatch version"
      );
      const paths = array(finding.paths, "Missing pnpm advisory paths");
      requireCondition(paths.length > 0, "Empty pnpm advisory paths");
      paths.forEach((path) => validatePnpmPath(path, lock));
      findings.push(entry.severity);
    }
  }
  validateCounts(report.metadata, findings, false);
  for (const action of actions) {
    requireCondition(
      action.action === "review" && action.module === "minimatch",
      "Unexpected pnpm audit action"
    );
    const resolutions = array(
      action.resolves,
      "Missing pnpm audit resolutions"
    );
    requireCondition(resolutions.length > 0, "Empty pnpm audit resolutions");
    for (const resolution of resolutions) {
      const advisory = report.advisories[String(resolution.id)];
      requireCondition(
        advisory?.findings.some((finding) =>
          finding.paths.includes(resolution.path)
        ),
        "Unaccounted pnpm audit action"
      );
    }
  }
  return { findings: findings.length, direct: entries.length };
}

export function validateLegacySource(npmLock, pnpmLock, root = process.cwd()) {
  requireCondition(
    object(npmLock?.packages) && object(pnpmLock?.packages),
    "Missing dependency lockfiles"
  );
  const entries = Object.entries(npmLock.packages).filter(
    ([node, entry]) =>
      node.endsWith("/minimatch") && entry.version === LEGACY_VERSION
  );
  for (const [node, entry] of entries) {
    legacyNode(npmLock, node);
    checkLegacyEntry(entry);
    let directory = resolve(root, node);
    if (!existsSync(resolve(directory, "package.json"))) {
      // pnpm keeps transitive dependencies beside their isolated consumers.
      const rootRequire = createRequire(resolve(root, "package.json"));
      const consumerRequire = createRequire(
        rootRequire.resolve("@eslint/eslintrc")
      );
      directory = dirname(consumerRequire.resolve("minimatch/package.json"));
    }
    const manifest = JSON.parse(
      readFileSync(resolve(directory, "package.json"), "utf8")
    );
    requireCondition(
      manifest.name === "minimatch" && manifest.version === LEGACY_VERSION,
      "Unexpected installed minimatch manifest"
    );
    const source = readFileSync(resolve(directory, "minimatch.js"));
    requireCondition(
      createHash("sha256").update(source).digest("hex") === LEGACY_SOURCE_HASH,
      "Legacy minimatch source changed; revalidate the advisory disposition"
    );
  }
  const pnpmEntry = pnpmLock.packages[`minimatch@${LEGACY_VERSION}`];
  requireCondition(
    !own(pnpmLock.snapshots, `minimatch@${LEGACY_VERSION}`) || pnpmEntry,
    "Missing pnpm minimatch package integrity"
  );
  if (pnpmEntry) {
    requireCondition(
      pnpmEntry.resolution?.integrity === LEGACY_INTEGRITY,
      "Unexpected pnpm minimatch integrity"
    );
    requireCondition(
      entries.length > 0,
      "No installed legacy minimatch source to validate"
    );
  }
  validatePnpmProductionGraph(pnpmLock);
}

export function parseAuditOutput(result) {
  requireCondition(
    !result.error && !result.signal && [0, 1].includes(result.status),
    "Audit command failed"
  );
  const report = JSON.parse(result.stdout);
  requireCondition(
    object(report) && !own(report, "error"),
    "Audit returned an error report"
  );
  return report;
}

function main() {
  const npmLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const pnpmLock = yaml.load(readFileSync("pnpm-lock.yaml", "utf8"));
  validateLegacySource(npmLock, pnpmLock);
  for (const [command, validate] of [
    ["npm", validateNpmReport],
    ["pnpm", validatePnpmReport],
  ]) {
    const result = spawnSync(
      command,
      ["audit", "--json", "--registry=https://registry.npmjs.org"],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 180_000 }
    );
    let disposition;
    try {
      disposition = validate(
        parseAuditOutput(result),
        command === "npm" ? npmLock : pnpmLock
      );
    } catch (error) {
      if (result.stdout) console.error(result.stdout.trim());
      if (result.stderr) console.error(result.stderr.trim());
      throw error;
    }
    console.log(
      `${command}: no untriaged findings; ${disposition.findings} known development-only false-positive finding(s).`
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
