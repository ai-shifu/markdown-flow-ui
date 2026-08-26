// @vitest-environment jsdom
import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useScrollToBottom, {
  type ScrollBehavior,
  type UseScrollToBottomOptions,
} from "./useScrollToBottom";

const frames = new Map<number, FrameRequestCallback>();
const elements: HTMLElement[] = [];
let nextFrame = 0;

function flushFrames() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
}

function createScroller() {
  const element = document.createElement("div");
  element.style.overflowY = "auto";
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: 1000 },
    clientHeight: { configurable: true, value: 200 },
  });
  // Leave scrolling pending until the test explicitly delivers a scroll event.
  element.scrollTo = vi.fn();
  document.body.appendChild(element);
  elements.push(element);
  return element;
}

beforeEach(() => {
  vi.useFakeTimers();
  nextFrame = 0;
  frames.clear();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
});

afterEach(() => {
  cleanup();
  elements.splice(0).forEach((element) => element.remove());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe.each([false, true])(
  "immediate native scrolling (reduced motion: %s)",
  (reducedMotion) => {
    it.each(["element", "document", "window", "anchor"])(
      "bypasses CSS smooth behavior for the %s path",
      (path) => {
        const target = createScroller();
        target.style.scrollBehavior = "smooth";
        const viewportRef = { current: target };
        const originalScroller = Object.getOwnPropertyDescriptor(
          document,
          "scrollingElement"
        );
        Object.defineProperty(document, "scrollingElement", {
          configurable: true,
          value: target,
        });
        vi.stubGlobal(
          "matchMedia",
          vi.fn(() => ({ matches: reducedMotion }))
        );
        const windowScroll = vi
          .spyOn(window, "scrollTo")
          .mockImplementation(() => {});
        target.scrollIntoView = vi.fn();
        const scrollTarget =
          path === "document" ? document : path === "window" ? window : target;
        try {
          const { result, unmount } = renderHook(() =>
            useScrollToBottom(viewportRef, {
              scrollTarget,
              endRef: path === "anchor" ? viewportRef : undefined,
            })
          );
          act(() =>
            result.current.scrollToBottom(reducedMotion ? "smooth" : "auto")
          );
          const scroll =
            path === "anchor"
              ? target.scrollIntoView
              : path === "window"
                ? windowScroll
                : target.scrollTo;
          expect(scroll).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: "instant" })
          );
          unmount();
        } finally {
          if (originalScroller)
            Object.defineProperty(
              document,
              "scrollingElement",
              originalScroller
            );
          else Reflect.deleteProperty(document, "scrollingElement");
        }
      }
    );
  }
);

describe("legacy calls without dependencies", () => {
  it("honors explicit threshold, behavior and follow options", () => {
    const target = createScroller();
    target.scrollTop = 750;
    const ref = { current: target };
    const { result } = renderHook(() =>
      useScrollToBottom(ref, undefined, {
        scrollThreshold: 10,
        behavior: "auto",
        autoScrollOnInit: false,
        followNewContent: false,
      })
    );
    flushFrames();
    expect(target.scrollTo).not.toHaveBeenCalled();
    expect(result.current.showScrollToBottom).toBe(true);
    expect(result.current.followNewContent).toBe(false);
    act(() => result.current.handleUserScrollToBottom());
    expect(target.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: "instant",
    });
    expect(result.current.followNewContent).toBe(false);
  });

  it("retains legacy initial scrolling when a third options argument is supplied", () => {
    const target = createScroller();
    const ref = { current: target };
    renderHook(() => useScrollToBottom(ref, undefined, {}));
    flushFrames();
    expect(target.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: "instant",
    });
  });

  it("keeps modern defaults when both optional arguments are absent", () => {
    const target = createScroller();
    target.scrollTop = 750;
    const ref = { current: target };
    const { result } = renderHook(() => useScrollToBottom(ref, undefined));
    flushFrames();
    expect(target.scrollTo).not.toHaveBeenCalled();
    expect(result.current.showScrollToBottom).toBe(false);
  });
});

