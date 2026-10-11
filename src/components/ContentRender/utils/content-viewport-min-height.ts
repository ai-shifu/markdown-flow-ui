/** Let full-viewport minimum-height shells fit the surrounding lesson flow. */
export const normalizeContentViewportMinHeight = (container: HTMLElement) => {
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
      const children = contentChildren(element);
      element = children.length === 1 ? children[0] : undefined;
    }
  }
};
