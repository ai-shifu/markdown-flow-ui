import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ADVISORY,
  LEGACY_INTEGRITY,
  validateNpmReport,
  validatePnpmReport,
  validatePnpmProductionGraph,
  validateLegacySource,
  parseAuditOutput,
} from "../../scripts/audit-dependencies.mjs";

const counts = (moderate, total = true) => ({
  vulnerabilities: {
    info: 0,
    low: 0,
    moderate,
    high: 0,
    critical: 0,
    ...(total ? { total: moderate } : {}),
  },
});
const legacy = () => ({
  version: "3.1.5",
  integrity: LEGACY_INTEGRITY,
  dev: true,
});
function npmFixture() {
  const nodes = ["minimatch", "eslint", "eslint-utils"];
  const lock = {
    packages: Object.fromEntries(
      nodes.map((name) => [
        `node_modules/${name}`,
        name === "minimatch" ? legacy() : { version: "1.0.0", dev: true },
      ])
    ),
  };
  const entry = (name, via) => ({
    name,
    severity: "moderate",
    via,
    nodes: [`node_modules/${name}`],
  });
  const report = {
    auditReportVersion: 2,
    metadata: counts(3),
    vulnerabilities: {
      minimatch: entry("minimatch", [
        {
          name: "minimatch",
          dependency: "minimatch",
          url: `https://github.com/advisories/${ADVISORY}`,
          severity: "moderate",
        },
      ]),
      eslint: entry("eslint", ["eslint-utils", "minimatch"]),
      "eslint-utils": entry("eslint-utils", ["eslint"]),
    },
  };
  return { report, lock };
}
function pnpmFixture() {
  const lock = {
    importers: {
      ".": {
        dependencies: { renderer: { version: "1.0.0" } },
        devDependencies: { eslint: { version: "9.0.0" } },
      },
    },
    packages: {
      "minimatch@3.1.5": { resolution: { integrity: LEGACY_INTEGRITY } },
    },
    snapshots: {
      "renderer@1.0.0": {},
      "eslint@9.0.0": { dependencies: { minimatch: "3.1.5" } },
      "minimatch@3.1.5": {},
    },
  };
  const report = {
    actions: [],
    muted: [],
    metadata: counts(1, false),
    advisories: {
      123: {
        github_advisory_id: ADVISORY,
        module_name: "minimatch",
        severity: "moderate",
        url: `https://github.com/advisories/${ADVISORY}`,
        findings: [{ version: "3.1.5", paths: [".>eslint>minimatch"] }],
      },
    },
  };
  return { report, lock };
}

test("accepts only the proven legacy advisory and its dependency-carried cycles", () => {
  const { report, lock } = npmFixture();
  assert.deepEqual(validateNpmReport(report, lock), { findings: 3, direct: 1 });
});
test("accepts structurally valid zero-finding reports", () => {
  assert.deepEqual(
    validateNpmReport(
      { auditReportVersion: 2, metadata: counts(0), vulnerabilities: {} },
      { packages: {} }
    ),
    { findings: 0, direct: 0 }
  );
  const { lock } = pnpmFixture();
  assert.deepEqual(
    validatePnpmReport(
      { actions: [], muted: [], metadata: counts(0, false), advisories: {} },
      lock
    ),
    { findings: 0, direct: 0 }
  );
});
for (const [label, mutate] of [
  [
    "new advisory",
    ({ report }) => {
      report.vulnerabilities.minimatch.via[0].url =
        "https://github.com/advisories/GHSA-new-advisory";
    },
  ],
  [
    "new severity",
    ({ report }) => {
      report.vulnerabilities.minimatch.via[0].severity = "high";
    },
  ],
  [
    "changed carrier severity",
    ({ report }) => {
      report.vulnerabilities.eslint.severity = "high";
      report.metadata.vulnerabilities.moderate -= 1;
      report.metadata.vulnerabilities.high = 1;
    },
  ],
  [
    "different minimatch version",
    ({ lock }) => {
      lock.packages["node_modules/minimatch"].version = "10.2.6";
    },
  ],
  [
    "different package integrity",
    ({ lock }) => {
      lock.packages["node_modules/minimatch"].integrity = "sha512-unexpected";
    },
  ],
  [
    "production dependency",
    ({ lock }) => {
      lock.packages["node_modules/minimatch"].dev = false;
    },
  ],
  [
    "unknown node",
    ({ report }) => {
      report.vulnerabilities.minimatch.nodes = ["node_modules/absent"];
    },
  ],
  [
    "empty advisory references",
    ({ report }) => {
      report.vulnerabilities.minimatch.via = [];
    },
  ],
  [
    "unknown transitive cause",
    ({ report }) => {
      report.vulnerabilities.eslint.via = ["absent"];
    },
  ],
  [
    "unaccounted cycle",
    ({ report }) => {
      report.vulnerabilities.eslint.via = ["eslint-utils"];
    },
  ],
  [
    "inconsistent metadata",
    ({ report }) => {
      report.metadata.vulnerabilities.total = 0;
    },
  ],
  [
    "unknown metadata severity",
    ({ report }) => {
      report.metadata.vulnerabilities.unclassified = 1;
    },
  ],
  [
    "error report",
    ({ report }) => {
      report.error = { code: "ENETWORK" };
    },
  ],
])
  test(`npm rejects ${label}`, () => {
    const fixture = npmFixture();
    mutate(fixture);
    assert.throws(() => validateNpmReport(fixture.report, fixture.lock));
  });
