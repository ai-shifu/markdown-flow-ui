import React, { useCallback, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import ScrollToBottomControl from "./ScrollToBottomControl";
import ScrollToBottomButton from "./ScrollToBottomButton";
import useScrollToBottom from "./useScrollToBottom";
import "./markdownFlow.css";

interface ScrollControlFixtureProps {
  autoScrollOnInit?: boolean;
  followNewContent?: boolean;
  initialSections?: number;
  mobilePortal?: boolean;
  viewportHeight?: number;
  useEndAnchor?: boolean;
}

const sectionStyle: React.CSSProperties = {
  minHeight: 82,
  boxSizing: "border-box",
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
  color: "#242424",
};

const ScrollControlFixture: React.FC<ScrollControlFixtureProps> = ({
  autoScrollOnInit = false,
  followNewContent = true,
  initialSections = 8,
  mobilePortal = false,
  viewportHeight = 320,
  useEndAnchor = true,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState(initialSections);
  const [asyncGrowth, setAsyncGrowth] = useState(0);
  const [currentViewportHeight, setCurrentViewportHeight] =
    useState(viewportHeight);
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null);
  const portalRef = useCallback((element: HTMLDivElement | null) => {
    setPortalTarget(element);
  }, []);

  const fixtureActions = (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        paddingTop: mobilePortal ? 0 : 12,
        paddingBottom: mobilePortal ? 12 : 0,
      }}
    >
      <button
        type="button"
        data-testid="append-section"
        onClick={() => setSections((current) => current + 1)}
      >
        Append streamed section
      </button>
      <button
        type="button"
        data-testid="grow-content"
        onClick={() => setAsyncGrowth((current) => current + 180)}
      >
        Simulate async reflow
      </button>
      <button
        type="button"
        data-testid="shrink-viewport"
        onClick={() => setCurrentViewportHeight(180)}
      >
        Shrink viewport
      </button>
    </div>
  );

  return (
    <div
      style={{
        width: mobilePortal ? 360 : 640,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {mobilePortal ? fixtureActions : null}
      <div
        data-testid="scroll-shell"
        style={{
          position: "relative",
          height: currentViewportHeight,
          maxHeight: mobilePortal ? "calc(100dvh - 120px)" : undefined,
          overflow: "hidden",
          border: "1px solid #d8d8d8",
          borderRadius: 12,
          background: "#f7f7f7",
        }}
      >
        <div
          ref={viewportRef}
          data-testid="scroll-viewport"
          style={{ height: "100%", overflowY: "auto" }}
        >
          <div ref={contentRef} data-testid="scroll-content">
            {Array.from({ length: sections }, (_, index) => (
              <section key={index} style={sectionStyle}>
                <strong>Lesson section {index + 1}</strong>
                <p style={{ margin: "8px 0 0" }}>
                  Streaming lesson content used to verify learner-page scroll
                  behavior.
                </p>
              </section>
            ))}
            <div
              data-testid="async-growth"
              style={{ height: asyncGrowth, background: "#f3f7ff" }}
            />
            <button
              type="button"
              data-testid="last-action"
              style={{ margin: 20, minHeight: 40 }}
            >
              Last lesson action
            </button>
            <div ref={endRef} data-testid="bottom-anchor" />
          </div>
        </div>
        <ScrollToBottomControl
          viewportRef={viewportRef}
          contentRef={contentRef}
          endRef={useEndAnchor ? endRef : undefined}
          autoScrollOnInit={autoScrollOnInit}
          followNewContent={followNewContent}
          scrollThreshold={150}
          pageScrollFallback={mobilePortal ? "always" : "auto"}
          ariaLabel="Scroll to bottom"
          portalTarget={mobilePortal ? portalTarget : null}
          placement="bottom-center"
          position={mobilePortal && !portalTarget ? "fixed" : "absolute"}
          bottomOffset={mobilePortal ? (portalTarget ? 40 : 60) : 90}
          zIndex={mobilePortal ? 50 : 20}
        />
      </div>
      {mobilePortal ? null : fixtureActions}
      {mobilePortal ? (
        <div
          data-testid="mobile-footer"
          style={{
            position: "fixed",
            inset: "auto 0 0",
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            color: "#777",
            fontSize: 12,
            zIndex: 10,
          }}
        >
          <div
            ref={portalRef}
            data-testid="mobile-portal"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 0,
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
          Host footer
        </div>
      ) : null}
    </div>
  );
};

const PageFallbackFixture: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={viewportRef} style={{ minHeight: "150vh", padding: 24 }}>
      <h2>Document scroll fallback</h2>
      <p>The local content boxes do not scroll, so the page owns scrolling.</p>
      <div style={{ height: "110vh" }} />
      <button type="button">Last page action</button>
      <div aria-hidden="true" />
      <ScrollToBottomControl
        viewportRef={viewportRef}
        pageScrollFallback="auto"
        ariaLabel="Scroll page to bottom"
        placement="bottom-center"
        position="fixed"
        bottomOffset={24}
        zIndex={20}
      />
    </div>
  );
};

