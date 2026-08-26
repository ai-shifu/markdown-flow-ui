// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

afterEach(cleanup);

it.each([undefined, "إغلاق", "ปิด", "Dismiss settings"])(
  "keeps the dialog close control functional with label %s",
  (closeButtonLabel) => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent
          closeButtonLabel={closeButtonLabel}
          aria-describedby={undefined}
        >
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: closeButtonLabel ?? "Close",
      })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  }
);
