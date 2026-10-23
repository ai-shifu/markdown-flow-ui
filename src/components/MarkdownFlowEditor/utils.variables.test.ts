import { describe, expect, it } from "vitest";
import {
  createVariableExpressionRegexp,
  extractVariableNames,
  isValidVariableName,
  normalizeVariableName,
  findVariableMarkers,
  formatVariableReference,
} from "./utils";

describe("variable names shared with the interaction parser", () => {
  it.each([
    "gender",
    "user_name_2",
    "\ufeffkey\ufeff",
    "你的性别是？",
    "Which-option?",
    "école",
    "نام؟",
    "年齢🙂?",
  ])("accepts the existing backend name %s", (name) => {
    expect(isValidVariableName(name)).toBe(true);
    expect(normalizeVariableName(` ${name} `)).toBe(name);
    expect(`{{ ${name} }}`.match(createVariableExpressionRegexp())?.[0]).toBe(
      `{{ ${name} }}`
    );
  });

  it.each([
    "",
    " ",
    "first\tname",
    "first\nname",
    "a\u0085b",
    "a\u001cb",
    "a}}b",
    "a\u2028b",
  ])("rejects the backend's invalid name %j", (name) => {
    expect(isValidVariableName(name)).toBe(false);
    expect(normalizeVariableName(name)).toBeNull();
  });

  it("uses Python whitespace boundaries without stripping legal BOM characters", () => {
    expect(normalizeVariableName("\u0085\u001c\ufeffkey\ufeff\u001f")).toBe(
      "\ufeffkey\ufeff"
    );
    expect(extractVariableNames("{{\u0085\ufeffkey\ufeff\u001f}}")).toEqual([
      "\ufeffkey\ufeff",
    ]);
  });

  it("extracts trimmed question keys and old identifiers without changing their text", () => {
    expect(
      extractVariableNames(
        "{{ user_name }} ?[%{{ 你的性别是？ }} 男 | 女] {{你的性别是？}} {{Which-option?}} {{first name}}"
      )
    ).toEqual(["user_name", "你的性别是？", "Which-option?", "first name"]);
  });
});

import contract from "../../../tests/fixtures/variable-name-contract.json";

describe("shared text variable-name contract", () => {
  it.each(contract.normalization)("normalizes $raw", ({ raw, name }) => {
    expect(normalizeVariableName(raw)).toBe(name);
    expect(isValidVariableName(raw)).toBe(name !== null);
    const serialized = formatVariableReference(raw);
    if (name === null) expect(serialized).toBeNull();
    else {
      expect(serialized).toBe(`{{ ${name} }}`);
      expect(findVariableMarkers(serialized!)).toEqual([
        { start: 0, end: serialized!.length, rawName: ` ${name} `, name },
      ]);
    }
  });

  it.each(contract.extraction)(
    "extracts $source without recursive marker parsing",
    ({ source, names }) => {
      expect(extractVariableNames(source)).toEqual(names);
    }
  );
});

it.each(contract.document_context_cases)(
  "extracts names within document context $id",
  ({ source, names }) => {
    expect(extractVariableNames(source)).toEqual(names);
  }
);

import documentBoundaries from "../../../tests/fixtures/document-boundary-cases.json";
import { findDocumentVariableMarkers } from "remark-flow";

it.each(documentBoundaries)(
  "respects code span boundaries in $id",
  ({ source, names }) => {
    expect(extractVariableNames(source)).toEqual(names);
    expect(
      findDocumentVariableMarkers(source).flatMap((marker) =>
        marker.name === null ? [] : [marker.name]
      )
    ).toEqual(names);
  }
);
