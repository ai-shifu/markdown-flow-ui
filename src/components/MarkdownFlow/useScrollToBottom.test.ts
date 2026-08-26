import { describe, expect, it } from "vitest";
import {
  getCombinedScrollPresentation,
  getScrollMetrics,
  getScrollPresentation,
  resolveScrollTargets,
  resolveScrollBehavior,
} from "./useScrollToBottom";

describe("scroll-to-bottom metrics", () => {
  it("reads the current position for an element target", () => {
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
  });

  it("hides the control when content does not overflow", () => {
    expect(
      getScrollPresentation({
        scrollTop: 0,
        scrollHeight: 400,
        clientHeight: 400,
      })
    ).toMatchObject({
      isAtBottom: true,
      isScrollable: false,
      showScrollToBottom: false,
    });
  });

  it("shows the control when overflowing content remains below the viewport", () => {
    expect(
      getScrollPresentation({
        scrollTop: 120,
        scrollHeight: 900,
        clientHeight: 400,
      })
    ).toEqual({
      distanceFromBottom: 380,
      isAtBottom: false,
      isScrollable: true,
      showScrollToBottom: true,
    });
  });

  it("matches the original strict near-bottom threshold", () => {
    expect(
      getScrollPresentation(
        {
          scrollTop: 350,
          scrollHeight: 900,
          clientHeight: 400,
        },
        150
      )
    ).toMatchObject({
      distanceFromBottom: 150,
      isAtBottom: false,
      showScrollToBottom: true,
    });
    expect(
      getScrollPresentation(
        {
          scrollTop: 351,
          scrollHeight: 900,
          clientHeight: 400,
        },
        150
      )
    ).toMatchObject({
      distanceFromBottom: 149,
      isAtBottom: true,
      showScrollToBottom: false,
    });
  });

  it("normalizes a negative threshold to zero", () => {
    expect(
      getScrollPresentation(
        {
          scrollTop: 499,
          scrollHeight: 900,
          clientHeight: 400,
        },
        -20
      )
    ).toMatchObject({
      distanceFromBottom: 1,
      isAtBottom: false,
      showScrollToBottom: true,
    });
  });

  it("shows the control when any active scroll root has content below", () => {
    expect(
      getCombinedScrollPresentation([
        { scrollTop: 500, scrollHeight: 900, clientHeight: 400 },
        { scrollTop: 100, scrollHeight: 1200, clientHeight: 700 },
      ])
    ).toMatchObject({
      isAtBottom: false,
      isScrollable: true,
      showScrollToBottom: true,
    });
  });
});

describe("scroll target resolution", () => {
  const createTargetFixture = (localOverflow: boolean) => {
    const overflowModes = new Map<HTMLElement, string>();
    const page = {
      nodeType: 9,
      defaultView: {
        getComputedStyle: (target: HTMLElement) => ({
          overflowY: overflowModes.get(target) ?? "auto",
        }),
      },
    } as unknown as Document;
    const parent = {
      clientHeight: 400,
      scrollHeight: 400,
      ownerDocument: page,
    } as HTMLElement;
    const viewport = {
      clientHeight: 400,
      ownerDocument: page,
      parentElement: parent,
      scrollHeight: localOverflow ? 900 : 400,
    } as HTMLElement;
    return {
      overflowModes,
      page,
      parent,
      viewport,
      viewportRef: { current: viewport },
    };
  };

  it.each(["visible", "clip"])(
    "does not let a parent with overflow %s suppress document fallback",
    (overflow) => {
      const fixture = createTargetFixture(false);
      Object.defineProperty(fixture.parent, "scrollHeight", { value: 1200 });
      fixture.overflowModes.set(fixture.parent, overflow);

      expect(resolveScrollTargets(fixture.viewportRef, undefined)).toEqual([
        fixture.viewport,
        fixture.page,
      ]);
    }
  );

  it("preserves programmatically scrollable hidden parents", () => {
    const fixture = createTargetFixture(false);
    Object.defineProperty(fixture.parent, "scrollHeight", { value: 1200 });
    fixture.overflowModes.set(fixture.parent, "hidden");

    expect(resolveScrollTargets(fixture.viewportRef, undefined)).toEqual([
      fixture.viewport,
      fixture.parent,
    ]);
  });

  it("ignores visible overflow on an inferred viewport as well", () => {
    const fixture = createTargetFixture(true);
    fixture.overflowModes.set(fixture.viewport, "visible");
    fixture.overflowModes.set(fixture.parent, "visible");

    expect(resolveScrollTargets(fixture.viewportRef, undefined)).toEqual([
      fixture.page,
    ]);
  });

  it("uses the viewport and parent without page fallback when local content scrolls", () => {
    const fixture = createTargetFixture(true);

    expect(
      resolveScrollTargets(fixture.viewportRef, undefined, "auto")
    ).toEqual([fixture.viewport, fixture.parent]);
  });

  it("adds the document when local containers do not scroll", () => {
    const fixture = createTargetFixture(false);

    expect(
      resolveScrollTargets(fixture.viewportRef, undefined, "auto")
    ).toEqual([fixture.viewport, fixture.parent, fixture.page]);
  });

  it("always includes the document for page-driven mobile layouts", () => {
    const fixture = createTargetFixture(true);

    expect(
      resolveScrollTargets(fixture.viewportRef, undefined, "always")
    ).toEqual([fixture.viewport, fixture.parent, fixture.page]);
  });

  it("never adds the document when page fallback is disabled", () => {
    const fixture = createTargetFixture(false);

    expect(
      resolveScrollTargets(fixture.viewportRef, undefined, "never")
    ).toEqual([fixture.viewport, fixture.parent]);
    expect(resolveScrollTargets({ current: null }, undefined, "never")).toEqual(
      []
    );
  });

  it("honors an explicit target without adding inferred roots", () => {
    const fixture = createTargetFixture(false);

    expect(
      resolveScrollTargets(fixture.viewportRef, fixture.parent, "always")
    ).toEqual([fixture.parent]);
  });
});

describe("scroll motion", () => {
  it("uses automatic scrolling when reduced motion is requested", () => {
    expect(resolveScrollBehavior("smooth", true)).toBe("auto");
  });

  it("preserves the requested behavior otherwise", () => {
    expect(resolveScrollBehavior("smooth", false)).toBe("smooth");
    expect(resolveScrollBehavior("auto", true)).toBe("auto");
  });
});
