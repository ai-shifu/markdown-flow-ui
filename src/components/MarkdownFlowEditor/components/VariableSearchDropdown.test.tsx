// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import VariableSearchDropdown from "./VariableSearchDropdown";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  ["ltr", 0, 8],
  ["ltr", 290, 52],
  ["rtl", 0, 8],
  ["rtl", 290, 50],
])(
  "keeps a %s dropdown at anchor %s inside the viewport",
  (direction, left, expected) => {
    let viewportWidth = 320;
    vi.spyOn(document.documentElement, "clientWidth", "get").mockImplementation(
      () => viewportWidth
    );
    const anchor = document.createElement("button");
    anchor.style.direction = String(direction);
    document.body.appendChild(anchor);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        return this === anchor
          ? new DOMRect(Number(left), 10, 20, 20)
          : new DOMRect(0, 0, Math.min(260, viewportWidth - 16), 100);
      }
    );
    try {
      const { container } = render(
        <VariableSearchDropdown
          open
          anchorElement={anchor}
          onClose={vi.fn()}
          onSelect={vi.fn()}
          variables={[]}
          systemVariables={[]}
          labels={{
            searchPlaceholder: "Search",
            systemLabel: "System",
            customLabel: "Custom",
            emptyLabel: "Empty",
          }}
        />
      );
      const panel = container.firstElementChild as HTMLElement;
      expect(panel.style.left).toBe(`${expected}px`);
      expect(panel.style.top).toBe("38px");
      viewportWidth = 200;
      fireEvent.resize(window);
      expect(panel.style.left).toBe("8px");
    } finally {
      anchor.remove();
    }
  }
);

it("uses the anchor window for repositioning, outside clicks, and cleanup", () => {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  const view = doc.defaultView!;
  const anchor = doc.createElement("button");
  const host = doc.createElement("div");
  doc.body.append(anchor, host);
  let top = 10;
  const measure = vi
    .spyOn(anchor, "getBoundingClientRect")
    .mockImplementation(() => new DOMRect(40, top, 20, 20));
  const add = vi.spyOn(view, "addEventListener");
  const remove = vi.spyOn(view, "removeEventListener");
  const onClose = vi.fn();
  const { container, unmount } = render(
    <VariableSearchDropdown
      open
      anchorElement={anchor}
      onClose={onClose}
      onSelect={vi.fn()}
      variables={[]}
      systemVariables={[]}
      labels={{
        searchPlaceholder: "Search",
        systemLabel: "System",
        customLabel: "Custom",
        emptyLabel: "Empty",
      }}
    />,
    { container: host, baseElement: doc.body }
  );
  try {
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.style.top).toBe("38px");
    top = 50;
    fireEvent.resize(view);
    expect(panel.style.top).toBe("78px");
    top = 80;
    fireEvent.scroll(anchor);
    expect(panel.style.top).toBe("108px");
    fireEvent.mouseDown(anchor);
    fireEvent.mouseDown(panel);
    fireEvent.mouseDown(window);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(doc.body);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    for (const type of ["mousedown", "scroll", "resize"]) {
      const registration = add.mock.calls.find(([name]) => name === type);
      expect(registration).toBeDefined();
      expect(remove.mock.calls).toContainEqual(registration);
    }
    measure.mockClear();
    onClose.mockClear();
    fireEvent.resize(view);
    fireEvent.scroll(anchor);
    fireEvent.mouseDown(doc.body);
    expect(measure).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  } finally {
    unmount();
    iframe.remove();
  }
});
