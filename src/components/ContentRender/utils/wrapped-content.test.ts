import { describe, expect, it } from "vitest";
import {
  normalizeWrappedSandboxContent,
  splitContentSegments,
} from "./split-content";

describe("legacy wrapped sandbox projection", () => {
  it.each(["\n", "\\n"])("unwraps HTML without decoding %j", (newline) => {
    const source = `Intro${newline}<div>Card</div>${newline}Outro`;
    expect(normalizeWrappedSandboxContent(`"${source}"`)).toBe(source);
  });

  it.each([
    '"Only prose"',
    '"Intro\n```mermaid\ngraph TD\nA --> B\n```\nOutro"',
    '"Use `<div>Example</div>` carefully."',
    '"Intro\n<div>Incomplete',
    "Intro\n<div>Unwrapped</div>\nOutro",
  ])("keeps other source unchanged: %s", (raw) => {
    expect(normalizeWrappedSandboxContent(raw)).toBe(raw);
  });

  it("keeps essential surrounding lines and valid Markdown fence boundaries", () => {
    const mermaid = "```mermaid\ngraph TD\nA --> B\n```";
    const html = "<div>Card</div>";
    const raw = `"Intro\nRedundant\n${mermaid}\n${html}\nOutro"`;
    expect(normalizeWrappedSandboxContent(raw)).toBe(
      `Intro\n${mermaid}\n${html}`
    );
    // The existing exported splitter keeps its legacy non-streaming contract.
    expect(
      splitContentSegments(raw, true)
        .map((part) => part.value)
        .join("")
    ).toBe(`Intro${mermaid}${html}`);
  });
});