const CleanupFixture: React.FC<{ explicitTarget?: boolean }> = ({
  explicitTarget = false,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [revision, setRevision] = useState(0);

  return (
    <div style={{ position: "relative", height: 260 }}>
      <div
        key={revision}
        ref={viewportRef}
        data-testid="cleanup-viewport"
        style={{ height: 220, overflowY: "auto" }}
      >
        <div style={{ height: 700 }}>
          Observer and listener cleanup fixture
          <div ref={endRef} />
        </div>
      </div>
      {mounted ? (
        <ScrollToBottomControl
          viewportRef={viewportRef}
          scrollTarget={explicitTarget ? viewportRef : undefined}
          endRef={endRef}
          ariaLabel="Cleanup scroll control"
        />
      ) : null}
      <button
        type="button"
        data-testid="toggle-control"
        onClick={() => setMounted((current) => !current)}
      >
        Toggle control
      </button>
      <button
        type="button"
        data-testid="replace-viewport"
        onClick={() => setRevision((current) => current + 1)}
      >
        Replace viewport
      </button>
    </div>
  );
};

const LegacyClickFixture: React.FC<{ omitDependencies?: boolean }> = ({
  omitDependencies = false,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);
  const [unrelatedValue, setUnrelatedValue] = useState(0);
  const { handleUserScrollToBottom, showScrollToBottom } = useScrollToBottom(
    viewportRef,
    omitDependencies ? undefined : [revision],
    { autoScrollOnInit: false, scrollTarget: viewportRef, behavior: "auto" }
  );

  return (
    <div>
      <div
        ref={viewportRef}
        data-testid="scroll-viewport"
        style={{ height: 240, overflowY: "auto" }}
      >
        <div style={{ height: 900 }}>Legacy click-handler compatibility</div>
      </div>
      <button
        type="button"
        onClick={handleUserScrollToBottom}
        data-testid="legacy-scroll"
        data-visible={showScrollToBottom}
      >
        Scroll using the legacy handler
      </button>
      <button
        type="button"
        data-testid="unrelated-render"
        data-render-count={unrelatedValue}
        onClick={() => setUnrelatedValue((value) => value + 1)}
      >
        Unrelated render
      </button>
      <button
        type="button"
        data-testid="change-dependency"
        onClick={() => setRevision((value) => value + 1)}
      >
        Change dependency
      </button>
    </div>
  );
};

const NearBottomInterruptionFixture: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(1000);
  const scroll = useScrollToBottom(viewportRef, {
    contentRef,
    scrollTarget: viewportRef,
  });

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ position: "relative" }}>
        <div
          ref={viewportRef}
          data-testid="scroll-viewport"
          style={{ height: 240, overflowY: "auto" }}
        >
          <div ref={contentRef} style={{ height, background: "#f3f7ff" }}>
            Interrupt near the bottom while streamed content grows.
          </div>
        </div>
        <ScrollToBottomButton
          visible={scroll.showScrollToBottom}
          onClick={scroll.handleUserScrollToBottom}
          ariaLabel="Scroll to bottom"
        />
      </div>
      <output data-testid="follow-state">
        {scroll.followNewContent ? "Following" : "Paused"}
      </output>
      <button
        type="button"
        data-testid="interrupt-near-bottom"
        onClick={() => {
          const viewport = viewportRef.current;
          if (!viewport) return;
          scroll.scrollToBottom("smooth");
          // Place the native animation inside the threshold before its queued scroll event.
          viewport.scrollTo({
            top: viewport.scrollHeight - viewport.clientHeight - 50,
            behavior: "instant",
          });
          viewport.dispatchEvent(
            new WheelEvent("wheel", { deltaY: -100, bubbles: true })
          );
          setHeight((current) => current + 20);
        }}
      >
        Interrupt near bottom and stream
      </button>
      <button
        type="button"
        data-testid="grow-content"
        onClick={() => setHeight((current) => current + 180)}
      >
        Simulate async reflow
      </button>
    </div>
  );
};

