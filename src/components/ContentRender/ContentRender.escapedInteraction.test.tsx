// @vitest-environment jsdom
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));

afterEach(cleanup);

const buttonTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("button"), (button) =>
    button.textContent?.trim()
  ).filter(Boolean);

// A multi-select offers its options as checkboxes, each labelled with the option's text.
const checkboxLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("label"), (label) =>
    label.textContent?.trim()
  ).filter((text) => text);

// A 2.0 lesson asked this with options the model wrote, URLs included. The backend escaped the
// slashes as the grammar says; the learner was shown the whole thing as raw text, because GFM had
// cut the URLs into links before the interaction plugin ever looked.
it("renders a question whose options carry escaped URLs as checkboxes", () => {
  // The question exactly as the backend sent it on sim. The last option's `www.` is what GFM
  // rewrites after the parse; with remark-flow 1.3.3 that alone still left the question as text.
  const { container } = render(
    <ContentRender
      content={String.raw`?[%{{读过的文档站}} Spring 官方文档 https:\/\/docs.spring.io\/spring-framework\/reference\/index.html || Node.js 官方文档 https:\/\/nodejs.org\/docs\/latest\/api\/ || Redis 官方文档 https:\/\/redis.io\/docs\/latest\/ || PostgreSQL 官方文档 https:\/\/www.postgresql.org\/docs\/current\/]`}
      userInput="后端方向，那下面这几个文档站你应该都用得上。勾一下你**读过**的："
    />
  );
  expect(container.textContent).not.toContain("?[");
  expect(checkboxLabels(container)).toEqual([
    "Spring 官方文档 https://docs.spring.io/spring-framework/reference/index.html",
    "Node.js 官方文档 https://nodejs.org/docs/latest/api/",
    "Redis 官方文档 https://redis.io/docs/latest/",
    "PostgreSQL 官方文档 https://www.postgresql.org/docs/current/",
  ]);
  expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(4);
});

it("keeps an escaped bar inside its option", () => {
  const { container } = render(
    <ContentRender content={String.raw`?[%{{x}} a\|b | c]`} />
  );
  expect(buttonTexts(container)).toEqual(expect.arrayContaining(["a|b", "c"]));
  expect(buttonTexts(container)).not.toContain("a");
});
