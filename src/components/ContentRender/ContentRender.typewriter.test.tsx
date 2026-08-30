// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender, { type ContentRenderProps } from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));

const TYPEWRITER_PROPS = {
  enableTypewriter: true,
  typewriterPacing: "content-aware",
  typingSpeed: 30,
} as const satisfies Partial<ContentRenderProps>;

const getVisibleText = (container: HTMLElement) =>
  container.querySelector(".content-render")?.textContent ?? "";

const advanceTime = (milliseconds: number) => {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ContentRender content-aware typewriter", () => {
  it("does not duplicate output or completion in React StrictMode", () => {
    const onTypeFinished = vi.fn();
    const { container } = render(
      <React.StrictMode>
        <ContentRender
          {...TYPEWRITER_PROPS}
          content="中文测试"
          onTypeFinished={onTypeFinished}
        />
      </React.StrictMode>
    );

    advanceTime(30);
    advanceTime(30);
    expect(getVisibleText(container)).toBe("中文测试");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
  });

  it("reveals complete content supplied in one render using the weighted budget", () => {
    const onTypeFinished = vi.fn();
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="abcdefghijklmno"
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getVisibleText(container)).toBe("");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcdefg");
    expect(onTypeFinished).not.toHaveBeenCalled();

    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcdefghijklmn");
    expect(onTypeFinished).not.toHaveBeenCalled();

    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcdefghijklmno");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
  });

  it("keeps the active tick deadline across frequent streaming appends", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" />
    );

    advanceTime(20);
    rerender(<ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁戊己" />);
    advanceTime(5);
    rerender(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁戊己庚辛" />
    );

    expect(getVisibleText(container)).toBe("");
    advanceTime(5);
    expect(getVisibleText(container)).toBe("甲乙");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
  });

  it("starts a new tick when more content arrives after completion", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" />);
    expect(getVisibleText(container)).toBe("甲乙");

    advanceTime(29);
    expect(getVisibleText(container)).toBe("甲乙");
    advanceTime(1);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
  });

  it.each([
    ["a combining accent", "e", "e\u0301"],
    ["an emoji modifier", "👍", "👍🏽"],
  ])(
    "immediately repairs %s appended after completion",
    (_name, initial, completed) => {
      const onTypeFinished = vi.fn();
      const { container, rerender } = render(
        <ContentRender
          {...TYPEWRITER_PROPS}
          content={initial}
          onTypeFinished={onTypeFinished}
        />
      );

      advanceTime(30);
      expect(getVisibleText(container)).toBe(initial);
      expect(onTypeFinished).toHaveBeenCalledTimes(1);

      rerender(
        <ContentRender
          {...TYPEWRITER_PROPS}
          content={completed}
          onTypeFinished={onTypeFinished}
        />
      );

      expect(getVisibleText(container)).toBe(completed);
      expect(onTypeFinished).toHaveBeenCalledTimes(2);

      advanceTime(60);
      expect(getVisibleText(container)).toBe(completed);
      expect(onTypeFinished).toHaveBeenCalledTimes(2);
    }
  );

  it("repairs a consumed emoji tail without advancing the next normal tick", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="👍" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("👍");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="👍🏽甲乙" />);
    expect(getVisibleText(container)).toBe("👍🏽");

    advanceTime(29);
    expect(getVisibleText(container)).toBe("👍🏽");
    advanceTime(1);
    expect(getVisibleText(container)).toBe("👍🏽甲乙");
  });

  it("reseeds the displayed tail after a non-prefix rewrite", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="👍" />);
    expect(getVisibleText(container)).toBe("👍");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="👍🏽" />);
    expect(getVisibleText(container)).toBe("👍🏽");
  });

  it("keeps the displayed tail when pending content is rebuilt then removed", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="中e中" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("中e");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="中e文" />);
    rerender(<ContentRender {...TYPEWRITER_PROPS} content="中e" />);
    rerender(<ContentRender {...TYPEWRITER_PROPS} content={"中e\u0301"} />);

    expect(getVisibleText(container)).toBe("中e\u0301");
  });

  it("seeds the displayed tail when switching from fixed pacing", () => {
    const fixedProps = {
      enableTypewriter: true,
      typingSpeed: 30,
    } as const;
    const { container, rerender } = render(
      <ContentRender {...fixedProps} content="👍" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("👍");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="👍" />);
    rerender(<ContentRender {...TYPEWRITER_PROPS} content="👍🏽" />);

    expect(getVisibleText(container)).toBe("👍🏽");
  });

  it("immediately repairs a split grapheme when switching from fixed pacing", () => {
    const fixedProps = {
      enableTypewriter: true,
      typingSpeed: 30,
    } as const;
    const onTypeFinished = vi.fn();
    const content = "👨‍👩‍👧‍👦";
    const { container, rerender } = render(
      <ContentRender
        {...fixedProps}
        content={content}
        onTypeFinished={onTypeFinished}
      />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("👨‍");
    expect(onTypeFinished).not.toHaveBeenCalled();

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getVisibleText(container)).toBe(content);
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    const extendedContent = `${content}\u200d👶甲乙`;
    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={extendedContent}
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getVisibleText(container)).toBe(`${content}\u200d👶`);
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    advanceTime(29);
    expect(getVisibleText(container)).toBe(`${content}\u200d👶`);
    advanceTime(1);
    expect(getVisibleText(container)).toBe(extendedContent);
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
  });

  it("resets fractional budget before content appended after completion", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="a" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("a");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="abcdefghi" />);
    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcdefgh");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcdefghi");
  });

  it("rebuilds pending content when only the undisplayed suffix is rewritten", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="甲乙戊己" />);
    expect(getVisibleText(container)).toBe("甲乙");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙戊己");
  });

  it("falls back to the full replacement immediately when displayed text is rewritten", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content="甲新内容" />);
    expect(getVisibleText(container)).toBe("甲新内容");

    advanceTime(60);
    expect(getVisibleText(container)).toBe("甲新内容");
  });

  it("does not restart the active tick when the locale changes", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" locale="zh-CN" />
    );

    advanceTime(20);
    rerender(
      <ContentRender {...TYPEWRITER_PROPS} content="甲乙丙丁" locale="ar-SA" />
    );

    expect(
      container.querySelector(".content-render")?.getAttribute("dir")
    ).toBe("rtl");
    advanceTime(10);
    expect(getVisibleText(container)).toBe("甲乙");
  });

  it("reports each completed source once and reports again after an append catches up", () => {
    const onTypeFinished = vi.fn();
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙"
        onTypeFinished={onTypeFinished}
      />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙"
        locale="fr-FR"
        onTypeFinished={onTypeFinished}
      />
    );
    advanceTime(90);
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙丙丁"
        locale="fr-FR"
        onTypeFinished={onTypeFinished}
      />
    );
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
    expect(onTypeFinished).toHaveBeenCalledTimes(2);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙丙丁"
        locale="th-TH"
        onTypeFinished={onTypeFinished}
      />
    );
    advanceTime(90);
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
  });

  it("keeps Chinese pacing at two graphemes per tick", () => {
    const { container } = render(
      <ContentRender {...TYPEWRITER_PROPS} content="中文测试" />
    );

    expect(getVisibleText(container)).toBe("");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("中文");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("中文测试");
  });

  it("keeps fixed pacing as the backward-compatible default", () => {
    const { container } = render(
      <ContentRender enableTypewriter typingSpeed={30} content="abcdef" />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("ab");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("abcd");
  });

  it("keeps the legacy fixed timer restart on a streaming append", () => {
    const { container, rerender } = render(
      <ContentRender enableTypewriter typingSpeed={30} content="abcd" />
    );

    advanceTime(20);
    rerender(
      <ContentRender enableTypewriter typingSpeed={30} content="abcdef" />
    );
    advanceTime(10);
    expect(getVisibleText(container)).toBe("");

    advanceTime(20);
    expect(getVisibleText(container)).toBe("ab");
  });

  it.each([
    {
      name: "typewriter is disabled",
      props: { enableTypewriter: false },
    },
    {
      name: "content type is not text",
      props: { contentType: "image" },
    },
  ] as const)("renders immediately when $name", ({ props }) => {
    const { container } = render(
      <ContentRender {...TYPEWRITER_PROPS} {...props} content="立即显示" />
    );

    expect(getVisibleText(container)).toBe("立即显示");
    advanceTime(90);
    expect(getVisibleText(container)).toBe("立即显示");
  });
});
