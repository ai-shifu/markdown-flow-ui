// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrollToBottomButton from "./ScrollToBottomButton";
import ScrollToBottomControl from "./ScrollToBottomControl";

afterEach(cleanup);

describe("scroll-to-bottom placement", () => {
  it("composes host classes with the shared class utility", () => {
    render(
      <ScrollToBottomButton
        visible
        ariaLabel="Latest content"
        className="host-scroll w-8 w-12"
      />
    );

    const button = screen.getByRole("button", { name: "Latest content" });
    expect(button.className).toBe("scroll-to-bottom-btn host-scroll w-12");
    expect(ScrollToBottomButton.displayName).toBe("ScrollToBottomButton");
  });

  it("keeps a hidden control out of keyboard and screen-reader navigation", () => {
    const { rerender } = render(
      <ScrollToBottomButton visible={false} ariaLabel="Latest content" />
    );

    expect(screen.queryByRole("button")).toBeNull();
    const button = screen.getByRole("button", { hidden: true });
    expect(button.getAttribute("aria-label")).toBe("Latest content");
    expect(button.getAttribute("aria-hidden")).toBe("true");
    expect(button.tabIndex).toBe(-1);
    rerender(<ScrollToBottomButton visible ariaLabel="Latest content" />);
    expect(screen.getByRole("button", { name: "Latest content" })).toBe(button);
    expect(button.tabIndex).toBe(0);
  });

  it("defaults to bottom-center without changing the bottom offset", () => {
    render(<ScrollToBottomButton visible ariaLabel="Scroll to bottom" />);

    const button = screen.getByRole("button", { name: "Scroll to bottom" });
    expect(button.dataset.placement).toBe("bottom-center");
    expect(button.style.getPropertyValue("--scroll-to-bottom-bottom")).toBe(
      "20px"
    );
    expect(button.style.getPropertyValue("--scroll-to-bottom-position")).toBe(
      "absolute"
    );
  });

  it.each([false, true])(
    "releases focus and rejects activation while hidden (portal: %s)",
    (portal) => {
      const host = document.createElement("div");
      document.body.appendChild(host);
      const onClick = vi.fn();
      const props = {
        ariaLabel: "Latest content",
        portalTarget: portal ? host : undefined,
        onClick,
      };
      try {
        const { rerender, unmount } = render(
          <ScrollToBottomButton {...props} visible />
        );
        const button = screen.getByRole<HTMLButtonElement>("button", {
          name: "Latest content",
        });
        button.focus();
        expect(document.activeElement).toBe(button);
        rerender(<ScrollToBottomButton {...props} visible={false} />);
        expect(document.activeElement).not.toBe(button);
        expect(button.disabled).toBe(true);
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
        rerender(<ScrollToBottomButton {...props} visible />);
        expect(button.disabled).toBe(false);
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledOnce();
        unmount();
      } finally {
        host.remove();
      }
    }
  );

  it("preserves host disabled state and does not steal another element's focus", () => {
    const renderButtons = (visible: boolean) => (
      <>
        <input aria-label="Reply" />
        <ScrollToBottomButton
          visible={visible}
          disabled
          ariaLabel="Latest content"
          tabIndex={3}
        />
      </>
    );
    const { rerender } = render(renderButtons(true));
    const input = screen.getByRole("textbox");
    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: "Latest content",
    });
    input.focus();
    rerender(renderButtons(false));
    expect(document.activeElement).toBe(input);
    rerender(renderButtons(true));
    expect(document.activeElement).toBe(input);
    expect(button.disabled).toBe(true);
    expect(button.tabIndex).toBe(3);
  });

  it("uses the same default placement through the complete control", () => {
    render(
      <ScrollToBottomControl
        viewportRef={{ current: null }}
        ariaLabel="Scroll to bottom"
      />
    );

    const button = screen.getByRole("button", { hidden: true });
    expect(button.dataset.placement).toBe("bottom-center");
    expect(button.style.getPropertyValue("--scroll-to-bottom-bottom")).toBe(
      "20px"
    );
  });

  it("preserves explicit bottom-right placement and offsets", () => {
    render(
      <ScrollToBottomButton
        visible
        ariaLabel="Scroll to bottom"
        placement="bottom-right"
        bottomOffset={32}
        horizontalOffset={24}
      />
    );

    const button = screen.getByRole("button", { name: "Scroll to bottom" });
    expect(button.dataset.placement).toBe("bottom-right");
    expect(button.style.getPropertyValue("--scroll-to-bottom-bottom")).toBe(
      "32px"
    );
    expect(button.style.getPropertyValue("--scroll-to-bottom-horizontal")).toBe(
      "24px"
    );
  });

  it("renders into the host portal and preserves native click handling", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const onClick = vi.fn();
    try {
      const { unmount } = render(
        <ScrollToBottomButton
          visible
          ariaLabel="Latest content"
          portalTarget={host}
          onClick={onClick}
        />
      );
      const button = screen.getByRole("button", { name: "Latest content" });
      expect(button.parentElement).toBe(host);
      expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
        "true"
      );
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledOnce();
      unmount();
      expect(host.childElementCount).toBe(0);
    } finally {
      host.remove();
    }
  });
});