describe.each(["element", "document"])(
  "smooth-scroll interruption on %s",
  (path) => {
    it.each([
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
      "reverse scroll",
    ])(
      "pauses follow immediately after %s and cleans input listeners",
      (input) => {
        const target = createScroller();
        const ref = { current: target };
        const originalScroller = Object.getOwnPropertyDescriptor(
          document,
          "scrollingElement"
        );
        Object.defineProperty(document, "scrollingElement", {
          configurable: true,
          value: target,
        });
        const root = path === "document" ? window : target;
        const add = vi.spyOn(root, "addEventListener");
        const remove = vi.spyOn(root, "removeEventListener");
        const options = {
          scrollTarget: path === "document" ? document : target,
        };
        try {
          const { result, rerender, unmount } = renderHook(
            (props) => useScrollToBottom(ref, props),
            { initialProps: { ...options, contentVersion: 0 } }
          );
          act(() => result.current.scrollToBottom("smooth"));
          target.scrollTop = 400;
          fireEvent.scroll(root);
          expect(result.current.followNewContent).toBe(true);
          if (input === "wheel") fireEvent.wheel(root, { deltaY: -100 });
          if (input === "touchstart") fireEvent.touchStart(root);
          if (input === "pointerdown")
            fireEvent.pointerDown(root, { button: 0 });
          if (input === "keydown") fireEvent.keyDown(root, { key: "PageUp" });
          target.scrollTop = 100;
          fireEvent.scroll(root);
          expect(result.current.showScrollToBottom).toBe(true);
          expect(result.current.followNewContent).toBe(false);
          expect(vi.getTimerCount()).toBe(0);

          vi.mocked(target.scrollTo).mockClear();
          Object.defineProperty(target, "scrollHeight", { value: 1400 });
          rerender({ ...options, contentVersion: 1 });
          fireEvent.resize(window);
          flushFrames();
          act(() => vi.advanceTimersByTime(1200));
          expect(target.scrollTo).not.toHaveBeenCalled();
          expect(result.current.showScrollToBottom).toBe(true);

          act(() => result.current.handleUserScrollToBottom());
          target.scrollTop = 1200;
          fireEvent.scroll(root);
          expect(result.current.followNewContent).toBe(true);
          unmount();
          for (const [type, listener] of add.mock.calls) {
            if (
              ["wheel", "touchstart", "pointerdown", "keydown"].includes(type)
            ) {
              expect(remove).toHaveBeenCalledWith(type, listener, true);
            }
          }
          expect(frames.size).toBe(0);
          expect(vi.getTimerCount()).toBe(0);
        } finally {
          cleanup();
          if (originalScroller)
            Object.defineProperty(
              document,
              "scrollingElement",
              originalScroller
            );
          else Reflect.deleteProperty(document, "scrollingElement");
        }
      }
    );
  }
);

