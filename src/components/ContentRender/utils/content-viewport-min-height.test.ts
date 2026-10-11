// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { normalizeContentViewportMinHeight } from "./content-viewport-min-height";

describe("content viewport minimum height", () => {
  it.each(["vh", "dvh", "svh", "lvh"])(
    "fits a full %s minimum while retaining typography and spacing",
    (unit) => {
      const container = document.createElement("div");
      container.innerHTML = `<div style="min-height:100${unit}!important;padding:1em;font-size:3vh;margin:20px"><div>Cards</div></div>`;
      normalizeContentViewportMinHeight(container);
      const shell = container.firstElementChild as HTMLElement;
      expect(shell.style.minHeight).toBe("0px");
      expect(shell.style.getPropertyPriority("min-height")).toBe("important");
      expect(shell.style.padding).toBe("1em");
      expect(shell.style.margin).toBe("20px");
      expect(shell.style.fontSize).toBe("3vh");
      const first = container.innerHTML;
      normalizeContentViewportMinHeight(container);
      expect(container.innerHTML).toBe(first);
    }
  );

  it("normalizes nested single-root shells without changing branching content", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<div><style></style><section style="min-height:100vh"><div><aside style="min-height:100vh"></aside><aside></aside></div></section></div>';
    normalizeContentViewportMinHeight(container);
    expect(container.querySelector("section")!.style.minHeight).toBe("0px");
    expect(container.querySelector("aside")!.style.minHeight).toBe("100vh");
  });

  it.each([
    "height:100vh",
    "min-height:240px",
    "min-height:50vh",
    "min-height:calc(100vh - 20px)",
  ])("preserves authored %s", (css) => {
    const container = document.createElement("div");
    container.innerHTML = `<div style="${css}">Diagram</div>`;
    const before = container.innerHTML;
    normalizeContentViewportMinHeight(container);
    expect(container.innerHTML).toBe(before);
  });
});
