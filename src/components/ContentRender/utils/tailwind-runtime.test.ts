import { describe, expect, it } from "vitest";

import { CJK_SAFE_SANS_FONT_FAMILIES } from "../cjkFontFamily";
import { refreshTailwindRuntime } from "./tailwind-runtime";

describe("refreshTailwindRuntime", () => {
  it("returns false when the Tailwind Play runtime is unavailable", () => {
    expect(
      refreshTailwindRuntime({ defaultView: null } as unknown as Document)
    ).toBe(false);
  });

  it("reassigns the config to trigger a JIT rescan and preserves custom config", () => {
    let assignedConfig: unknown;
    let currentConfig: unknown = {
      plugins: ["existing-plugin"],
      theme: {
        extend: {
          colors: { brand: "#0F63EE" },
        },
      },
    };
    const tailwindRuntime = {
      get config() {
        return currentConfig;
      },
      set config(value: unknown) {
        assignedConfig = value;
        currentConfig = value;
      },
    };
    const doc = {
      defaultView: { tailwind: tailwindRuntime },
    } as unknown as Document;

    expect(refreshTailwindRuntime(doc)).toBe(true);
    expect(assignedConfig).toMatchObject({
      plugins: ["existing-plugin"],
      theme: {
        extend: {
          colors: { brand: "#0F63EE" },
          fontFamily: {
            sans: [...CJK_SAFE_SANS_FONT_FAMILIES],
          },
        },
      },
    });
  });
});