const meta = {
  title: "MarkdownFlow/ScrollToBottomControl",
  component: ScrollControlFixture,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ScrollControlFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

const getViewport = (canvasElement: HTMLElement) => {
  const viewport = canvasElement.querySelector<HTMLElement>(
    '[data-testid="scroll-viewport"]'
  );
  expect(viewport).not.toBeNull();
  return viewport as HTMLElement;
};

const getButton = (root: ParentNode) => {
  const button = root.querySelector<HTMLButtonElement>(
    '[aria-label="Scroll to bottom"]'
  );
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
};

const scrollToTop = (viewport: HTMLElement) => {
  viewport.scrollTop = 0;
  viewport.dispatchEvent(new Event("scroll"));
};

const expectAtBottom = (viewport: HTMLElement) => {
  expect(viewport.scrollTop).toBeGreaterThanOrEqual(
    viewport.scrollHeight - viewport.clientHeight - 2
  );
};

export const ShortContentHidesControl: Story = {
  args: {
    initialSections: 1,
    viewportHeight: 320,
  },
  play: async ({ canvasElement }) => {
    const button = getButton(canvasElement);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "false");
      expect(button).toHaveAttribute("aria-hidden", "true");
      expect(button).toHaveAttribute("tabindex", "-1");
    });
  },
};

export const DesktopLearnerParity: Story = {
  args: {
    initialSections: 8,
    viewportHeight: 320,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);

    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });
    const style = getComputedStyle(button);
    expect(style.position).toBe("absolute");
    expect(style.bottom).toBe("90px");
    expect(style.width).toBe("36px");
    expect(style.height).toBe("36px");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(button.querySelector("svg")).toHaveClass("lucide-chevrons-down");

    await userEvent.click(button);
    await waitFor(() => {
      expectAtBottom(viewport);
      expect(button).toHaveAttribute("data-visible", "false");
    });
  },
};

export const MobilePortalParity: Story = {
  args: {
    initialSections: 8,
    mobilePortal: true,
    viewportHeight: 560,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const portal = canvasElement.querySelector<HTMLElement>(
      '[data-testid="mobile-portal"]'
    );
    expect(portal).not.toBeNull();
    const button = await waitFor(() => {
      const element = getButton(document);
      expect(element.parentElement).toBe(portal);
      expect(element).toHaveAttribute("data-visible", "true");
      return element;
    });

    const style = getComputedStyle(button);
    expect(style.position).toBe("absolute");
    expect(style.bottom).toBe("40px");
    expect(style.pointerEvents).toBe("auto");
    expect(
      Math.round(
        (portal as HTMLElement).getBoundingClientRect().top -
          button.getBoundingClientRect().bottom
      )
    ).toBe(40);

    await userEvent.click(button);
    await waitFor(() => {
      expectAtBottom(viewport);
      expect(button).toHaveAttribute("data-visible", "false");
    });
    const lastAction = canvasElement.querySelector<HTMLElement>(
      '[data-testid="last-action"]'
    );
    const footer = canvasElement.querySelector<HTMLElement>(
      '[data-testid="mobile-footer"]'
    );
    expect(lastAction).not.toBeNull();
    expect(footer).not.toBeNull();
    if (lastAction && footer) {
      const actionBounds = lastAction.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      expect(actionBounds.top).toBeGreaterThanOrEqual(viewportBounds.top);
      expect(actionBounds.bottom).toBeLessThanOrEqual(viewportBounds.bottom);
      expect(actionBounds.bottom).toBeLessThanOrEqual(
        footer.getBoundingClientRect().top
      );
    }
  },
};

