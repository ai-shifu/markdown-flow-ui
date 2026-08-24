import { describe, expect, it } from "vitest";
import { getScrollMetrics } from "./useScrollToBottom";

describe("scroll-to-bottom metrics", () => {
  it("detects overflow and the current position for an element target", () => {
    const target = {
      scrollTop: 120,
      scrollHeight: 900,
      clientHeight: 400,
    } as HTMLElement;

    expect(getScrollMetrics(target)).toEqual({
      scrollTop: 120,
      scrollHeight: 900,
      clientHeight: 400,
    });
    expect(target.scrollHeight > target.clientHeight).toBe(true);
  });
});