test("pnpm verifies real dependency paths despite unreliable audit dev flags", () => {
  const { report, lock } = pnpmFixture();
  assert.deepEqual(validatePnpmReport(report, lock), {
    findings: 1,
    direct: 1,
  });
});
for (const [label, mutate] of [
  [
    "new advisory",
    ({ report }) => {
      report.advisories["123"].github_advisory_id = "GHSA-new-advisory";
    },
  ],
  [
    "new severity",
    ({ report }) => {
      report.advisories["123"].severity = "high";
    },
  ],
  [
    "different version",
    ({ report }) => {
      report.advisories["123"].findings[0].version = "10.2.6";
    },
  ],
  [
    "missing package integrity",
    ({ lock }) => {
      delete lock.packages["minimatch@3.1.5"];
    },
  ],
  [
    "unknown dependency path",
    ({ report }) => {
      report.advisories["123"].findings[0].paths = [
        ".>eslint>absent>minimatch",
      ];
    },
  ],
  [
    "production root",
    ({ report }) => {
      report.advisories["123"].findings[0].paths = [".>renderer>minimatch"];
    },
  ],
  [
    "transitive production reachability",
    ({ lock }) => {
      lock.snapshots["renderer@1.0.0"].dependencies = { minimatch: "3.1.5" };
    },
  ],
  [
    "unresolved production reference",
    ({ lock }) => {
      lock.snapshots["renderer@1.0.0"].dependencies = { missing: "1.0.0" };
    },
  ],
  [
    "muted advisory",
    ({ report }) => {
      report.muted = [123];
    },
  ],
  [
    "unaccounted audit action",
    ({ report }) => {
      report.actions = [
        {
          action: "review",
          module: "minimatch",
          resolves: [{ id: 999, path: ".>eslint>minimatch" }],
        },
      ];
    },
  ],
  [
    "empty findings",
    ({ report }) => {
      report.advisories["123"].findings = [];
    },
  ],
  [
    "inconsistent counts",
    ({ report }) => {
      report.metadata.vulnerabilities.moderate = 0;
    },
  ],
])
  test(`pnpm rejects ${label}`, () => {
    const fixture = pnpmFixture();
    mutate(fixture);
    assert.throws(() => validatePnpmReport(fixture.report, fixture.lock));
  });
test("production graph handles cycles without skipping reachable legacy minimatch", () => {
  const { lock } = pnpmFixture();
  lock.snapshots["renderer@1.0.0"].dependencies = {
    renderer: "1.0.0",
    minimatch: "3.1.5",
  };
  assert.throws(() => validatePnpmProductionGraph(lock), /production/);
});
test("a changed installed legacy source invalidates the disposition", () => {
  const directory = mkdtempSync(join(tmpdir(), "audit-source-"));
  try {
    const modulePath = join(directory, "node_modules/minimatch");
    mkdirSync(modulePath, { recursive: true });
    writeFileSync(
      join(modulePath, "package.json"),
      JSON.stringify({ name: "minimatch", version: "3.1.5" })
    );
    writeFileSync(join(modulePath, "minimatch.js"), "changed source");
    assert.throws(
      () =>
        validateLegacySource(
          { packages: { "node_modules/minimatch": legacy() } },
          pnpmFixture().lock,
          directory
        ),
      /source changed/
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("validates the same pinned source in pnpm's isolated dependency layout", () => {
  const directory = mkdtempSync(join(tmpdir(), "audit-pnpm-source-"));
  try {
    const modulePath = join(
      directory,
      "node_modules/.pnpm/minimatch@3.1.5/node_modules/minimatch"
    );
    const consumerModules = join(
      directory,
      "node_modules/.pnpm/eslintrc/node_modules"
    );
    const consumerPath = join(consumerModules, "@eslint/eslintrc");
    mkdirSync(modulePath, { recursive: true });
    mkdirSync(consumerPath, { recursive: true });
    mkdirSync(join(directory, "node_modules/@eslint"), { recursive: true });
    writeFileSync(
      join(modulePath, "package.json"),
      JSON.stringify({ name: "minimatch", version: "3.1.5" })
    );
    const consumerRequire = createRequire(
      createRequire(import.meta.url).resolve("@eslint/eslintrc")
    );
    writeFileSync(
      join(modulePath, "minimatch.js"),
      readFileSync(consumerRequire.resolve("minimatch"))
    );
    writeFileSync(
      join(consumerPath, "package.json"),
      JSON.stringify({ name: "@eslint/eslintrc", main: "index.cjs" })
    );
    writeFileSync(join(consumerPath, "index.cjs"), "");
    symlinkSync(
      consumerPath,
      join(directory, "node_modules/@eslint/eslintrc"),
      "junction"
    );
    symlinkSync(modulePath, join(consumerModules, "minimatch"), "junction");
    assert.doesNotThrow(() =>
      validateLegacySource(
        { packages: { "node_modules/minimatch": legacy() } },
        pnpmFixture().lock,
        directory
      )
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("audit transport and schema failures never become clean results", () => {
  for (const result of [
    { status: 2, stdout: "{}" },
    { status: 1, signal: "SIGTERM", stdout: "{}" },
    { status: 1, error: new Error("network"), stdout: "{}" },
    { status: 1, stdout: "not JSON" },
    { status: 1, stdout: '{"error":{"code":"ENETWORK"}}' },
  ])
    assert.throws(() => parseAuditOutput(result));
  assert.throws(() => validateNpmReport({}, { packages: {} }));
  assert.throws(() => validatePnpmReport({}, pnpmFixture().lock));
});