export const MobileShortLandscapeViewport: Story = {
  ...MobilePortalParity,
  args: {
    ...MobilePortalParity.args,
    viewportHeight: 180,
  },
};

export const StreamingGrowthRespectsUserPosition: Story = {
  args: {
    autoScrollOnInit: true,
    initialSections: 6,
    viewportHeight: 280,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    const append = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="append-section"]'
    );
    const grow = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="grow-content"]'
    );
    expect(append).not.toBeNull();
    expect(grow).not.toBeNull();

    await waitFor(() => expectAtBottom(viewport));
    await userEvent.click(append as HTMLButtonElement);
    await waitFor(() => expectAtBottom(viewport));

    scrollToTop(viewport);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });
    const detachedScrollTop = viewport.scrollTop;

    await userEvent.click(grow as HTMLButtonElement);
    await waitFor(() => {
      expect(viewport.scrollTop).toBe(detachedScrollTop);
      expect(button).toHaveAttribute("data-visible", "true");
    });

    await userEvent.click(button);
    await waitFor(() => {
      expectAtBottom(viewport);
      expect(button).toHaveAttribute("data-visible", "false");
    });
  },
};

export const AutoFollowIgnoresCssSmoothScrolling: Story = {
  args: { autoScrollOnInit: true, initialSections: 6, viewportHeight: 280 },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const anchor = canvasElement.querySelector<HTMLElement>(
      '[data-testid="bottom-anchor"]'
    )!;
    await waitFor(() => expectAtBottom(viewport));
    viewport.style.scrollBehavior = "smooth";
    const distances: number[] = [];
    const recordPosition = () =>
      distances.push(
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop
      );
    const originalScroll = viewport.scrollTo;
    const originalIntoView = anchor.scrollIntoView;
    viewport.scrollTo = (options?: ScrollToOptions | number, y?: number) => {
      if (typeof options === "number")
        originalScroll.call(viewport, options, y ?? 0);
      else originalScroll.call(viewport, options);
      recordPosition();
    };
    anchor.scrollIntoView = (options) => {
      originalIntoView.call(anchor, options);
      recordPosition();
    };
    try {
      for (const action of ["append-section", "grow-content"]) {
        distances.length = 0;
        await userEvent.click(
          canvasElement.querySelector<HTMLButtonElement>(
            `[data-testid="${action}"]`
          )!
        );
        await waitFor(() => expect(distances.length).toBeGreaterThan(0));
        expect(distances.every((distance) => distance < 2)).toBe(true);
        expect(getButton(canvasElement)).toHaveAttribute(
          "data-visible",
          "false"
        );
      }
    } finally {
      viewport.scrollTo = originalScroll;
      anchor.scrollIntoView = originalIntoView;
      viewport.style.scrollBehavior = "";
    }
  },
};

export const DirectAutoFollowIgnoresCssSmoothScrolling: Story = {
  ...AutoFollowIgnoresCssSmoothScrolling,
  args: { ...AutoFollowIgnoresCssSmoothScrolling.args, useEndAnchor: false },
};

export const UserInterruptsSmoothScrollBeforeContentGrowth: Story = {
  args: { initialSections: 30, viewportHeight: 240 },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
      expect(getComputedStyle(button).opacity).toBe("1");
    });
    await userEvent.click(button);
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(10));
    expect(
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop
    ).toBeGreaterThan(150);
    viewport.dispatchEvent(
      new WheelEvent("wheel", { deltaY: -100, bubbles: true })
    );
    viewport.scrollTo({
      top: Math.max(0, viewport.scrollTop - 50),
      behavior: "instant",
    });
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    // Let the browser deliver the cancelled animation's final queued scroll event.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    const heldPosition = viewport.scrollTop;
    const previousHeight = viewport.scrollHeight;
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="grow-content"]'
      )!
    );
    await waitFor(() =>
      expect(viewport.scrollHeight).toBeGreaterThan(previousHeight)
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    expect(viewport.scrollTop).toBe(heldPosition);
    expect(button).toHaveAttribute("data-visible", "true");
    await userEvent.click(button);
    await waitFor(() => expectAtBottom(viewport));
  },
};

