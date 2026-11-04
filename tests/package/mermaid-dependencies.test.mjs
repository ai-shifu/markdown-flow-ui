import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { build } from "vite";

const packageRoot = new URL("../../", import.meta.url);
const require = createRequire(new URL("package.json", packageRoot));
const manifest = require("./package.json");
// Kanban sanitizes labels even during parsing, so use an actual DOM environment.
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = window;
globalThis.document = window.document;

const isEmbeddedYamlParser = (code) =>
  code.includes("maxTotalMergeKeys") && code.includes("tag:yaml.org,2002:omap");

const findShippedYamlParser = (format) => {
  const directory = new URL("dist/node_modules/mermaid/dist/", packageRoot);
  const matches = readdirSync(directory, { recursive: true }).filter(
    (file) =>
      file.endsWith(`.${format}`) &&
      isEmbeddedYamlParser(readFileSync(new URL(file, directory), "utf8"))
  );
  assert.equal(
    matches.length,
    1,
    `Expected one embedded Mermaid YAML parser in ${format}, found ${matches.join(", ")}`
  );
  return new URL(matches[0], directory);
};

const assertNoUnsafeYaml = (code) => {
  assert.doesNotMatch(code, /js-yaml(?:@| )4\.(?:[012]\.|3\.[01](?!\d))/);
  assert.doesNotMatch(
    code,
    /(?:from\s*|require\(|import\(\s*)["']js-yaml(?:\/[^"']*)?["']/
  );
};

const legacyDiagrams = [
  [
    "graph with Chinese labels",
    "graph TD\nA[开始] --> B{判断}\nB -->|是| C[完成]\nB -->|否| A",
  ],
  [
    "flowchart subgraph",
    "flowchart LR\nsubgraph S[Course]\nA[Learn] --> B[Practice]\nend\nB --> C[Finish]",
  ],
  [
    "flowchart styles",
    "graph TD\nA --> B\nclassDef good fill:#9f9,stroke:#333\nclass A good\nstyle B fill:#f9f",
  ],
  [
    "sequence alternatives",
    "sequenceDiagram\nparticipant A as Learner\nparticipant B as Teacher\nA->>B: Question\nalt Understood\nB-->>A: Answer\nelse Continue\nB-->>A: Explain\nend",
  ],
  [
    "classDiagram",
    "classDiagram\nAnimal <|-- Duck\nclass Animal {\n+int age\n+move()\n}",
  ],
  ["classDiagram-v2", "classDiagram-v2\nAnimal <|-- Duck"],
  [
    "stateDiagram",
    "stateDiagram\n[*] --> Idle\nIdle --> Active: start\nActive --> [*]",
  ],
  [
    "stateDiagram-v2",
    "stateDiagram-v2\n[*] --> Idle\nIdle --> Active: start\nActive --> [*]",
  ],
  ["entity relationships", "erDiagram\nCUSTOMER ||--o{ ORDER : places"],
  [
    "gantt",
    "gantt\ndateFormat YYYY-MM-DD\nsection Course\nLesson :a1, 2026-01-01, 2d",
  ],
  ["pie", 'pie title Learning\n"A" : 60\n"B" : 40'],
  ["gitGraph", "gitGraph\ncommit\nbranch dev\ncheckout dev\ncommit"],
  ["journey", "journey\ntitle Learning\nsection Start\nRead: 5: Learner"],
  ["mindmap", "mindmap\n root((Knowledge))\n  A\n  B"],
  [
    "xychart-beta",
    'xychart-beta\nx-axis [A, B]\ny-axis "Score" 0 --> 10\nbar [4, 8]',
  ],
  ["init directive", '%%{init: {"theme":"dark"}}%%\ngraph TD\nA --> B'],
  ["explicit ELK keyword", "flowchart-elk\nA --> B"],
];

test("ships Mermaid's guarded YAML parser without a runtime js-yaml dependency", () => {
  assert.equal(manifest.dependencies.mermaid, "12.3.0");
  assert.equal(manifest.dependencies["js-yaml"], undefined);
  const files = readdirSync(new URL("dist/", packageRoot), {
    recursive: true,
  }).filter((file) => /\.(?:es\.js|cjs)$/.test(file));
  for (const file of files) {
    const code = readFileSync(new URL(`dist/${file}`, packageRoot), "utf8");
    assertNoUnsafeYaml(code);
  }
  for (const format of ["es.js", "cjs"]) {
    findShippedYamlParser(format);
  }
});

for (const format of ["es.js", "cjs"]) {
  const entry = new URL(
    `dist/node_modules/mermaid/dist/mermaid.core.${format}`,
    packageRoot
  );
  test(`${format} preserves legacy diagram syntax`, async (context) => {
    const module = await import(entry.href);
    const mermaid = format === "cjs" ? module.default.default : module.default;
    for (const [name, source] of legacyDiagrams) {
      await context.test(name, async () => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
        });
        assert.ok(await mermaid.parse(source));
      });
    }
  });
  test(`${format} preserves shape metadata and adjacent edge IDs`, async () => {
    const module = await import(entry.href);
    const mermaid = format === "cjs" ? module.default.default : module.default;
    for (const spacing of ["", " "]) {
      mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
      const diagram = await mermaid.mermaidAPI.getDiagramFromText(
        `flowchart TD\nA@{shape: circle}${spacing}e1@--> B`
      );
      assert.deepEqual(
        diagram.db.getEdges().map(({ id, start, end }) => ({ id, start, end })),
        [{ id: "e1", start: "A", end: "B" }]
      );
      assert.equal(
        diagram.db.getData().nodes.find(({ id }) => id === "A")?.shape,
        "circle"
      );
    }
  });
  test(`${format} preserves Mermaid parsing and rejects excessive YAML nesting`, async () => {
    const module = await import(entry.href);
    const mermaid = format === "cjs" ? module.default.default : module.default;
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
    const controls = [
      "---\ntitle: Valid frontmatter\n---\nflowchart TD; A-->B",
      'flowchart TD\nA@{ shape: rect, label: "Valid metadata" } --> B',
      'sequenceDiagram\nparticipant A@{ "type": "boundary" }\nA->>B: Hello',
      "kanban\n  todo[Todo]\n    task[Task]@{ priority: High }",
      'agentflow-beta TB\nA["Task"]@{ shape: task, description: "Valid metadata" }',
    ];
    assert.ok(await mermaid.parse(controls[0]));
    const nested = `${"[".repeat(110)}0${"]".repeat(110)}`;
    await assert.rejects(
      mermaid.parse(`---\ntitle: ${nested}\n---\nflowchart TD; A-->B`),
      /maxDepth/
    );
    await assert.rejects(
      mermaid.parse(`flowchart TD\nA@{ label: ${nested} }`),
      /maxDepth/
    );
    await assert.rejects(
      mermaid.parse(`sequenceDiagram\nparticipant A@{ type: ${nested} }`),
      /maxDepth/
    );
    await assert.rejects(
      mermaid.parse(`kanban\n  todo[Todo]@{ priority: ${nested} }`),
      /maxDepth/
    );
    await assert.rejects(
      mermaid.parse(
        `agentflow-beta TB\nA["Task"]@{ shape: task, description: ${nested} }`
      ),
      /maxDepth/
    );
    // Agentflow retries multiline metadata after removing trailing commas.
    await assert.rejects(
      mermaid.parse(
        `agentflow-beta TB\nA["Task"]@{\nshape: task,\ndescription: ${nested},\n}`
      ),
      /maxDepth/
    );
    for (const chart of controls.slice(1)) {
      assert.ok(await mermaid.parse(chart), chart);
    }
  });

  test(`${format} embedded YAML preserves normal merges and enforces parser guards`, async () => {
    // Import the parser shipped inside Mermaid, never the audit tool's dev dependency.
    const module = await import(findShippedYamlParser(format).href);
    const yaml = format === "cjs" ? module.default : module;
    assert.equal(typeof yaml.load, "function");
    assert.deepEqual(
      yaml.load("base: &base {a: 1}\nvalue: {<<: *base, b: true}"),
      { base: { a: 1 }, value: { a: 1, b: true } }
    );
    assert.deepEqual(yaml.load("!!omap [{first: 1}, {second: 2}]"), [
      { first: 1 },
      { second: 2 },
    ]);
    assert.throws(
      () =>
        yaml.load("value: {<<: [{}, {}, {}, {}]}", { maxTotalMergeKeys: 3 }),
      /maxTotalMergeKeys/
    );
    // Keep each merge sequence at 100 sources to exercise the default total
    // budget of 10,000, rather than the independent per-sequence size limit.
    const emptySources = `sources: &sources [${Array(100).fill("{}").join(", ")}]\ntargets:\n`;
    const mergeTarget = "  - <<: *sources\n";
    assert.equal(
      yaml.load(emptySources + mergeTarget.repeat(100)).targets.length,
      100
    );
    assert.throws(
      () => yaml.load(emptySources + mergeTarget.repeat(101)),
      /maxTotalMergeKeys/
    );
    assert.throws(
      () => yaml.load("!!omap [{duplicate: 1}, {duplicate: 2}]"),
      /omap/
    );
  });
}

test("browser builds bundle Mermaid's guarded YAML without a custom plugin or bare imports", async () => {
  const { output } = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: require.resolve("mermaid") },
    },
  });
  const chunks = output.filter((entry) => entry.type === "chunk");
  assert.ok(chunks.some((chunk) => isEmbeddedYamlParser(chunk.code)));
  for (const chunk of chunks) {
    assert.ok(!chunk.imports.includes("js-yaml"));
    assertNoUnsafeYaml(chunk.code);
  }
});
