import { describe, expect, it } from "vitest";

import { resolveMobileDevice } from "./mobileDevice";

describe("resolveMobileDevice", () => {
  it("treats mobile user agents as mobile", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: true,
        hasTabletLikeUserAgent: false,
      })
    ).toBe(true);
  });

  it("treats tablet user agents as mobile", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: false,
        hasTabletLikeUserAgent: true,
      })
    ).toBe(true);
  });

  it("keeps desktop user agents out of mobile mode", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: false,
        hasTabletLikeUserAgent: false,
      })
    ).toBe(false);
  });
});
