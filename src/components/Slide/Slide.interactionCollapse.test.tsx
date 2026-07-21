// @vitest-environment jsdom

import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import Slide from "./Slide";
import type { Element } from "./types";

vi.mock("./SubtitleOverlay", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");

  return {
    default: ({ extraBottomOffset = 0 }: { extraBottomOffset?: number }) =>
      ReactModule.createElement("div", {
        className: "slide-subtitle-overlay",
        style: {
          "--slide-subtitle-extra-offset": `${Math.max(extraBottomOffset, 0)}px`,
        } as React.CSSProperties,
      }),
  };
});

class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
}

const createInteraction = (
  sequenceNumber: number,
  content: string,
  overrides: Partial<Element> = {}
): Element => ({
  sequence_number: sequenceNumber,
  type: "interaction",
  content,
  is_marker: true,
  is_renderable: true,
  is_speakable: false,
  ...overrides,
});

const baseInteraction = createInteraction(1, "请选择：?[%{{ choice }}A|B]");

const advanceTimers = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const openInitialInteraction = async () => {
  await advanceTimers(300);
};

const collapseInteraction = async () => {
  fireEvent.click(screen.getByRole("button", { name: "收起交互" }));
  await advanceTimers(160);
};

const renderInteractionSlide = (
  props: Partial<React.ComponentProps<typeof Slide>> = {}
) => {
  const onSend = vi.fn();
  const result = render(
    <Slide
      elementList={[baseInteraction]}
      interactionCollapsible
      locale="zh-CN"
      onSend={onSend}
      playerControlsVisibility="visible"
      playerEnabled
      {...props}
    />
  );

  return { ...result, onSend };
};

describe("Slide collapsible interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    HTMLMediaElement.prototype.load = vi.fn();
    HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders unanswered interactions expanded by default", async () => {
    renderInteractionSlide();

    await openInitialInteraction();

    expect(screen.getByText("提交下面的内容以继续")).toBeTruthy();
    expect(screen.getByRole("button", { name: "收起交互" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "交互" }).getAttribute("aria-expanded")
    ).toBe("true");
  });

  it("collapses and expands the interaction without submitting", async () => {
    const { container, onSend } = renderInteractionSlide();

    await openInitialInteraction();
    fireEvent.click(screen.getByRole("button", { name: "收起交互" }));

    expect(
      container.querySelector(".slide-interaction-overlay--collapsing")
    ).toBeTruthy();
    expect(onSend).not.toHaveBeenCalled();

    await advanceTimers(160);

    expect(screen.queryByText("提交下面的内容以继续")).toBeNull();
    expect(container.querySelector(".slide-interaction-overlay")).toBeNull();
    expect(
      screen.getByRole("button", { name: "交互" }).getAttribute("aria-expanded")
    ).toBe("false");
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "交互" }));

    expect(screen.getByText("提交下面的内容以继续")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "交互" }).getAttribute("aria-expanded")
    ).toBe("true");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("resets subtitle offset when the interaction is collapsed", async () => {
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        return {
          bottom: 120,
          height: this.classList.contains("slide-interaction-overlay")
            ? 120
            : 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      });
    const interactionWithSubtitle = createInteraction(
      1,
      "请选择：?[%{{ choice }}A|B]",
      {
        audio_url: "https://example.com/audio.mp3",
        is_speakable: true,
        subtitle_cues: [
          {
            end_ms: 10_000,
            segment_index: 0,
            start_ms: 0,
            text: "字幕文本",
          },
        ],
      }
    );

    const { container } = renderInteractionSlide({
      elementList: [interactionWithSubtitle],
    });

    await openInitialInteraction();

    const subtitleOverlay = container.querySelector<HTMLElement>(
      ".slide-subtitle-overlay"
    );
    expect(
      subtitleOverlay?.style.getPropertyValue("--slide-subtitle-extra-offset")
    ).toBe("136px");

    await collapseInteraction();

    expect(
      subtitleOverlay?.style.getPropertyValue("--slide-subtitle-extra-offset")
    ).toBe("0px");
    getBoundingClientRectSpy.mockRestore();
  });

  it("expands the next interaction after navigating away from a collapsed one", async () => {
    const secondInteraction = createInteraction(
      2,
      "第二题：?[%{{ second }}C|D]"
    );
    renderInteractionSlide({
      elementList: [baseInteraction, secondInteraction],
    });

    await openInitialInteraction();
    await collapseInteraction();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    await openInitialInteraction();

    expect(screen.getByText("提交下面的内容以继续")).toBeTruthy();
    expect(screen.getByText(/第二题/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "交互" }).getAttribute("aria-expanded")
    ).toBe("true");
  });

  it("ignores a stale collapse timer after switching interactions mid-animation", async () => {
    const secondInteraction = createInteraction(
      2,
      "第二题：?[%{{ second }}C|D]"
    );
    const { container } = renderInteractionSlide({
      elementList: [baseInteraction, secondInteraction],
    });

    await openInitialInteraction();
    fireEvent.click(screen.getByRole("button", { name: "收起交互" }));

    expect(
      container.querySelector(".slide-interaction-overlay--collapsing")
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    await advanceTimers(160);
    await openInitialInteraction();

    expect(screen.getByText("提交下面的内容以继续")).toBeTruthy();
    expect(screen.getByText(/第二题/)).toBeTruthy();
    expect(container.querySelector(".slide-interaction-overlay")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "交互" }).getAttribute("aria-expanded")
    ).toBe("true");
  });

  it("does not show a collapse button for readonly or answered interactions", async () => {
    const readonlyInteraction = createInteraction(
      1,
      "只读题：?[%{{ readonly }}A|B]",
      {
        readonly: true,
      }
    );
    const { rerender } = renderInteractionSlide({
      elementList: [readonlyInteraction],
    });

    await openInitialInteraction();

    expect(screen.queryByRole("button", { name: "收起交互" })).toBeNull();

    const answeredInteraction = createInteraction(
      1,
      "已答题：?[%{{ answered }}A|B]",
      {
        user_input: "A",
      }
    );
    rerender(
      <Slide
        elementList={[answeredInteraction]}
        interactionCollapsible
        locale="zh-CN"
        playerControlsVisibility="visible"
        playerEnabled
      />
    );
    await openInitialInteraction();

    expect(screen.queryByRole("button", { name: "收起交互" })).toBeNull();
  });

  it("expands if collapsible mode is disabled while collapsed", async () => {
    const { rerender } = renderInteractionSlide();

    await openInitialInteraction();
    await collapseInteraction();

    rerender(
      <Slide
        elementList={[baseInteraction]}
        interactionCollapsible={false}
        locale="zh-CN"
        playerControlsVisibility="visible"
        playerEnabled
      />
    );

    expect(screen.getByText("提交下面的内容以继续")).toBeTruthy();
  });

  it("cleans up pending collapse timers on unmount", async () => {
    const { unmount } = renderInteractionSlide();

    await openInitialInteraction();
    fireEvent.click(screen.getByRole("button", { name: "收起交互" }));

    expect(() => {
      unmount();
    }).not.toThrow();

    await advanceTimers(160);
  });
});
