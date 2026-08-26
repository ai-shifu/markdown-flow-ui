# API Reference

## Components

### MarkdownFlow

Main component for rendering markdown with typewriter effects.

```typescript
interface MarkdownFlowProps {
  initialContentList?: ContentItem[];
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  onBlockComplete?: (blockIndex: number) => void;
}

type ContentItem = {
  content: string;
  isFinished?: boolean;
  defaultInputText?: string;
  defaultButtonText?: string;
  readonly?: boolean;
  customRenderBar?: CustomRenderBarProps;
};

type OnSendContentParams = {
  buttonText?: string;
  variableName?: string;
  inputText?: string;
};
```

**Props:**

- `initialContentList` - Array of content blocks to render
- `typingSpeed` - Typing animation speed (default: 30ms/char)
- `enableTypewriter` - Enable typewriter effect (default: false)
- `onSend` - Callback for user interactions
- `onBlockComplete` - Called when a block finishes typing
- `customRenderBar` - Custom component for additional UI

**Example:**

```tsx
<MarkdownFlow
  initialContentList={[
    {
      content: "# Welcome\n\nChoose: ?[%{{choice}} A | B | C]",
      isFinished: false,
    },
  ]}
  typingSpeed={50}
  onSend={(params) => {
    if (params.variableName === "choice") {
      console.log("Selected:", params.buttonText);
    }
  }}
/>
```

### ScrollableMarkdownFlow

Enhanced version with auto-scrolling and scroll management.

```typescript
interface ScrollableMarkdownFlowProps extends MarkdownFlowProps {
  height?: string | number;
  className?: string;
  scrollToBottomAriaLabel?: string;
}
```

**Additional Props:**

- `height` - Container height (default: "100%")
- `className` - Additional CSS classes
- `scrollToBottomAriaLabel` - Localized accessible name for the control

**Features:**

- Auto-scrolls to bottom on new content
- Shows scroll-to-bottom button when needed
- Smooth scrolling behavior

**Example:**

```tsx
<ScrollableMarkdownFlow
  height="400px"
  initialContentList={messages}
  onSend={handleUserMessage}
  className="chat-container"
/>
```

For an existing streaming layout, use the complete control instead of
reimplementing visibility and follow state:

```tsx
import { ScrollToBottomControl } from "markdown-flow-ui/scroll";

const viewportRef = useRef<HTMLDivElement>(null);
const contentRef = useRef<HTMLDivElement>(null);
const endRef = useRef<HTMLDivElement>(null);

return (
  <div style={{ height: 400, position: "relative" }}>
    <div ref={viewportRef} style={{ height: "100%", overflowY: "auto" }}>
      <div ref={contentRef}>
        {items.map(renderItem)}
        <div ref={endRef} />
      </div>
    </div>
    <ScrollToBottomControl
      viewportRef={viewportRef}
      contentRef={contentRef}
      endRef={endRef}
      pageScrollFallback={isPageDrivenLayout ? "always" : "auto"}
      ariaLabel={translatedScrollToBottomLabel}
      portalTarget={controlHost}
    />
  </div>
);
```

`ScrollToBottomControl` owns target resolution, observers, follow state,
button visibility, scrolling, icon, reduced-motion handling, accessibility,
and optional portal rendering. By default it evaluates the viewport and its
parent, then uses the document when neither local element scrolls. Use
`pageScrollFallback="always"` when both local and page scrolling can be active.
Content growth is observed automatically; `contentVersion` is only an optional
explicit refresh signal. Portal rendering does not imply fixed positioning:
use `position` and `bottomOffset` to match the supplied host's layout, including
absolute positioning inside a fixed footer host.

The button defaults to bottom-center placement, 20px above the bottom of its
positioning container, using absolute positioning. Set `placement="bottom-right"`
to opt into right alignment.

### ContentRender

Core component for rendering individual markdown blocks.

```typescript
interface ContentRenderProps {
  content: string;
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  defaultButtonText?: string;
  defaultInputText?: string;
  readonly?: boolean;
  onTypeFinished?: () => void;
}
```

**Props:**

- `content` - Markdown content to render
- `typingSpeed` - Animation speed (default: 30)
- `enableTypewriter` - Enable animation (default: false)
- `readonly` - Make interactive elements read-only
- `onTypeFinished` - Called when typing completes

**Supported Markdown:**

