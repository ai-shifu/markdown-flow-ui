// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import SandboxApp from "./SandboxApp";
import { getContentRenderLocaleTexts } from "./contentRenderI18n";

afterEach(cleanup);

it("honors direction overrides while keeping authored direction intact", () => {
  const { container, rerender } = render(
    <SandboxApp
      html={'<p dir="rtl">Authored direction</p>'}
      locale="ar-SA"
      dir="ltr"
    />
  );
  expect(container.querySelector(".sandbox-wrapper")?.getAttribute("dir")).toBe(
    "ltr"
  );
  expect(screen.getByText("Authored direction").getAttribute("dir")).toBe(
    "rtl"
  );
  rerender(<SandboxApp html="" locale="th-TH" dir="rtl" />);
  expect(container.querySelector(".sandbox-wrapper")?.getAttribute("dir")).toBe(
    "rtl"
  );
  expect(screen.getByRole("status").textContent).toContain(
    getContentRenderLocaleTexts("th-TH").sandboxLoadingText
  );
});

it("updates sandbox loading direction without overriding authored content direction", () => {
  const { container, rerender } = render(<SandboxApp html="" locale="ar-SA" />);
  const wrapper = container.querySelector(".sandbox-wrapper")!;
  expect(wrapper.getAttribute("dir")).toBe("rtl");
  expect(screen.getByRole("status").textContent).toContain(
    getContentRenderLocaleTexts("ar-SA").sandboxLoadingText
  );
  rerender(<SandboxApp html="" locale="th-TH" />);
  expect(wrapper.getAttribute("dir")).toBe("ltr");
  expect(screen.getByRole("status").textContent).toContain(
    getContentRenderLocaleTexts("th-TH").sandboxLoadingText
  );
  rerender(<SandboxApp html={'<p dir="ltr">Code: 123</p>'} locale="ar-SA" />);
  expect(wrapper.getAttribute("dir")).toBe("rtl");
  expect(screen.getByText("Code: 123").getAttribute("dir")).toBe("ltr");
  rerender(<SandboxApp html="" />);
  expect(wrapper.hasAttribute("dir")).toBe(false);
});
