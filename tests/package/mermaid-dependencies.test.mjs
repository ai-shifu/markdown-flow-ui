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

test("ships the patched Mermaid engine without a vendored YAML parser", () => {
  assert.equal(manifest.dependencies.mermaid, "11.16.1");
  assert.equal(manifest.dependencies["js-yaml"], "4.3.2");
  const files = readdirSync(new URL("dist/", packageRoot), {
    recursive: true,
  }).filter((file) => /\.(?:es\.js|cjs)$/.test(file));
  let yamlImportCount = 0;
  for (const file of files) {
    const code = readFileSync(new URL(`dist/${file}`, packageRoot), "utf8");
    assert.doesNotMatch(file, /(?:js-yaml|chunk-ZIRB5QZD)/);
    assert.doesNotMatch(code, /js-yaml@|js-yaml 4\.1\.|chunk-ZIRB5QZD/);
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
  test(`${format} preserves Mermaid parsing and rejects excessive YAML nesting`, async () => {
    const module = await import(entry.href);
    const mermaid = format === "cjs" ? module.default.default : module.default;
    mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
    const controls = [
      "---\ntitle: Valid frontmatter\n---\nflowchart TD; A-->B",
      'flowchart TD\nA@{ shape: rect, label: "Valid metadata" } --> B',
      'sequenceDiagram\nparticipant A@{ "type": "boundary" }\nA->>B: Hello',
      "kanban\n  todo[Todo]\n    task[Task]@{ priority: High }",
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
    assert.doesNotMatch(chunk.code, /js-yaml@4\.1\.|js-yaml 4\.1\./);
  }
});