export const NearBottomInterruptionWaitsForUserMovement: Story = {
  render: () => <NearBottomInterruptionFixture />,
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    const state = canvasElement.querySelector('[data-testid="follow-state"]')!;
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
      expect(getComputedStyle(button).opacity).toBe("1");
    });
    const heldPosition = viewport.scrollHeight - viewport.clientHeight - 50;
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="interrupt-near-bottom"]'
      )!
    );
    await waitFor(() => expect(viewport.scrollHeight).toBe(1020));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    expect(state).toHaveTextContent("Paused");
    expect(viewport.scrollTop).toBe(heldPosition);
    expect(button).toHaveAttribute("data-visible", "false");

    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="grow-content"]'
      )!
    );
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    expect(state).toHaveTextContent("Paused");
    expect(viewport.scrollTop).toBe(heldPosition);
    await userEvent.click(button);
    await waitFor(() => {
      expectAtBottom(viewport);
      expect(state).toHaveTextContent("Following");
    });
  },
};

export const UserScrollWinsSameFrameGrowth: Story = {
  args: {
    autoScrollOnInit: true,
    initialSections: 6,
    viewportHeight: 280,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    const growth = canvasElement.querySelector<HTMLElement>(
      '[data-testid="async-growth"]'
    )!;
    await waitFor(() => expectAtBottom(viewport));
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const view = viewport.ownerDocument.defaultView!;
    const originalRequestFrame = view.requestAnimationFrame;
    const originalCancelFrame = view.cancelAnimationFrame;
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame = 1000000;
    view.requestAnimationFrame = (callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    };
    view.cancelAnimationFrame = (id) => {
      frames.delete(id);
    };
    try {
      // Flush the queued layout frame before a later native scroll event can mask the race.
      scrollToTop(viewport);
      growth.appendChild(document.createTextNode("New streamed content"));
      growth.style.height = "400px";
      view.dispatchEvent(new Event("resize"));
      const queued = Array.from(frames.values());
      frames.clear();
      queued.forEach((callback) => callback(performance.now()));
      expect(viewport.scrollTop).toBe(0);
    } finally {
      view.requestAnimationFrame = originalRequestFrame;
      view.cancelAnimationFrame = originalCancelFrame;
    }

    await waitFor(() => {
      expect(viewport.scrollTop).toBe(0);
      expect(button).toHaveAttribute("data-visible", "true");
    });
    await userEvent.click(button);
    await waitFor(() => expectAtBottom(viewport));
  },
};

export const ViewportResizeReevaluatesControl: Story = {
  args: {
    followNewContent: false,
    initialSections: 3,
    viewportHeight: 420,
  },
  play: async ({ canvasElement }) => {
    const button = getButton(canvasElement);
    const shrink = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="shrink-viewport"]'
    );
    expect(shrink).not.toBeNull();

    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "false");
    });
    await userEvent.click(shrink as HTMLButtonElement);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });
  },
};

export const DocumentFallback: Story = {
  render: () => <PageFallbackFixture />,
  play: async ({ canvasElement }) => {
    const scroller = document.scrollingElement as HTMLElement;
    scroller.scrollTop = 0;
    document.defaultView?.dispatchEvent(new Event("scroll"));
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[aria-label="Scroll page to bottom"]'
    );
    expect(button).not.toBeNull();

    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });
    await userEvent.click(button as HTMLButtonElement);
    await waitFor(() => {
      expect(scroller.scrollTop).toBeGreaterThan(0);
      expect(button).toHaveAttribute("data-visible", "false");
    });
  },
};

export const VisibleOverflowParentUsesDocumentFallback: Story = {
  ...DocumentFallback,
  render: () => (
    <div style={{ height: 200, overflowY: "visible" }}>
      <PageFallbackFixture />
    </div>
  ),
};

