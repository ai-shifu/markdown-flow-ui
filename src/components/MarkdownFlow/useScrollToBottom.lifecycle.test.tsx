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
  vi.useRealTimers();
});

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
      behavior: "auto",
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
      behavior: "auto",
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
          behavior: "auto",
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
