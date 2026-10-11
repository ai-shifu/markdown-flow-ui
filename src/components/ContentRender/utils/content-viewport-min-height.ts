/** Let full-viewport minimum-height shells fit the surrounding lesson flow. */
export const normalizeContentViewportMinHeight = (container: HTMLElement) => {
  const hasRenderedText = (element: Element) =>
    Array.from(element.childNodes).some(
      (node) => node.nodeType === 3 && Boolean(node.textContent?.trim())
    );
  if (hasRenderedText(container)) return;
  const contentChildren = (element: Element) =>
    Array.from(element.children).filter(
      (child) => !["STYLE", "SCRIPT", "LINK"].includes(child.tagName)
    );

  for (const root of contentChildren(container)) {
    let element: Element | undefined = root;
    while (element) {
      const style = (element as HTMLElement).style;
      // Normalize only a full-screen minimum, never an explicit height, pixel
      // minimum, padding, margin, or viewport-relative font size. The iframe
      // retains its stable layout viewport for vh/vmin-dependent content.
      if (/^100(?:dvh|svh|lvh|vh)$/i.test(style?.minHeight.trim() ?? "")) {
        style.setProperty(
          "min-height",
          "0px",
          style.getPropertyPriority("min-height")
        );
      }
      // Text plus an element is content, not a single-child wrapper.
      if (hasRenderedText(element)) break;
      const children = contentChildren(element);
      element = children.length === 1 ? children[0] : undefined;
    }
  }
};
