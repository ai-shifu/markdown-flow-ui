import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { build } from "vite";
import { patchedMermaidYaml } from "../../scripts/mermaid-yaml.mjs";

const packageRoot = new URL("../../", import.meta.url);
const require = createRequire(new URL("package.json", packageRoot));
const manifest = require("./package.json");
// Kanban sanitizes labels even during parsing, so use an actual DOM environment.
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = window;
globalThis.document = window.document;

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

test("ships the patched Mermaid engine without a vendored YAML parser", () => {
  assert.equal(manifest.dependencies.mermaid, "12.2.0");
  assert.equal(manifest.dependencies["js-yaml"], "4.3.2");
  const files = readdirSync(new URL("dist/", packageRoot), {
    recursive: true,
  }).filter((file) => /\.(?:es\.js|cjs)$/.test(file));
  let yamlImportCount = 0;
  for (const file of files) {
    const code = readFileSync(new URL(`dist/${file}`, packageRoot), "utf8");
    assert.doesNotMatch(file, /(?:js-yaml|chunk-LNGE3PJU)/);
    assert.doesNotMatch(
      code,
      /js-yaml@|js-yaml 4\.(?:1\.|3\.0)|chunk-LNGE3PJU/
    );
    if (/(?:from\s*|require\()["']js-yaml["']/.test(code)) {
      yamlImportCount += 1;
    }
  }
  // Frontmatter and lazy flow, sequence and Kanban metadata in both formats.
  assert.ok(yamlImportCount >= 8, "Missing shared YAML imports");
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
          layout: "dagre",
          theme: "default",
          look: "classic",
        });
        assert.ok(await mermaid.parse(source));
      });
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
}

test("the shared YAML dependency preserves normal merges and bounds empty merges", () => {
  const yaml = require("js-yaml");
  assert.deepEqual(
    yaml.load("base: &base {a: 1}\nvalue: {<<: *base, b: true}"),
    { base: { a: 1 }, value: { a: 1, b: true } }
  );
  assert.deepEqual(yaml.load("!!omap [{first: 1}, {second: 2}]"), [
    { first: 1 },
    { second: 2 },
  ]);
  assert.throws(
    () => yaml.load("value: {<<: [{}, {}, {}, {}]}", { maxTotalMergeKeys: 3 }),
    /maxTotalMergeKeys/
  );
});

test("browser builds bundle the patched YAML dependency without bare imports", async () => {
  const { output } = await build({
    configFile: false,
    logLevel: "silent",
    plugins: [patchedMermaidYaml()],
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: require.resolve("mermaid") },
    },
  });
  const chunks = output.filter((entry) => entry.type === "chunk");
  assert.ok(chunks.some((chunk) => chunk.code.includes("maxTotalMergeKeys")));
  for (const chunk of chunks) {
    assert.ok(!chunk.imports.includes("js-yaml"));
    assert.doesNotMatch(chunk.code, /js-yaml(?:@| )4\.(?:1\.|3\.0)/);
  }
});
