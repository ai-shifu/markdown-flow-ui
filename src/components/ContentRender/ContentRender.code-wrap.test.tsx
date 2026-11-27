// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";
import {
  CODE_WRAP_STORAGE_KEY,
  getCodeWrapPreference,
  setCodeWrapPreference,
  subscribeCodeWrapToggle,
} from "../../lib/codeWrapPreference";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));

const twoCodeBlocks = [
  "```js",
  "const first = 1;",
  "```",
  "",
  "```py",
  "second = 2",
  "```",
].join("\n");

const getWrapButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>(".wrap-button"));

const getWrappedStates = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("pre")).map((pre) =>
    pre.classList.contains("code-block-pre--wrap")
  );

// The test runtime does not always provide a working localStorage.
const installStorage = (storage: Pick<Storage, "getItem" | "setItem">) => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
};

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

describe("ContentRender code block line wrapping", () => {
  beforeEach(() => {
    installStorage(createMemoryStorage());
    act(() => setCodeWrapPreference(false));
    installStorage(createMemoryStorage());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("keeps long lines scrolling until the reader turns wrapping on", () => {
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    expect(getWrappedStates(container)).toEqual([false, false]);
    for (const button of getWrapButtons(container)) {
      expect(button.getAttribute("aria-pressed")).toBe("false");
      expect(button.getAttribute("aria-label")).toBe("Wrap lines");
    }
  });

  it("switches every code block together and remembers the choice", () => {
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    fireEvent.click(getWrapButtons(container)[1]);

    expect(getWrappedStates(container)).toEqual([true, true]);
    expect(
      getWrapButtons(container).map((button) =>
        button.getAttribute("aria-pressed")
      )
    ).toEqual(["true", "true"]);
    expect(window.localStorage.getItem(CODE_WRAP_STORAGE_KEY)).toBe("1");

    fireEvent.click(getWrapButtons(container)[0]);

    expect(getWrappedStates(container)).toEqual([false, false]);
    expect(window.localStorage.getItem(CODE_WRAP_STORAGE_KEY)).toBe("0");
  });

  it("restores the remembered choice for a later render", () => {
    window.localStorage.setItem(CODE_WRAP_STORAGE_KEY, "1");

    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    expect(getWrappedStates(container)).toEqual([true, true]);
  });

  it("follows a change made in another tab", () => {
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    act(() => {
      window.localStorage.setItem(CODE_WRAP_STORAGE_KEY, "1");
      window.dispatchEvent(
        new StorageEvent("storage", { key: CODE_WRAP_STORAGE_KEY })
      );
    });

    expect(getWrappedStates(container)).toEqual([true, true]);
  });

  it("still switches when browser storage is unavailable", () => {
    installStorage({
      getItem: () => {
        throw new Error("storage blocked");
      },
      setItem: () => {
        throw new Error("storage blocked");
      },
    });
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    fireEvent.click(getWrapButtons(container)[0]);

    expect(getWrappedStates(container)).toEqual([true, true]);
  });

  it("applies a choice that cannot be saved over a stale stored one", () => {
    const stored = createMemoryStorage();
    stored.setItem(CODE_WRAP_STORAGE_KEY, "0");
    installStorage({
      getItem: stored.getItem,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    });
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    fireEvent.click(getWrapButtons(container)[0]);
    expect(getWrappedStates(container)).toEqual([true, true]);

    fireEvent.click(getWrapButtons(container)[0]);
    expect(getWrappedStates(container)).toEqual([false, false]);

    fireEvent.click(getWrapButtons(container)[0]);
    expect(getWrappedStates(container)).toEqual([true, true]);

    // A change from another tab replaces the unsaved choice.
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: CODE_WRAP_STORAGE_KEY })
      );
    });
    expect(getWrappedStates(container)).toEqual([false, false]);
  });

  it("returns to the stored choice once saving works again", () => {
    const stored = createMemoryStorage();
    stored.setItem(CODE_WRAP_STORAGE_KEY, "0");
    installStorage({
      getItem: stored.getItem,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    });
    const { container } = render(<ContentRender content={twoCodeBlocks} />);
    fireEvent.click(getWrapButtons(container)[0]);
    expect(getWrappedStates(container)).toEqual([true, true]);

    installStorage(stored);
    fireEvent.click(getWrapButtons(container)[0]);

    expect(getWrappedStates(container)).toEqual([false, false]);
    expect(stored.getItem(CODE_WRAP_STORAGE_KEY)).toBe("0");
    fireEvent.click(getWrapButtons(container)[0]);
    expect(stored.getItem(CODE_WRAP_STORAGE_KEY)).toBe("1");
  });

  it("keeps the authored class on the code block", () => {
    const { container } = render(<ContentRender content={twoCodeBlocks} />);
    const before = container.querySelector("pre")!.getAttribute("class");

    fireEvent.click(getWrapButtons(container)[0]);

    expect(container.querySelector("pre")!.getAttribute("class")).toBe(
      [before, "code-block-pre--wrap"].filter(Boolean).join(" ")
    );
  });

  it("reports reader toggles only, and survives a failing observer", () => {
    const observer = vi.fn();
    const failingObserver = vi.fn(() => {
      throw new Error("observer failed");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const unsubscribeFailing = subscribeCodeWrapToggle(failingObserver);
    const unsubscribe = subscribeCodeWrapToggle(observer);
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    act(() => setCodeWrapPreference(true));
    expect(observer).not.toHaveBeenCalled();

    fireEvent.click(getWrapButtons(container)[0]);
    expect(failingObserver).toHaveBeenCalledWith(false);
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(false);
    expect(getCodeWrapPreference()).toBe(false);

    unsubscribe();
    unsubscribeFailing();
    fireEvent.click(getWrapButtons(container)[0]);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it("names the toggle in the renderer locale", () => {
    const { container } = render(
      <ContentRender content={twoCodeBlocks} locale="zh-CN" />
    );

    expect(getWrapButtons(container)[0].getAttribute("aria-label")).toBe(
      "自动换行"
    );
  });

  it("copies the same source text whether or not lines are wrapped", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { container } = render(<ContentRender content={twoCodeBlocks} />);

    fireEvent.click(getWrapButtons(container)[0]);
    await act(async () => {
      fireEvent.click(container.querySelector(".copy-button")!);
    });

    expect(writeText).toHaveBeenCalledWith("const first = 1;\n");
  });
});
