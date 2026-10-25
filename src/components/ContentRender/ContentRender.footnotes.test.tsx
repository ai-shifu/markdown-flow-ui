// @vitest-environment jsdom
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));

afterEach(cleanup);

it.each([false, true])(
  "localizes footnotes and repeated back references (sandbox: %s)",
  (sandbox) => {
    const markdown =
      "First[^note], repeated[^note], second[^other].\n\n[^note]: First note\n[^other]: Other note";
    const content = sandbox
      ? `<html><body>Preview</body></html>\n\n${markdown}`
      : markdown;
    const { container, rerender } = render(
      <ContentRender content={content} locale="zh-CN" />
    );
    for (const [locale, heading, backLabel] of [
      ["zh-CN", "脚注", "返回正文引用"],
      ["ar-SA", "الحواشي", "العودة إلى موضع الإحالة"],
      ["th-TH", "เชิงอรรถ", "กลับไปยังจุดอ้างอิง"],
      ["fr-FR", "Notes de bas de page", "Retour à la référence"],
      [undefined, "Footnotes", "Back to reference"],
    ] as const) {
      rerender(<ContentRender content={content} locale={locale} />);
      expect(container.querySelector(".footnotes h2")?.textContent).toBe(
        heading
      );
      const backrefs = container.querySelectorAll("[data-footnote-backref]");
      expect(
        Array.from(backrefs, (link) => link.getAttribute("aria-label"))
      ).toEqual(
        ["1", "1-2", "2"].map((reference) => `${backLabel} ${reference}`)
      );
      for (const link of backrefs) {
        const target = link.getAttribute("href")!.slice(1);
        expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
      }
      expect(container.querySelector(".footnotes")?.textContent).toContain(
        "First note"
      );
    }
  }
);