export const ReducedMotionUsesImmediateScroll: Story = {
  args: {
    initialSections: 8,
    viewportHeight: 320,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    const anchor = canvasElement.querySelector<HTMLElement>(
      '[data-testid="bottom-anchor"]'
    );
    const append = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="append-section"]'
    );
    expect(anchor).not.toBeNull();
    expect(append).not.toBeNull();

    const targetWindow = viewport.ownerDocument.defaultView;
    expect(targetWindow).not.toBeNull();
    if (!targetWindow) return;
    const originalMatchMedia = targetWindow.matchMedia;
    const originalScrollIntoView = anchor?.scrollIntoView;
    let requestedBehavior: ScrollOptions["behavior"];
    targetWindow.matchMedia = ((query: string) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      }) satisfies MediaQueryList) as typeof targetWindow.matchMedia;
    if (anchor) {
      anchor.scrollIntoView = (options) => {
        requestedBehavior =
          typeof options === "object" ? options.behavior : undefined;
        viewport.scrollTop = viewport.scrollHeight;
        viewport.dispatchEvent(new Event("scroll"));
      };
    }
    try {
      await waitFor(() => {
        expect(button).toHaveAttribute("data-visible", "true");
      });
      expect(button.tagName).toBe("BUTTON");
      expect(button.tabIndex).toBe(0);
      await userEvent.click(append as HTMLButtonElement);
      await waitFor(() => {
        expect(button).toBeVisible();
        expect(getComputedStyle(button).opacity).toBe("1");
      });
      await userEvent.tab({ shift: true });
      expect(button).toHaveFocus();
      const focusStyle = getComputedStyle(button);
      expect(focusStyle.outlineStyle).not.toBe("none");
      expect(focusStyle.outlineWidth).toBe("2px");
      expect(focusStyle.transitionProperty).not.toContain("all");
      expect(focusStyle.transitionProperty).not.toContain("outline");
      await userEvent.keyboard("{Enter}");
      await waitFor(() => {
        expect(requestedBehavior).toBe("instant");
        expect(button).toHaveAttribute("data-visible", "false");
      });
    } finally {
      targetWindow.matchMedia = originalMatchMedia;
      if (anchor && originalScrollIntoView) {
        anchor.scrollIntoView = originalScrollIntoView;
      }
    }
  },
};

export const UnmountCleansObserversAndListeners: Story = {
  render: () => <CleanupFixture />,
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-testid="cleanup-viewport"]'
    );
    const toggle = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="toggle-control"]'
    );
    expect(viewport).not.toBeNull();
    expect(toggle).not.toBeNull();
    if (!viewport || !toggle) return;

    const originalAddEventListener = viewport.addEventListener;
    const originalRemoveEventListener = viewport.removeEventListener;
    const observerWindow = viewport.ownerDocument.defaultView as Window &
      typeof globalThis;
    const originalResizeObserver = observerWindow.ResizeObserver;
    const originalMutationObserver = observerWindow.MutationObserver;
    const activeScrollListeners = new Set<EventListenerOrEventListenerObject>();
    let resizeDisconnects = 0;
    let mutationDisconnects = 0;

    viewport.addEventListener = function (type, listener, options) {
      if (type === "scroll") activeScrollListeners.add(listener);
      return originalAddEventListener.call(this, type, listener, options);
    };
    viewport.removeEventListener = function (type, listener, options) {
      if (type === "scroll") activeScrollListeners.delete(listener);
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    observerWindow.ResizeObserver = class extends originalResizeObserver {
      disconnect() {
        resizeDisconnects += 1;
        super.disconnect();
      }
    };
    observerWindow.MutationObserver = class extends originalMutationObserver {
      disconnect() {
        mutationDisconnects += 1;
        super.disconnect();
      }
    };

    try {
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(activeScrollListeners.size).toBeGreaterThan(0);
        expect(
          canvasElement.querySelector('[aria-label="Cleanup scroll control"]')
        ).not.toBeNull();
      });
      const resizeDisconnectsBeforeUnmount = resizeDisconnects;
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(activeScrollListeners.size).toBe(0);
        expect(resizeDisconnects).toBeGreaterThan(
          resizeDisconnectsBeforeUnmount
        );
        expect(mutationDisconnects).toBeGreaterThan(0);
      });
    } finally {
      viewport.addEventListener = originalAddEventListener;
      viewport.removeEventListener = originalRemoveEventListener;
      observerWindow.ResizeObserver = originalResizeObserver;
      observerWindow.MutationObserver = originalMutationObserver;
    }
  },
};

export const ShortLandscapeViewport: Story = {
  args: {
    initialSections: 6,
    viewportHeight: 180,
  },
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = getButton(canvasElement);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });
    expect(button.getBoundingClientRect().height).toBe(36);
    await userEvent.click(button);
    await waitFor(() => expectAtBottom(viewport));
  },
};

