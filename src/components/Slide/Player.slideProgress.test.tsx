// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./MobilePlayerSettingsSheet", () => ({
  default: () => null,
}));

import Player from "./Player";

const mockScrollTo = vi.fn();
const originalScrollTo = HTMLElement.prototype.scrollTo;

beforeEach(() => {
  mockScrollTo.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: mockScrollTo,
  });
  vi.spyOn(window.HTMLMediaElement.prototype, "load").mockImplementation(
    () => {}
  );
  vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(
    () => {}
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalScrollTo) {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: originalScrollTo,
    });
  } else {
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollTo;
  }
});

describe("slide player progress", () => {
  it("renders generated steps as an interactive slide timeline", () => {
    const onNavigate = vi.fn();
    render(
      <Player
        defaultPlaying={false}
        slideProgress={{
          ariaLabel: "Lesson slide progress",
          currentIndex: 1,
          generatingLabel: "Generating",
          isGenerating: true,
          onNavigate,
          totalSteps: 4,
        }}
      />
    );

    const progress = screen.getByRole("navigation", {
      name: "Lesson slide progress",
    });
    expect(
      Array.from(
        progress.querySelectorAll(".slide-player__slide-progress-segment")
      ).map((segment) => segment.getAttribute("data-state"))
    ).toEqual(["completed", "current", "upcoming", "upcoming"]);
    expect(
      screen
        .getByRole("button", { name: "Lesson slide progress 2" })
        .getAttribute("aria-current")
    ).toBe("step");

    fireEvent.click(
      screen.getByRole("button", { name: "Lesson slide progress 4" })
    );
    expect(onNavigate).toHaveBeenCalledWith(3, {
      shouldContinuePlayback: false,
    });
    expect(screen.getByText("Generating")).not.toBeNull();
    expect(mockScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" })
    );
  });

  it("does not render a progress indicator for a single generated step", () => {
    render(
      <Player
        slideProgress={{
          ariaLabel: "Lesson slide progress",
          currentIndex: 0,
          isGenerating: false,
          totalSteps: 1,
        }}
      />
    );

    expect(
      screen.queryByRole("navigation", { name: "Lesson slide progress" })
    ).toBeNull();
  });
});
