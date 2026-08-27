// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  SANDBOX_INTERACTION_MESSAGE_SOURCE,
  SANDBOX_INTERACTION_MESSAGE_TYPE,
} from "../../lib/sandboxInteraction";
import IframeSandbox from "./IframeSandbox";

vi.mock("./ContentRender", () => ({
  default: ({ content }: { content: string }) => content,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("reports markdown blackboard clicks from a passive container", () => {
  const postMessage = vi
    .spyOn(window, "postMessage")
    .mockImplementation(() => undefined);

  const { unmount } = render(
    <IframeSandbox
      type="markdown"
      mode="blackboard"
      content="Interaction target"
      hideFullScreen
    />
  );

  const interactionTarget = screen.getByText("Interaction target");
  fireEvent.click(interactionTarget);

  expect(postMessage).toHaveBeenCalledWith(
    {
      source: SANDBOX_INTERACTION_MESSAGE_SOURCE,
      type: SANDBOX_INTERACTION_MESSAGE_TYPE,
      eventType: "click",
    },
    window.location.origin
  );

  postMessage.mockClear();
  unmount();
  fireEvent.click(interactionTarget);
  expect(postMessage).not.toHaveBeenCalled();
});
