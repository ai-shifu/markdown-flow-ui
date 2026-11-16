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
  KATEX_ADVISORY,
  KATEX_INTEGRITY,
  validateNpmProductionGraph,
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
  lock.packages[""] = {};
  lock.packages["node_modules/eslint"].dependencies = {
    minimatch: "^3.1.5",
    "eslint-utils": "^1.0.0",
  };
  lock.packages["node_modules/eslint-utils"].peerDependencies = {
    eslint: "^1.0.0",
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
test("rejects a carrier's fabricated dependency edge", () => {
  const { report, lock } = npmFixture();
  delete lock.packages["node_modules/eslint"].dependencies.minimatch;
  assert.throws(
    () => validateNpmReport(report, lock),
    /no locked dependency edge/
  );
});
test("does not substitute a hoisted legacy node for a nested patched instance", () => {
  const { report, lock } = npmFixture();
  lock.packages["node_modules/eslint/node_modules/minimatch"] = {
    version: "11.0.3",
    dev: true,
  };
  assert.throws(
    () => validateNpmReport(report, lock),
    /no locked dependency edge/
  );
});
test("every installed carrier instance must have its own verified path", () => {
  const { report, lock } = npmFixture();
  const nested = "node_modules/other/node_modules/eslint";
  lock.packages[nested] = { version: "2.0.0", dev: true };
  report.vulnerabilities.eslint.nodes.push(nested);
  assert.throws(
    () => validateNpmReport(report, lock),
    /Unaccounted npm advisory path/
  );
});
for (const shadowed of [false, true]) {
  test(`resolves scoped carriers through their nearest node_modules (shadowed: ${shadowed})`, () => {
    const { report, lock } = npmFixture();
    const node = "node_modules/host/node_modules/@scope/tool";
    lock.packages[node] = {
      version: "1.0.0",
      dev: true,
      optionalDependencies: { minimatch: "^3.1.5" },
    };
    report.vulnerabilities["@scope/tool"] = {
      name: "@scope/tool",
      severity: "moderate",
      via: ["minimatch"],
      nodes: [node],
    };
    report.metadata = counts(4);
    if (shadowed) {
      lock.packages["node_modules/host/node_modules/minimatch"] = {
        version: "11.0.3",
        dev: true,
      };
      assert.throws(
        () => validateNpmReport(report, lock),
        /no locked dependency edge/
      );
    } else {
      assert.deepEqual(validateNpmReport(report, lock), {
        findings: 4,
        direct: 1,
      });
    }
  });
}
test("accepts structurally valid zero-finding reports", () => {
  assert.deepEqual(
    validateNpmReport(
      { auditReportVersion: 2, metadata: counts(0), vulnerabilities: {} },
      { packages: { "": {} } }
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

function katexNpmFixture() {
  const nodes = {
    katex: { version: "0.16.47", integrity: KATEX_INTEGRITY, dev: true },
    "micromark-extension-math": {
      version: "3.1.0",
      dev: true,
      dependencies: { katex: "^0.16.0" },
    },
    markdownlint: {
      version: "0.42.0",
      dev: true,
      dependencies: { "micromark-extension-math": "3.1.0" },
    },
  };
  const lock = {
    packages: { "": { devDependencies: { markdownlint: "0.42.0" } } },
  };
  for (const [name, entry] of Object.entries(nodes))
    lock.packages[`node_modules/${name}`] = entry;
  const carrier = (name, via) => ({
    name,
    severity: "low",
    via,
    nodes: [`node_modules/${name}`],
  });
  const report = {
    auditReportVersion: 2,
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 3,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 3,
      },
    },
    vulnerabilities: {
      katex: carrier("katex", [
        {
          name: "katex",
          dependency: "katex",
          url: `https://github.com/advisories/${KATEX_ADVISORY}`,
          severity: "low",
        },
      ]),
      "micromark-extension-math": carrier("micromark-extension-math", [
        "katex",
      ]),
      markdownlint: carrier("markdownlint", ["micromark-extension-math"]),
    },
  };
  return { report, lock };
}
function katexPnpmFixture() {
  const lock = {
    importers: {
      ".": { devDependencies: { markdownlint: { version: "0.42.0" } } },
    },
    packages: {
      "katex@0.16.47": { resolution: { integrity: KATEX_INTEGRITY } },
    },
    snapshots: {
      "markdownlint@0.42.0": {
        dependencies: { "micromark-extension-math": "3.1.0" },
      },
      "micromark-extension-math@3.1.0": { dependencies: { katex: "0.16.47" } },
      "katex@0.16.47": {},
    },
  };
  const path = ".>markdownlint>micromark-extension-math>katex";
  const report = {
    actions: [
      { action: "review", module: "katex", resolves: [{ id: 1241206, path }] },
    ],
    muted: [],
    metadata: {
      vulnerabilities: { info: 0, low: 1, moderate: 0, high: 0, critical: 0 },
    },
    advisories: {
      1241206: {
        github_advisory_id: KATEX_ADVISORY,
        module_name: "katex",
        severity: "low",
        url: `https://github.com/advisories/${KATEX_ADVISORY}`,
        findings: [{ version: "0.16.47", paths: [path] }],
      },
    },
  };
  return { report, lock };
}
test("accepts the exact dev-only KaTeX advisory and real carrier paths", () => {
  const npm = katexNpmFixture();
  const pnpm = katexPnpmFixture();
  assert.deepEqual(validateNpmReport(npm.report, npm.lock), {
    findings: 3,
    direct: 1,
  });
  assert.deepEqual(validatePnpmReport(pnpm.report, pnpm.lock), {
    findings: 1,
    direct: 1,
  });
});
for (const [label, mutate] of [
  [
    "different advisory",
    ({ report }) => {
      report.vulnerabilities.katex.via[0].url += "-other";
    },
  ],
  [
    "different advisory severity",
    ({ report }) => {
      report.vulnerabilities.katex.via[0].severity = "moderate";
    },
  ],
  [
    "different carrier severity",
    ({ report }) => {
      report.vulnerabilities.markdownlint.severity = "moderate";
      report.metadata.vulnerabilities.low--;
      report.metadata.vulnerabilities.moderate++;
    },
  ],
  [
    "different version",
    ({ lock }) => {
      lock.packages["node_modules/katex"].version = "0.16.46";
    },
  ],
  [
    "different integrity",
    ({ lock }) => {
      lock.packages["node_modules/katex"].integrity = "other";
    },
  ],
  [
    "production flag",
    ({ lock }) => {
      lock.packages["node_modules/katex"].dev = false;
    },
  ],
  [
    "production reachability despite misleading dev flag",
    ({ lock }) => {
      lock.packages[""].dependencies = { markdownlint: "0.42.0" };
    },
  ],
  [
    "fabricated carrier edge",
    ({ lock }) => {
      delete lock.packages["node_modules/markdownlint"].dependencies;
    },
  ],
  [
    "additional advisory",
    ({ report }) => {
      report.vulnerabilities.katex.via.push({
        name: "katex",
        dependency: "katex",
        url: "https://github.com/advisories/GHSA-other",
        severity: "low",
      });
    },
  ],
])
  test(`npm rejects KaTeX ${label}`, () => {
    const x = katexNpmFixture();
    mutate(x);
    assert.throws(() => validateNpmReport(x.report, x.lock));
  });
for (const [label, mutate] of [
  [
    "different advisory",
    ({ report }) => {
      report.advisories[1241206].github_advisory_id = "GHSA-other";
    },
  ],
  [
    "different severity",
    ({ report }) => {
      report.advisories[1241206].severity = "moderate";
    },
  ],
  [
    "different version",
    ({ report }) => {
      report.advisories[1241206].findings[0].version = "0.16.46";
    },
  ],
  [
    "different integrity",
    ({ lock }) => {
      lock.packages["katex@0.16.47"].resolution.integrity = "other";
    },
  ],
  [
    "fabricated path",
    ({ report }) => {
      report.advisories[1241206].findings[0].paths = [".>markdownlint>katex"];
    },
  ],
  [
    "production root",
    ({ lock }) => {
      lock.importers["."].dependencies = {
        markdownlint: { version: "0.42.0" },
      };
    },
  ],
  [
    "transitive production reachability",
    ({ lock }) => {
      lock.importers["."].dependencies = { renderer: { version: "1.0.0" } };
      lock.snapshots["renderer@1.0.0"] = { dependencies: { katex: "0.16.47" } };
    },
  ],
  [
    "unrelated action",
    ({ report }) => {
      report.actions[0].module = "minimatch";
    },
  ],
  [
    "invalid count",
    ({ report }) => {
      report.metadata.vulnerabilities.low = 0;
    },
  ],
])
  test(`pnpm rejects KaTeX ${label}`, () => {
    const x = katexPnpmFixture();
    mutate(x);
    assert.throws(() => validatePnpmReport(x.report, x.lock));
  });
test("production graphs reject all affected KaTeX versions even without audit findings", () => {
  for (const version of ["0.11.0", "0.16.47", "0.18.1"]) {
    const npm = {
      packages: {
        "": { dependencies: { katex: version } },
        "node_modules/katex": { version, dev: true },
      },
    };
    assert.throws(() => validateNpmProductionGraph(npm), /production/);
    const pnpm = {
      importers: { ".": { dependencies: { katex: { version } } } },
      snapshots: { [`katex@${version}`]: {} },
    };
    assert.throws(() => validatePnpmProductionGraph(pnpm), /production/);
  }
  for (const version of ["0.10.9", "0.18.2", "0.19.1"]) {
    assert.doesNotThrow(() =>
      validateNpmProductionGraph({
        packages: {
          "": { dependencies: { katex: version } },
          "node_modules/katex": { version },
        },
      })
    );
    assert.doesNotThrow(() =>
      validatePnpmProductionGraph({
        importers: { ".": { dependencies: { katex: { version } } } },
        snapshots: { [`katex@${version}`]: {} },
      })
    );
  }
});

test("keeps both known dispositions strict when advisories coexist", () => {
  const legacyNpm = npmFixture();
  const katexNpm = katexNpmFixture();
  Object.assign(legacyNpm.lock.packages, katexNpm.lock.packages);
  Object.assign(
    legacyNpm.report.vulnerabilities,
    katexNpm.report.vulnerabilities
  );
  legacyNpm.report.metadata.vulnerabilities.low = 3;
  legacyNpm.report.metadata.vulnerabilities.total = 6;
  assert.deepEqual(validateNpmReport(legacyNpm.report, legacyNpm.lock), {
    findings: 6,
    direct: 2,
  });

  const legacyPnpm = pnpmFixture();
  const katexPnpm = katexPnpmFixture();
  Object.assign(
    legacyPnpm.lock.importers["."].devDependencies,
    katexPnpm.lock.importers["."].devDependencies
  );
  Object.assign(legacyPnpm.lock.packages, katexPnpm.lock.packages);
  Object.assign(legacyPnpm.lock.snapshots, katexPnpm.lock.snapshots);
  Object.assign(legacyPnpm.report.advisories, katexPnpm.report.advisories);
  legacyPnpm.report.actions.push(...katexPnpm.report.actions);
  legacyPnpm.report.metadata.vulnerabilities.low = 1;
  assert.deepEqual(validatePnpmReport(legacyPnpm.report, legacyPnpm.lock), {
    findings: 2,
    direct: 2,
  });
});