it("does not interrupt smooth scrolling for non-scroll keys or text editing", () => {
  const target = createScroller();
  const input = document.createElement("input");
  target.appendChild(input);
  const ref = { current: target };
  const { result } = renderHook(() => useScrollToBottom(ref));
  act(() => result.current.scrollToBottom("smooth"));
  fireEvent.keyDown(target, { key: "a" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(target, { key: "Home", ctrlKey: true });
  fireEvent.wheel(target, { deltaX: 100, deltaY: 0 });
  expect(result.current.followNewContent).toBe(true);
  expect(result.current.showScrollToBottom).toBe(false);
  expect(vi.getTimerCount()).toBe(1);
});

describe.each([true, false])(
  "pending explicit target (initial scroll: %s)",
  (autoScrollOnInit) => {
    it.each(["ref", "resolver"])(
      "waits for the supplied %s without scrolling fallback roots",
      (kind) => {
        const viewport = createScroller();
        const target = createScroller();
        const viewportRef = { current: viewport };
        const targetRef: { current: HTMLElement | null } = { current: null };
        const scrollTarget =
          kind === "ref" ? targetRef : () => targetRef.current;
        const { result, rerender } = renderHook(() =>
          useScrollToBottom(viewportRef, { scrollTarget, autoScrollOnInit })
        );
        flushFrames();
        act(() => result.current.scrollToBottom("auto"));
        fireEvent.resize(window);
        flushFrames();
        expect(viewport.scrollTo).not.toHaveBeenCalled();
        expect(target.scrollTo).not.toHaveBeenCalled();
        expect(result.current.showScrollToBottom).toBe(false);

        targetRef.current = target;
        rerender();
        flushFrames();
        expect(viewport.scrollTo).not.toHaveBeenCalled();
        if (autoScrollOnInit) expect(target.scrollTo).toHaveBeenCalledOnce();
        else expect(target.scrollTo).not.toHaveBeenCalled();
        flushFrames();
        target.scrollTop = 100;
        fireEvent.scroll(target);
        expect(result.current.showScrollToBottom).toBe(true);
        expect(result.current.followNewContent).toBe(false);
      }
    );
  }
);

describe.each<ScrollBehavior>(["smooth", "auto"])(
  "%s scroll completion cleanup",
  (behavior) => {
    it.each(["explicit target", "page fallback"])(
      "restores user-controlled scrolling when the %s changes mid-scroll",
      (change) => {
        const original = createScroller();
        const replacement = createScroller();
        const viewportRef = { current: original };
        const initialProps: UseScrollToBottomOptions =
          change === "explicit target"
            ? { scrollTarget: original }
            : { pageScrollFallback: "auto" };
        const { result, rerender, unmount } = renderHook(
          (options: UseScrollToBottomOptions) =>
            useScrollToBottom(viewportRef, options),
          { initialProps }
        );
        flushFrames();
        expect(result.current.showScrollToBottom).toBe(true);
        act(() => result.current.scrollToBottom(behavior));
        expect(result.current.showScrollToBottom).toBe(false);
        expect(result.current.followNewContent).toBe(true);
        const completionFrame = nextFrame;
        if (behavior === "smooth") expect(vi.getTimerCount()).toBe(1);
        else expect(frames.has(completionFrame)).toBe(true);

        const nextOptions: UseScrollToBottomOptions =
          change === "explicit target"
            ? { scrollTarget: replacement }
            : { pageScrollFallback: "never" };
        rerender(nextOptions);
        if (behavior === "smooth") expect(vi.getTimerCount()).toBe(0);
        else expect(frames.has(completionFrame)).toBe(false);

        const target = change === "explicit target" ? replacement : original;
        target.scrollTop = 100;
        fireEvent.scroll(target);
        expect(result.current.showScrollToBottom).toBe(true);
        expect(result.current.followNewContent).toBe(false);

        vi.mocked(target.scrollTo).mockClear();
        Object.defineProperty(target, "scrollHeight", { value: 1200 });
        rerender({ ...nextOptions, contentVersion: 1 });
        flushFrames();
        act(() => vi.advanceTimersByTime(2000));
        expect(target.scrollTo).not.toHaveBeenCalled();
        expect(result.current.showScrollToBottom).toBe(true);

        act(() => result.current.scrollToBottom("auto"));
        expect(target.scrollTo).toHaveBeenCalledWith({
          top: 1200,
          behavior: "instant",
        });
        target.scrollTop = 1000;
        fireEvent.scroll(target);
        flushFrames();
        expect(result.current.showScrollToBottom).toBe(false);
        expect(result.current.followNewContent).toBe(true);
        unmount();
        expect(frames.size).toBe(0);
        expect(vi.getTimerCount()).toBe(0);
      }
    );

    it("cancels pending completion work on unmount", () => {
      const viewportRef = { current: createScroller() };
      const { result, unmount } = renderHook(() =>
        useScrollToBottom(viewportRef, { pageScrollFallback: "never" })
      );
      flushFrames();
      act(() => result.current.scrollToBottom(behavior));
      unmount();
      expect(frames.size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    });
  }
);