export const LegacyHandlerAcceptsReactClickEvents: Story = {
  render: () => <LegacyClickFixture />,
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="legacy-scroll"]'
    )!;
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    await userEvent.click(button);
    await waitFor(() => {
      expectAtBottom(viewport);
      expect(button).toHaveAttribute("data-visible", "false");
    });
  },
};

export const LegacyDependenciesIgnoreUnrelatedRenders: Story = {
  render: () => <LegacyClickFixture />,
  play: async ({ canvasElement }) => {
    const viewport = getViewport(canvasElement);
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[data-testid="legacy-scroll"]'
    )!;
    await viewport.ownerDocument.fonts.ready;
    await userEvent.click(button);
    await waitFor(() => expectAtBottom(viewport));
    // Wait for initial observer delivery before measuring dependency-driven scrolls.
    await new Promise<void>((resolve) => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      observer.observe(viewport);
    });
    const originalScroll = viewport.scrollTo;
    let scrollCalls = 0;
    viewport.scrollTo = (options?: ScrollToOptions | number, y?: number) => {
      scrollCalls += 1;
      Reflect.apply(
        originalScroll,
        viewport,
        typeof options === "number" ? [options, y ?? 0] : [options]
      );
    };
    try {
      await userEvent.click(
        canvasElement.querySelector<HTMLButtonElement>(
          '[data-testid="unrelated-render"]'
        )!
      );
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      expect(scrollCalls).toBe(0);
      await userEvent.click(
        canvasElement.querySelector<HTMLButtonElement>(
          '[data-testid="change-dependency"]'
        )!
      );
      await waitFor(() => expect(scrollCalls).toBe(1));
    } finally {
      viewport.scrollTo = originalScroll;
    }
  },
};

export const LegacyOptionsWithoutDependencies: Story = {
  ...LegacyHandlerAcceptsReactClickEvents,
  render: () => <LegacyClickFixture omitDependencies />,
};

const PendingTargetFixture = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setMounted(true)}
        data-testid="mount-target"
      >
        Mount the explicit target
      </button>
      <div
        ref={viewportRef}
        data-testid="fallback-viewport"
        style={{ height: 280, overflowY: "auto" }}
      >
        {mounted ? (
          <div
            ref={targetRef}
            data-testid="explicit-viewport"
            style={{ height: 200, overflowY: "auto" }}
          >
            <div style={{ height: 1000 }}>Explicit target content</div>
          </div>
        ) : null}
        <div style={{ height: 1000 }}>Fallback content must not move</div>
      </div>
      <ScrollToBottomControl
        viewportRef={viewportRef}
        scrollTarget={targetRef}
        autoScrollOnInit
        ariaLabel="Pending target scroll control"
      />
    </div>
  );
};

export const ExplicitTargetWaitsUntilMounted: Story = {
  render: () => <PendingTargetFixture />,
  play: async ({ canvasElement }) => {
    const fallback = canvasElement.querySelector<HTMLElement>(
      '[data-testid="fallback-viewport"]'
    )!;
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[aria-label="Pending target scroll control"]'
    )!;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    expect(fallback.scrollTop).toBe(0);
    expect(button).toHaveAttribute("data-visible", "false");
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="mount-target"]'
      )!
    );
    const target = canvasElement.querySelector<HTMLElement>(
      '[data-testid="explicit-viewport"]'
    )!;
    await waitFor(() => expectAtBottom(target));
    expect(fallback.scrollTop).toBe(0);
    scrollToTop(target);
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
  },
};

