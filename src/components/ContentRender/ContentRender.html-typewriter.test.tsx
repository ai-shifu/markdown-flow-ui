// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender, { type ContentRenderProps } from "./ContentRender";

const sandboxLifecycle = vi.hoisted(() => ({
  nextInstance: 0,
  mounts: [] as number[],
  unmounts: [] as number[],
}));

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: function MockIframeSandbox({ content }: { content: string }) {
    const [instance] = React.useState(() => ++sandboxLifecycle.nextInstance);
    React.useEffect(() => {
      sandboxLifecycle.mounts.push(instance);
      return () => {
        sandboxLifecycle.unmounts.push(instance);
      };
    }, [instance]);

    return (
      <div
        data-testid="iframe-sandbox"
        data-instance={instance}
        data-content={content}
      />
    );
  },
}));

const TYPEWRITER_PROPS = {
  enableTypewriter: true,
  typewriterPacing: "content-aware",
  typingSpeed: 30,
} as const satisfies Partial<ContentRenderProps>;

const getVisibleText = (container: HTMLElement) =>
  (container.querySelector(".content-render")?.textContent ?? "").replace(
    /\s/g,
    ""
  );

const getSandboxes = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>('[data-testid="iframe-sandbox"]')
  );

const advanceTime = (milliseconds: number) => {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  sandboxLifecycle.nextInstance = 0;
  sandboxLifecycle.mounts.length = 0;
  sandboxLifecycle.unmounts.length = 0;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ContentRender progressive HTML with typewriter", () => {
  it.each([true, false])(
    "isolates a style block that interrupts a code paragraph with typing %s",
    (enableTypewriter) => {
      const html = "<style data-block-style>body { color: red; }</style>";
      const { container } = render(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={`Use \`value\n${html}\n\``}
        />
      );
      expect(getSandboxes(container)).toHaveLength(1);
      expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
        html
      );
      for (let tick = 0; tick < 30; tick += 1) {
        advanceTime(30);
        expect(container.querySelector("style[data-block-style]")).toBeNull();
      }
    }
  );

  it("counts pending media as processed source without blocking prose completion", () => {
    const content = '<iframe title="unfinished';
    const onTypeFinished = vi.fn();
    const onTypewriterStateChange = vi.fn();
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        onTypeFinished={onTypeFinished}
        onTypewriterStateChange={onTypewriterStateChange}
      />
    );

    expect(container.querySelector("iframe")).toBeNull();
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
    expect(onTypewriterStateChange).toHaveBeenLastCalledWith({
      isTypewriterEnabled: true,
      isTyping: false,
      isComplete: true,
      renderedLength: content.length,
      totalLength: content.length,
    });
  });

  it.each([true, false])(
    "preserves a native video browsing context across streamed chunks (typewriter=%s)",
    (enableTypewriter) => {
      const prefix = '甲乙丙丁\n<iframe title="a >';
      const opening =
        '<iframe title="a > b" allowfullscreen="" allow="autoplay; encrypted-media" data-tag=\'video\'>';
      const { container, rerender } = render(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={prefix}
        />
      );

      expect(container.querySelector("iframe")).toBeNull();
      expect(getSandboxes(container)).toHaveLength(0);
      advanceTime(30);
      expect(getVisibleText(container)).toBe(
        enableTypewriter ? "甲乙" : "甲乙丙丁"
      );

      rerender(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={`甲乙丙丁\n${opening}`}
        />
      );
      const video = container.querySelector<HTMLIFrameElement>(
        'iframe[data-tag="video"]'
      );
      expect(video).not.toBeNull();
      expect(video?.hasAttribute("allowfullscreen")).toBe(true);
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";

      rerender(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={`甲乙丙丁\n${opening}</iframe><div>Card</div>\n戊己`}
        />
      );
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow.retainedState).toBe("playing");
      expect(getSandboxes(container)).toHaveLength(1);
      expect(getVisibleText(container)).toBe(
        enableTypewriter ? "甲乙" : "甲乙丙丁戊己"
      );

      advanceTime(30);
      advanceTime(30);
      expect(getVisibleText(container)).toBe("甲乙丙丁戊己");
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow.retainedState).toBe("playing");
    }
  );

  it("types a bare less-than sign without mounting an empty iframe", () => {
    const onTypeFinished = vi.fn();
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙 <"
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getSandboxes(container)).toHaveLength(0);
    expect(onTypeFinished).not.toHaveBeenCalled();
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="甲乙 < 2"
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getVisibleText(container)).toBe("甲乙");
    expect(getSandboxes(container)).toHaveLength(0);
    for (let tick = 0; tick < 10; tick += 1) advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙<2");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
    expect(sandboxLifecycle.mounts).toEqual([]);
  });

  it.each(["div", "script", "style"])(
    "keeps a self-closing %s root mounted through its closing slash",
    (tag) => {
      const { container, rerender } = render(
        <ContentRender {...TYPEWRITER_PROPS} content={`甲乙\n<${tag}`} />
      );
      const sandbox = getSandboxes(container)[0];
      expect(sandbox).toBeDefined();

      for (const html of [`<${tag}/`, `<${tag}/>`]) {
        rerender(
          <ContentRender {...TYPEWRITER_PROPS} content={`甲乙\n${html}`} />
        );
        expect(getSandboxes(container)).toEqual([sandbox]);
        expect(sandbox.getAttribute("data-content")).toBe(html);
        expect(getVisibleText(container)).toBe("");
      }
      advanceTime(30);
      expect(getVisibleText(container)).toBe("甲乙");
      expect(sandboxLifecycle.unmounts).toEqual([]);
    }
  );

  it("passes unfinished HTML to the sandbox before the preceding text is typed", () => {
    const html = '<div class="card"><p>Already received';
    const onTypeFinished = vi.fn();
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`甲乙丙丁\n${html}`}
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getVisibleText(container)).toBe("");
    expect(getSandboxes(container)).toHaveLength(1);
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(html);
    expect(onTypeFinished).not.toHaveBeenCalled();
  });

  it("updates received HTML without advancing or restarting the text timer", () => {
    const initialHtml = '<div class="card"><p>First';
    const appendedHtml = `${initialHtml} and second`;
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`甲乙丙丁\n${initialHtml}`}
      />
    );

    advanceTime(20);
    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`甲乙丙丁\n${appendedHtml}`}
      />
    );

    expect(getSandboxes(container)).toHaveLength(1);
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
      appendedHtml
    );
    expect(getVisibleText(container)).toBe("");

    advanceTime(10);
    expect(getVisibleText(container)).toBe("甲乙");
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
      appendedHtml
    );
  });

  it("shares one text budget across HTML while preserving text order", () => {
    const onTypeFinished = vi.fn();
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={'甲\n<div class="card">HTML</div>\n乙丙'}
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getSandboxes(container)).toHaveLength(1);
    expect(getVisibleText(container)).toBe("");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    expect(onTypeFinished).not.toHaveBeenCalled();

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
  });

  it("keeps the same sandbox instance as text appears and HTML grows", () => {
    const initialHtml = '<div class="card"><p>First';
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`甲乙丙丁\n${initialHtml}`}
      />
    );
    const sandbox = getSandboxes(container)[0];
    expect(sandbox).toBeDefined();

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    expect(getSandboxes(container)[0]).toBe(sandbox);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`甲乙丙丁\n${initialHtml} and second</p></div>\n戊己`}
      />
    );
    expect(getSandboxes(container)[0]).toBe(sandbox);
    expect(getVisibleText(container)).toBe("甲乙");

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁戊己");
    expect(getSandboxes(container)[0]).toBe(sandbox);
    expect(sandboxLifecycle.mounts).toEqual([1]);
    expect(sandboxLifecycle.unmounts).toEqual([]);
  });

  it("preserves both sandbox instances when a later HTML block finishes", () => {
    const initial = '甲\n<div id="first">One</div>\n乙\n<div id="second">Two';
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={initial} />
    );
    const sandboxes = getSandboxes(container);
    expect(sandboxes).toHaveLength(2);

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`${initial} and three</div>\n丙丁`}
      />
    );

    expect(getSandboxes(container)).toEqual(sandboxes);
    expect(sandboxes[1].getAttribute("data-content")).toContain(
      "Two and three</div>"
    );
    expect(getVisibleText(container)).toBe("甲乙");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
    expect(sandboxLifecycle.mounts).toEqual([1, 2]);
    expect(sandboxLifecycle.unmounts).toEqual([]);
  });

  it("reports completion only after all surrounding text catches up", () => {
    const onTypeFinished = vi.fn();
    const content = '甲乙\n<div class="card">HTML</div>\n丙丁';
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getSandboxes(container)).toHaveLength(1);
    expect(onTypeFinished).not.toHaveBeenCalled();
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    expect(onTypeFinished).not.toHaveBeenCalled();
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        locale="fr-FR"
        onTypeFinished={onTypeFinished}
      />
    );
    advanceTime(60);
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`${content}戊己`}
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getVisibleText(container)).toBe("甲乙丙丁");
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁戊己");
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
  });

  it("processes HTML-only snapshots immediately without waiting for closure", () => {
    const onTypeFinished = vi.fn();
    const initial = '<div class="card"><p>First';
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={initial}
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getSandboxes(container)).toHaveLength(1);
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
      initial
    );
    expect(onTypeFinished).toHaveBeenCalledTimes(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`${initial} and second`}
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
      `${initial} and second`
    );
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
    advanceTime(90);
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
  });

  it("does not leak a split HTML opening tag or replay the preceding text", () => {
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={"甲乙\n<di"} />
    );

    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    advanceTime(90);
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={'甲乙\n<div class="card"'}
      />
    );
    expect(getVisibleText(container)).toBe("甲乙");
    expect(getSandboxes(container)).toHaveLength(1);

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={'甲乙\n<div class="card"><p>Received'}
      />
    );
    expect(getVisibleText(container)).toBe("甲乙");
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(
      '<div class="card"><p>Received'
    );
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
  });

  it("keeps HTML inside a code fence on the text typewriter path", () => {
    const content = '```html\n<div class="card">Source</div>\n```';
    const onTypeFinished = vi.fn();
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        onTypeFinished={onTypeFinished}
      />
    );

    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).toBe("");
    expect(onTypeFinished).not.toHaveBeenCalled();
    advanceTime(30);
    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).not.toContain('class="card"');
    expect(onTypeFinished).not.toHaveBeenCalled();

    for (let tick = 0; tick < 40; tick += 1) {
      advanceTime(30);
    }
    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).toContain(
      '<divclass="card">Source</div>'
    );
    expect(onTypeFinished).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["escaped HTML", "\\<div>Literal\\</div>"],
    ["inline code", "`<div>Literal</div>`"],
  ])("keeps %s out of the sandbox", (_name, content) => {
    const { container } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={content} />
    );

    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).toBe("");
    advanceTime(30);
    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).not.toContain("Literal");

    for (let tick = 0; tick < 40; tick += 1) {
      advanceTime(30);
    }
    expect(getSandboxes(container)).toHaveLength(0);
    expect(getVisibleText(container)).toContain("<div>Literal</div>");
  });

  it.each([false, true])(
    "isolates HTML after an unmatched backtick with typewriter %s",
    (enableTypewriter) => {
      const html =
        "<style data-inline-style>body { color: red; }</style><div data-inline-card>Card</div>";
      const content = `Use \` carefully ${html}`;
      const onTypeFinished = vi.fn();
      const { container, rerender } = render(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={content}
          onTypeFinished={onTypeFinished}
        />
      );
      const sandbox = getSandboxes(container)[0];
      expect(sandbox).toBeDefined();
      expect(sandbox.getAttribute("data-content")).toBe(html);

      for (let tick = 0; tick < 100; tick += 1) {
        advanceTime(30);
        expect(container.querySelector("style[data-inline-style]")).toBeNull();
        expect(container.querySelector("[data-inline-card]")).toBeNull();
      }
      expect(getVisibleText(container)).toBe("Use`carefully");
      expect(onTypeFinished).toHaveBeenCalledTimes(enableTypewriter ? 1 : 0);

      rerender(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={!enableTypewriter}
          content={content}
        />
      );
      expect(getSandboxes(container)).toEqual([sandbox]);
      expect(container.querySelector("style[data-inline-style]")).toBeNull();
      expect(container.querySelector("[data-inline-card]")).toBeNull();
      expect(sandboxLifecycle.mounts).toEqual([1]);
      expect(sandboxLifecycle.unmounts).toEqual([]);
    }
  );

  it("reclassifies a received HTML snapshot when inline code closes", () => {
    const html = "<style data-flow-style>body { color: red; }</style>";
    const initial = `Use \`${html}`;
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={initial} />
    );
    expect(getSandboxes(container)).toHaveLength(1);
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(html);
    for (let tick = 0; tick < 20; tick += 1) advanceTime(30);
    expect(getVisibleText(container)).toBe("Use`");

    rerender(<ContentRender {...TYPEWRITER_PROPS} content={`${initial}\``} />);
    expect(getSandboxes(container)).toHaveLength(0);
    for (let tick = 0; tick < 100; tick += 1) {
      advanceTime(30);
      expect(container.querySelector("style[data-flow-style]")).toBeNull();
    }
    expect(container.querySelector("code")?.textContent).toBe(html);
    expect(sandboxLifecycle.mounts).toEqual([1]);
    expect(sandboxLifecycle.unmounts).toEqual([1]);
  });

  it.each([
    ["single backticks", "Use ", "`", ""],
    ["double backticks around a single backtick", "Use ", "``", "x`"],
    ["inline triple backticks at line start", "", "```", "x`"],
  ])("keeps %s safe while typing", (_name, intro, delimiter, innerPrefix) => {
    const html = "<style data-matched-style>body { color: red; }</style>";
    const { container } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`${intro}${delimiter}${innerPrefix}${html}${delimiter}`}
      />
    );

    for (let tick = 0; tick < 100; tick += 1) {
      advanceTime(30);
      expect(container.querySelector("style[data-matched-style]")).toBeNull();
      expect(getSandboxes(container)).toHaveLength(0);
    }
    expect(container.querySelector("code")?.textContent).toBe(
      innerPrefix + html
    );
  });

  it("keeps an existing HTML block mounted when a later code fence streams in", () => {
    const initial = '甲\n<div class="card">Visual</div>\n乙\n';
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={initial} />
    );
    const sandbox = getSandboxes(container)[0];
    expect(sandbox).toBeDefined();
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");

    const withOpenFence = `${initial}\n\`\`\`html\n<div>Source`;
    rerender(<ContentRender {...TYPEWRITER_PROPS} content={withOpenFence} />);
    expect(getSandboxes(container)).toEqual([sandbox]);
    expect(sandbox.getAttribute("data-content")).toContain(
      '<div class="card">Visual</div>'
    );
    expect(sandbox.getAttribute("data-content")).not.toContain("Source");
    expect(getVisibleText(container)).toBe("甲乙");

    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={`${withOpenFence}</div>\n\`\`\``}
      />
    );
    expect(getSandboxes(container)).toEqual([sandbox]);
    expect(sandbox.getAttribute("data-content")).not.toContain("Source");
    for (let tick = 0; tick < 40; tick += 1) {
      advanceTime(30);
    }
    expect(getVisibleText(container)).toContain("<div>Source</div>");
    expect(sandboxLifecycle.mounts).toEqual([1]);
    expect(sandboxLifecycle.unmounts).toEqual([]);
  });
  it("types prose immediately following a closed HTML root on the same line", () => {
    const html = "<div><div>Nested</div>card</div>";
    const { container } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={`甲${html}乙丙`} />
    );
    expect(getSandboxes(container)[0].getAttribute("data-content")).toBe(html);
    expect(getVisibleText(container)).toBe("");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙");
  });

  it("preserves the HTML instance when typed content becomes static history", () => {
    const content = "甲\n<div>Card</div>\n乙\n```js\nconst x = 1;\n```";
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={content} />
    );
    const sandbox = getSandboxes(container)[0];
    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        enableTypewriter={false}
        content={content}
      />
    );
    expect(getSandboxes(container)).toEqual([sandbox]);
    expect(getVisibleText(container)).toContain("甲乙");
    expect(getVisibleText(container)).toContain("constx=1;");
    expect(sandboxLifecycle.mounts).toEqual([1]);
    expect(sandboxLifecycle.unmounts).toEqual([]);
  });

  it("does not flush pending prose as an unfinished SVG after HTML grows", () => {
    const initial = "甲乙丙丁戊己\n<div>Card</div>\n<svg><text>Label";
    const { container, rerender } = render(
      <ContentRender {...TYPEWRITER_PROPS} content={initial} />
    );
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙");
    rerender(
      <ContentRender {...TYPEWRITER_PROPS} content={`${initial} grows`} />
    );
    expect(getVisibleText(container)).toBe("甲乙");
    advanceTime(30);
    expect(getVisibleText(container)).toBe("甲乙丙丁");
  });
  it("keeps a document declaration out of the prose queue across chunks", () => {
    const onTypeFinished = vi.fn();
    const { container, rerender } = render(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content="<!DOC"
        onTypeFinished={onTypeFinished}
      />
    );
    const sandbox = getSandboxes(container)[0];
    expect(sandbox.getAttribute("data-content")).toBe("<!DOC");
    expect(getVisibleText(container)).toBe("");
    const content = "<!DOCTYPE html>\n<html><body><p>Card";
    rerender(
      <ContentRender
        {...TYPEWRITER_PROPS}
        content={content}
        onTypeFinished={onTypeFinished}
      />
    );
    expect(getSandboxes(container)).toEqual([sandbox]);
    expect(sandbox.getAttribute("data-content")).toBe(content);
    expect(getVisibleText(container)).toBe("");
    expect(onTypeFinished).toHaveBeenCalledTimes(2);
  });
  it.each([
    [true, "\n"],
    [false, "\n"],
    [true, "\r\n"],
    [false, "\r\n"],
  ])(
    "preserves indented inline-code HTML with typing %s and newline %j",
    (enableTypewriter, newline) => {
      const html = "<style data-normalizer-style>body { color: red; }</style>";
      const content = `Use \`value${newline}    ${html}${newline}\``;
      const onTypeFinished = vi.fn();
      const { container } = render(
        <ContentRender
          {...TYPEWRITER_PROPS}
          enableTypewriter={enableTypewriter}
          content={content}
          onTypeFinished={onTypeFinished}
        />
      );

      for (let tick = 0; tick < 100; tick += 1) {
        advanceTime(30);
        expect(
          container.querySelector("style[data-normalizer-style]")
        ).toBeNull();
        expect(getSandboxes(container)).toHaveLength(0);
      }
      expect(container.querySelector("code")?.textContent).toContain(html);
      expect(onTypeFinished).toHaveBeenCalledTimes(enableTypewriter ? 1 : 0);
    }
  );
});