- Standard markdown (headers, lists, links, etc.)
- GitHub Flavored Markdown (tables, task lists)
- Math expressions with KaTeX: `$E = mc^2$`
- Mermaid diagrams
- Code syntax highlighting
- Custom interactive syntax

**Custom Syntax:**

````markdown
# Buttons

?[Click me]

# Variable inputs

?[%{{userName}} Enter name...]

# Multiple choice

?[%{{color}} Red | Blue | Green]

# Mermaid diagrams

```mermaid
graph LR
    A --> B
    B --> C
```
````

## Hooks

### useTypewriter

Manages typewriter animation effects.

```typescript
function useTypewriter(
  content: string,
  speed?: number,
  disabled?: boolean
): {
  displayText: string;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
};
```

**Example:**

```tsx
const { displayText, isComplete, start, pause } = useTypewriter(
  "Hello, World!",
  50,
  false
);

return (
  <div>
    <p>{displayText}</p>
    {!isComplete && <button onClick={pause}>Pause</button>}
  </div>
);
```

### useScrollToBottom

Auto-scroll management for containers.

```typescript
function useScrollToBottom(
  viewportRef: RefObject<HTMLElement | null>,
  options?: UseScrollToBottomOptions
): {
  showScrollToBottom: boolean;
  isAtBottom: boolean;
  followNewContent: boolean;
  scrollToBottom: (behavior?: "smooth" | "auto") => void;
  refresh: () => void;
};
```

**Example:**

```tsx
const viewportRef = useRef<HTMLDivElement>(null);
const { showScrollToBottom, scrollToBottom } = useScrollToBottom(viewportRef, {
  contentVersion: messages,
  scrollThreshold: 150,
});

return (
  <div ref={viewportRef}>
    {messages.map((msg) => (
      <div key={msg.id}>{msg.text}</div>
    ))}
    {showScrollToBottom && <button onClick={() => scrollToBottom()}>↓</button>}
  </div>
);
```

## Types

```typescript
// Content item in flow
type ContentItem = {
  content: string;
  isFinished?: boolean;
  defaultInputText?: string;
  defaultButtonText?: string;
  readonly?: boolean;
  customRenderBar?: CustomRenderBarProps;
};

// User interaction parameters
type OnSendContentParams = {
  buttonText?: string;
  variableName?: string;
  inputText?: string;
};

// Custom render bar component
type CustomRenderBarProps = React.ComponentType<{
  content?: string;
  onSend?: (content: OnSendContentParams) => void;
  displayContent: string;
}>;

// All component props are exported
import type {
  MarkdownFlowProps,
  ScrollableMarkdownFlowProps,
  ScrollToBottomControlProps,
  UseScrollToBottomOptions,
  ContentRenderProps,
} from "markdown-flow-ui";
```

## Plugins

### Built-in Plugins

**Custom Variable Plugin:**

Handles interactive buttons and inputs.

```markdown
?[Button Text] # Simple button
?[%{{variable}} Placeholder...] # Input field
?[%{{choice}} A | B | C] # Multiple choice
```

**Mermaid Plugin:**

Renders diagrams using Mermaid with built-in error handling and syntax validation.

````markdown
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
````

**Features:**

- Pre-validation of Mermaid syntax before rendering
- Friendly error messages with helpful hints
- Safe rendering with security checks
- Support for all Mermaid diagram types (flowchart, sequence, pie, gantt, etc.)
- Elegant error display with source code preview

### Creating Custom Plugins

```typescript
// Define plugin component
const CustomPlugin: React.FC<{ value: string; type?: string }> = ({
  value,
  type = 'default'
}) => {
  return (
    <div className="custom-plugin">
      <span>{type}: {value}</span>
    </div>
  );
};

// Register with ContentRender
const components = {
  'custom-element': CustomPlugin,
};
```

## Styling

The library uses Tailwind CSS and provides customization through:

**CSS Classes:**

```css
.markdown-flow {
}
.content-render {
}
.content-render-table {
}
.content-render-ol {
}
.content-render-ul {
}
.scrollable-markdown-container {
}
.scroll-to-bottom-btn {
}
```

**CSS Variables:**

```css
:root {
  --markdown-flow-primary: #2563eb;
  --markdown-flow-background: #ffffff;
  --markdown-flow-text: #1f2937;
  --markdown-flow-border: #d1d5db;
  --markdown-flow-code-bg: #f3f4f6;
}
```