export const StableViewportRefRebindsAfterReplacement: Story = {
  render: () => <CleanupFixture />,
  play: async ({ canvasElement }) => {
    const view = canvasElement.ownerDocument.defaultView as Window &
      typeof globalThis;
    const originalResizeObserver = view.ResizeObserver;
    const originalMutationObserver = view.MutationObserver;
    // A responsive React commit must rebind even without a resize or mutation callback.
    view.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    view.MutationObserver = class {
      observe() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
    let removedScrollListeners = 0;
    const oldViewport = canvasElement.querySelector<HTMLElement>(
      '[data-testid="cleanup-viewport"]'
    )!;
    const originalRemoveListener = oldViewport.removeEventListener;
    oldViewport.removeEventListener = function (type, listener, options) {
      if (type === "scroll") removedScrollListeners += 1;
      return originalRemoveListener.call(this, type, listener, options);
    };
    try {
      await userEvent.click(
        canvasElement.querySelector<HTMLButtonElement>(
          '[data-testid="toggle-control"]'
        )!
      );
      const button = canvasElement.querySelector<HTMLButtonElement>(
        '[aria-label="Cleanup scroll control"]'
      )!;
      await waitFor(() =>
        expect(button).toHaveAttribute("data-visible", "true")
      );
      await userEvent.click(
        canvasElement.querySelector<HTMLButtonElement>(
          '[data-testid="replace-viewport"]'
        )!
      );
      await waitFor(() => expect(removedScrollListeners).toBeGreaterThan(0));
      const replacement = canvasElement.querySelector<HTMLElement>(
        '[data-testid="cleanup-viewport"]'
      )!;
      expect(replacement).not.toBe(oldViewport);
      replacement.scrollTop = replacement.scrollHeight;
      replacement.dispatchEvent(new Event("scroll"));
      await waitFor(() =>
        expect(button).toHaveAttribute("data-visible", "false")
      );
      scrollToTop(replacement);
      await waitFor(() =>
        expect(button).toHaveAttribute("data-visible", "true")
      );
    } finally {
      oldViewport.removeEventListener = originalRemoveListener;
      view.ResizeObserver = originalResizeObserver;
      view.MutationObserver = originalMutationObserver;
    }
  },
};

export const StableExplicitRefRebindsAfterReplacement: Story = {
  ...StableViewportRefRebindsAfterReplacement,
  render: () => <CleanupFixture explicitTarget />,
};

const MidScrollTargetSwitchFixture = () => {
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const [secondActive, setSecondActive] = useState(false);
  const [height, setHeight] = useState(1600);
  const scroll = useScrollToBottom(firstRef, {
    scrollTarget: secondActive ? secondRef : firstRef,
    pageScrollFallback: "never",
  });
  return (
    <div style={{ position: "relative", maxWidth: 640 }}>
      <button
        type="button"
        data-testid="switch-during-scroll"
        onClick={() => {
          scroll.scrollToBottom();
          setSecondActive((current) => !current);
        }}
      >
        Start scrolling and switch target
      </button>
      <button
        type="button"
        data-testid="grow-switched-target"
        onClick={() => setHeight((current) => current + 200)}
      >
        Grow content
      </button>
      {[firstRef, secondRef].map((ref, index) => (
        <div
          key={index}
          ref={ref}
          data-testid={`switch-target-${index}`}
          style={{ height: 240, overflowY: "auto", border: "1px solid #aaa" }}
        >
          <div style={{ height }}>
            Scroll target {index + 1}
            {secondActive === (index === 1) ? " (active)" : ""}
          </div>
        </div>
      ))}
      <ScrollToBottomButton
        visible={scroll.showScrollToBottom}
        ariaLabel="Latest content in active target"
        onClick={scroll.handleUserScrollToBottom}
      />
    </div>
  );
};

export const TargetSwitchDuringSmoothScroll: Story = {
  render: () => <MidScrollTargetSwitchFixture />,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[aria-label="Latest content in active target"]'
    )!;
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="switch-during-scroll"]'
      )!
    );
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    const target = canvasElement.querySelector<HTMLElement>(
      '[data-testid="switch-target-1"]'
    )!;
    target.scrollTop = 100;
    target.dispatchEvent(new Event("scroll"));
    const previousHeight = target.scrollHeight;
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>(
        '[data-testid="grow-switched-target"]'
      )!
    );
    await waitFor(() =>
      expect(target.scrollHeight).toBeGreaterThan(previousHeight)
    );
    // Wait for the observer frame to check that content growth does not resume follow.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    expect(target.scrollTop).toBe(100);
    expect(button).toHaveAttribute("data-visible", "true");
    await userEvent.click(button);
    await waitFor(() =>
      expect(
        target.scrollHeight - target.clientHeight - target.scrollTop
      ).toBeLessThan(2)
    );
    expect(button).toHaveAttribute("data-visible", "false");
  },
};
