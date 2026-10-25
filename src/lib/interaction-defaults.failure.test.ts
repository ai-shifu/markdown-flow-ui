import { afterEach, expect, it, vi } from "vitest";

vi.mock("remark-flow", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remark-flow")>();
  return {
    ...actual,
    createInteractionParser: () => ({
      parse: () => ({}),
      parseToRemarkFormat: () => {
        throw new Error("Intentional parser failure");
      },
    }),
  };
});

import { getInteractionDefaultValues } from "./interaction-defaults";

afterEach(() => vi.restoreAllMocks());

it.each([
  "?[%{{ Which [path] | level//hint...? }} A || B]",
  "?[A {{ inner||name//hint... }} | B]",
])(
  "keeps plain replay defaults when the shared parser fails for %s",
  (source) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getInteractionDefaultValues(source, "A")).toEqual({
      buttonText: "A",
      inputText: "A",
    });
  }
);
