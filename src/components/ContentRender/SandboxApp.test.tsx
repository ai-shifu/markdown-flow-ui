// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SandboxApp from "./SandboxApp";
import { getContentRenderLocaleTexts } from "./contentRenderI18n";

afterEach(cleanup);

it("shows streamed HTML before its script is complete and defers executing the script", () => {
  const styledHtml =
    '<button type="button">Read the lesson</button><style data-sandbox-test>button { color: red; }</style>';
  const partialScript = "<script data-sandbox-test>void 0;";
  const loadingText = "Waiting for content";
  const { rerender } = render(<SandboxApp html="" loadingText={loadingText} />);

  try {
    expect(screen.getByRole("status").textContent).toContain(loadingText);

    rerender(<SandboxApp html={styledHtml} loadingText={loadingText} />);
    expect(
      screen.getByRole("button", { name: "Read the lesson" })
    ).toBeTruthy();
    expect(
      document.head.querySelector("style[data-sandbox-test]")
    ).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();

    rerender(
      <SandboxApp html={styledHtml + partialScript} loadingText={loadingText} />
    );
    expect(
      screen.getByRole("button", { name: "Read the lesson" })
    ).toBeTruthy();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(document.body.querySelector("script[data-sandbox-test]")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();

    rerender(
      <SandboxApp
        html={`${styledHtml}${partialScript}</script><p>More content</p>`}
        loadingText={loadingText}
      />
    );
    expect(screen.getByText("More content")).toBeTruthy();
    expect(
      document.body.querySelector("script[data-sandbox-test]")
    ).not.toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  } finally {
    rerender(<SandboxApp html="" loadingText={loadingText} />);
  }
});

it("blocks immediately and shows one delayed message across streamed frames", () => {
  vi.useFakeTimers();
  try {
    const html = '<div><button type="button">Check answer</button></div>';
    const { container, rerender } = render(
      <SandboxApp html={html} streaming locale="zh-CN" />
    );
    const getOverlay = () =>
      container.querySelector("[data-sandbox-loading-overlay]");
    const overlay = getOverlay();
    expect(overlay).not.toBeNull();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();

    act(() => vi.advanceTimersByTime(250));
    rerender(
      <SandboxApp html={`${html}<p>More</p>`} streaming locale="zh-CN" />
    );
    act(() => vi.advanceTimersByTime(150));
    const hint = screen.getByRole("status");
    expect(hint.textContent).toBe("正在准备内容…");
    expect(getOverlay()).toBe(overlay);

    const finalHtml = `${html}<p>More content</p>`;
    rerender(<SandboxApp html={finalHtml} streaming locale="zh-CN" />);
    expect(screen.getByRole("status")).toBe(hint);
    expect(screen.getByText("More content")).toBeTruthy();

    rerender(<SandboxApp html={finalHtml} locale="zh-CN" />);
    expect(getOverlay()).toBeNull();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false);
  } finally {
    cleanup();
    vi.useRealTimers();
  }
});

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
  rerender(<SandboxApp html="" locale="ur-PK" />);
  expect(wrapper.getAttribute("dir")).toBe("rtl");
  expect(wrapper.getAttribute("lang")).toBe("ur-PK");
  expect(screen.getByRole("status").textContent).toContain(
    getContentRenderLocaleTexts("ur-PK").sandboxLoadingText
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
