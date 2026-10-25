import { describe, expect, it } from "vitest";

import {
  addCjkSafeSansToTailwindConfig,
  CJK_SAFE_SANS_FONT_FAMILIES,
  CJK_SAFE_SANS_FONT_FAMILY,
} from "./cjkFontFamily";

describe("CJK-safe sans font family", () => {
  it("keeps system fonts first and adds cross-platform CJK fallbacks", () => {
    expect(CJK_SAFE_SANS_FONT_FAMILIES[0]).toBe("system-ui");
    expect(CJK_SAFE_SANS_FONT_FAMILY).toContain('"PingFang SC"');
    expect(CJK_SAFE_SANS_FONT_FAMILY).toContain('"Microsoft YaHei"');
    expect(CJK_SAFE_SANS_FONT_FAMILY).toContain('"Noto Sans CJK SC"');
    expect(CJK_SAFE_SANS_FONT_FAMILIES.at(-1)).toBe("sans-serif");
  });

  it("extends Tailwind sans fonts without dropping existing configuration", () => {
    const result = addCjkSafeSansToTailwindConfig({
      darkMode: "class",
      theme: {
        extend: {
          colors: { brand: "#0f63ee" },
          fontFamily: { mono: ["monospace"] },
        },
      },
    });

    expect(result).toMatchObject({
      darkMode: "class",
      theme: {
        extend: {
          colors: { brand: "#0f63ee" },
          fontFamily: {
            mono: ["monospace"],
            sans: [...CJK_SAFE_SANS_FONT_FAMILIES],
          },
        },
      },
    });
  });
});
