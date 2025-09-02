# Testing Guide - Markdown Flow UI

This document provides comprehensive testing strategies, patterns, and best practices for the Markdown Flow UI library.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Categories](#test-categories)
- [Testing Patterns](#testing-patterns)
- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Integration Testing](#integration-testing)
- [Visual Testing](#visual-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Test Utilities](#test-utilities)
- [CI/CD Testing](#cicd-testing)

## 🎯 Testing Philosophy

### Core Testing Principles

1. **Test Behavior, Not Implementation**: Focus on what users can do, not how the code works internally
2. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
3. **Confidence over Coverage**: 100% coverage doesn't guarantee bug-free code
4. **Fast Feedback**: Tests should run quickly to enable rapid development
5. **Maintainable Tests**: Tests should be easy to read, write, and maintain

### Testing Strategy Overview

```
       E2E Tests (5%)
      ──────────────
     Integration (15%)
    ─────────────────────
   Unit Tests (80%)
  ────────────────────────
```

- **Unit Tests**: Individual components, hooks, and utilities
- **Integration Tests**: Component interactions and data flow
- **E2E Tests**: Complete user workflows in Storybook

## 🛠 Testing Stack

### Core Testing Tools

```json
{
  "vitest": "^1.0.0",              // Fast test runner
  "@testing-library/react": "^14.0.0",  // React testing utilities
  "@testing-library/jest-dom": "^6.0.0", // DOM matchers
  "@testing-library/user-event": "^14.0.0", // User interaction simulation
  "jsdom": "^23.0.0",              // DOM environment for tests
  "msw": "^2.0.0"                  // API mocking
}
```

### Additional Testing Tools

```json
{
  "@storybook/test": "^7.0.0",     // Storybook testing utilities
  "@axe-core/react": "^4.8.0",     // Accessibility testing
  "chromatic": "^10.0.0",          // Visual regression testing
  "@testing-library/react-hooks": "^8.0.0" // Hook testing (if needed)
}
```

### Test Configuration

#### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.stories.ts',
        '**/*.test.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start MSW server
beforeAll(() => server.listen());

// Clean up DOM after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up MSW server
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```

## 📊 Test Categories

### 1. Unit Tests

Test individual components and functions in isolation.

**What to Test:**
- Component rendering
- Props handling
- Event handling
- State changes
- Edge cases
- Error conditions

**Example Structure:**
```
src/
├── components/
│   ├── MarkdownFlow/
│   │   ├── MarkdownFlow.tsx
│   │   ├── MarkdownFlow.test.tsx
│   │   └── MarkdownFlow.stories.ts
│   └── ContentRender/
│       ├── ContentRender.tsx
│       ├── ContentRender.test.tsx
│       └── ContentRender.stories.ts
└── hooks/
    ├── useTypewriter.ts
    └── useTypewriter.test.ts
```

### 2. Integration Tests

Test component interactions and data flow between components.

**What to Test:**
- Parent-child component communication
- Event bubbling and handling
- State synchronization
- Plugin integration
- Hook composition

### 3. Visual Tests

Test visual appearance and prevent regressions.

**What to Test:**
- Component appearance
- Responsive behavior
- Theme variations
- Animation states
- Accessibility visual indicators

### 4. Accessibility Tests

Ensure components are accessible to all users.

**What to Test:**
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

## 🧪 Testing Patterns

### Testing Component Props

```typescript
// MarkdownFlow.test.tsx
import { render, screen } from '@testing-library/react';
import { MarkdownFlow } from './MarkdownFlow';

describe('MarkdownFlow', () => {
  it('renders with initial content', () => {
    const content = [{ content: '# Hello World' }];

    render(<MarkdownFlow initialContentList={content} />);

    expect(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Hello World');
  });

  it('handles empty content list', () => {
    render(<MarkdownFlow initialContentList={[]} />);

    // Should not crash and render empty container
    expect(screen.getByTestId('markdown-flow')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MarkdownFlow
        initialContentList={[]}
        className="custom-flow"
      />
    );

    expect(screen.getByTestId('markdown-flow'))
      .toHaveClass('markdown-flow', 'custom-flow');
  });
});
```

### Testing User Interactions

```typescript
// ContentRender.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentRender } from './ContentRender';

describe('ContentRender - User Interactions', () => {
  it('handles button clicks', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ContentRender
        content="Click here: ?[Submit]"
        onSend={onSend}
        readonly={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    await user.click(button);

    expect(onSend).toHaveBeenCalledWith({
      buttonText: 'Submit'
    });
  });

  it('handles input field changes', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ContentRender
        content="Enter name: ?[%{{name}} Your name...]"
        onSend={onSend}
        readonly={false}
      />
    );

    const input = screen.getByPlaceholderText('Your name...');
    await user.type(input, 'John Doe');
    await user.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith({
      variableName: 'name',
      inputText: 'John Doe'
    });
  });
});
```

### Testing Async Behavior

```typescript
// useTypewriter.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
  });

  it('types text progressively', async () => {
    const { result } = renderHook(() =>
      useTypewriter('Hello World', 10, false)
    );

    expect(result.current.displayText).toBe('');
    expect(result.current.isComplete).toBe(false);

    // Advance timers to simulate typing
    act(() => {
      vi.advanceTimersByTime(50); // 5 characters
    });

    expect(result.current.displayText).toBe('Hello');

    act(() => {
      vi.advanceTimersByTime(60); // Complete remaining
    });

    expect(result.current.displayText).toBe('Hello World');
    expect(result.current.isComplete).toBe(true);
  });

  it('can be paused and resumed', () => {
    const { result } = renderHook(() =>
      useTypewriter('Hello', 10, false)
    );

    act(() => {
      result.current.pause();
      vi.advanceTimersByTime(100);
    });

    expect(result.current.displayText).toBe(''); // Still empty when paused

    act(() => {
      result.current.start();
      vi.advanceTimersByTime(50);
    });

    expect(result.current.displayText).toBe('Hello');
  });
});
```

## 🧩 Component Testing

### Testing MarkdownFlow

```typescript
// MarkdownFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownFlow } from './MarkdownFlow';

describe('MarkdownFlow', () => {
  const mockContentList = [
    {
      content: '# Welcome\n\nThis is the first block.',
      isFinished: true
    },
    {
      content: 'Choose an option: ?[%{{choice}} A | B | C]',
      isFinished: false
    }
  ];

  it('renders multiple content blocks', () => {
    render(<MarkdownFlow initialContentList={mockContentList} />);

    expect(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Welcome');
    expect(screen.getByText('This is the first block.'))
      .toBeInTheDocument();
    expect(screen.getByText('Choose an option:'))
      .toBeInTheDocument();
  });

  it('handles typewriter effects correctly', async () => {
    render(
      <MarkdownFlow
        initialContentList={[{ content: 'Hello', isFinished: false }]}
        typingSpeed={10}
        disableTyping={false}
      />
    );

    // Initially should be empty or show partial content
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('calls onBlockComplete when typing finishes', async () => {
    const onBlockComplete = vi.fn();

    render(
      <MarkdownFlow
        initialContentList={[{ content: 'Test', isFinished: false }]}
        onBlockComplete={onBlockComplete}
        typingSpeed={1}
        disableTyping={false}
      />
    );

    await waitFor(() => {
      expect(onBlockComplete).toHaveBeenCalledWith(0);
    });
  });

  it('handles user interactions from content blocks', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <MarkdownFlow
        initialContentList={[{
          content: '?[Click Me]',
          isFinished: false
        }]}
        onSend={onSend}
      />
    );

    const button = screen.getByRole('button', { name: 'Click Me' });
    await user.click(button);

    expect(onSend).toHaveBeenCalledWith({
      buttonText: 'Click Me'
    });
  });
});
```

### Testing ContentRender

```typescript
// ContentRender.test.tsx
import { render, screen } from '@testing-library/react';
import { ContentRender } from './ContentRender';

describe('ContentRender', () => {
  describe('Markdown Rendering', () => {
    it('renders basic markdown', () => {
      const markdown = `
# Heading
**Bold text**
*Italic text*
[Link](https://example.com)
      `.trim();

      render(<ContentRender content={markdown} />);

      expect(screen.getByRole('heading', { level: 1 }))
        .toHaveTextContent('Heading');
      expect(screen.getByText('Bold text'))
        .toHaveStyle('font-weight: bold');
      expect(screen.getByText('Italic text'))
        .toHaveStyle('font-style: italic');
      expect(screen.getByRole('link'))
        .toHaveAttribute('href', 'https://example.com');
    });

    it('renders code blocks with syntax highlighting', () => {
      const markdown = `
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`
      `.trim();

      render(<ContentRender content={markdown} />);

      const codeBlock = screen.getByText('function hello() {');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock.closest('code')).toHaveClass('language-javascript');
    });

    it('renders tables correctly', () => {
      const markdown = `
| Name | Age |
|------|-----|
| John | 25  |
| Jane | 30  |
      `.trim();

      render(<ContentRender content={markdown} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'John' }))
        .toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('renders custom buttons', () => {
      render(
        <ContentRender
          content="Click here: ?[Custom Button]"
          readonly={false}
        />
      );

      expect(screen.getByRole('button', { name: 'Custom Button' }))
        .toBeInTheDocument();
    });

    it('renders input fields', () => {
      render(
        <ContentRender
          content="Enter text: ?[%{{input}} Placeholder text...]"
          readonly={false}
        />
      );

      expect(screen.getByPlaceholderText('Placeholder text...'))
        .toBeInTheDocument();
    });

    it('renders multiple choice options', () => {
      render(
        <ContentRender
          content="Choose: ?[%{{choice}} Option A | Option B | Option C]"
          readonly={false}
        />
      );

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });
  });

  describe('Mermaid Diagrams', () => {
    it('renders mermaid diagrams', () => {
      const markdown = `
\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`
      `.trim();

      render(<ContentRender content={markdown} />);

      // Mermaid creates SVG elements
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Math Rendering', () => {
    it('renders inline math', () => {
      render(<ContentRender content="The equation is $E = mc^2$" />);

      // KaTeX adds specific classes for math
      expect(document.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders block math', () => {
      const markdown = `
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
      `.trim();

      render(<ContentRender content={markdown} />);

      expect(document.querySelector('.katex-display')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid markdown gracefully', () => {
      // Should not crash on malformed markdown
      expect(() => {
        render(<ContentRender content="# Heading\n[Invalid link](" />);
      }).not.toThrow();
    });

    it('handles invalid mermaid syntax', () => {
      const markdown = `
\`\`\`mermaid
invalid mermaid syntax
\`\`\`
      `.trim();

      expect(() => {
        render(<ContentRender content={markdown} />);
      }).not.toThrow();
    });
  });
});
```

### Testing ScrollableMarkdownFlow

```typescript
// ScrollableMarkdownFlow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollableMarkdownFlow } from './ScrollableMarkdownFlow';

describe('ScrollableMarkdownFlow', () => {
  const mockContent = [
    { content: '# First Block' },
    { content: '# Second Block' },
    { content: '# Third Block' }
  ];

  it('renders with scroll container', () => {
    render(
      <ScrollableMarkdownFlow
        initialContentList={mockContent}
        height="400px"
      />
    );

    const container = screen.getByTestId('scrollable-container');
    expect(container).toHaveStyle('height: 400px');
  });

  it('shows scroll-to-bottom button when not at bottom', async () => {
    render(
      <ScrollableMarkdownFlow
        initialContentList={mockContent}
        height="200px" // Small height to force scrolling
      />
    );

    // Simulate scrolling up
    const scrollContainer = screen.getByTestId('scroll-container');
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

    expect(screen.getByRole('button', { name: /scroll to bottom/i }))
      .toBeInTheDocument();
  });

  it('auto-scrolls when new content is added', () => {
    const { rerender } = render(
      <ScrollableMarkdownFlow
        initialContentList={mockContent}
        height="200px"
      />
    );

    const scrollContainer = screen.getByTestId('scroll-container');
    const originalScrollTop = scrollContainer.scrollTop;

    // Add new content
    rerender(
      <ScrollableMarkdownFlow
        initialContentList={[...mockContent, { content: '# New Block' }]}
        height="200px"
      />
    );

    // Should scroll down (scrollTop should increase)
    expect(scrollContainer.scrollTop).toBeGreaterThan(originalScrollTop);
  });
});
```

## 🎣 Hook Testing

### Testing useTypewriter

```typescript
// useTypewriter.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
  });

  it('types text character by character', () => {
    const { result } = renderHook(() =>
      useTypewriter('Hello', 100, false)
    );

    expect(result.current.displayText).toBe('');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayText).toBe('H');

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.displayText).toBe('Hello');
    expect(result.current.isComplete).toBe(true);
  });

  it('can be disabled', () => {
    const { result } = renderHook(() =>
      useTypewriter('Hello', 100, true)
    );

    expect(result.current.displayText).toBe('Hello');
    expect(result.current.isComplete).toBe(true);
  });

  it('updates when content changes', () => {
    const { result, rerender } = renderHook(
      ({ content }) => useTypewriter(content, 100, false),
      { initialProps: { content: 'Hello' } }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.displayText).toBe('Hello');

    // Change content
    rerender({ content: 'World' });

    expect(result.current.displayText).toBe('');
    expect(result.current.isComplete).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.displayText).toBe('World');
  });

  it('provides control methods', () => {
    const { result } = renderHook(() =>
      useTypewriter('Hello', 100, false)
    );

    // Start typing
    act(() => {
      result.current.start();
      vi.advanceTimersByTime(200);
    });
    expect(result.current.displayText).toBe('He');

    // Pause typing
    act(() => {
      result.current.pause();
      vi.advanceTimersByTime(300);
    });
    expect(result.current.displayText).toBe('He'); // Should not advance

    // Resume typing
    act(() => {
      result.current.start();
      vi.advanceTimersByTime(300);
    });
    expect(result.current.displayText).toBe('Hello');

    // Reset typing
    act(() => {
      result.current.reset();
    });
    expect(result.current.displayText).toBe('');
    expect(result.current.isComplete).toBe(false);
  });
});
```

### Testing useScrollToBottom

```typescript
// useScrollToBottom.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useScrollToBottom } from './useScrollToBottom';

describe('useScrollToBottom', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 400,
      scrollTo: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as any;
  });

  it('shows scroll button when not at bottom', () => {
    const { result } = renderHook(() => {
      const ref = useRef(mockElement);
      return useScrollToBottom(ref, []);
    });

    expect(result.current.showScrollToBottom).toBe(true);
  });

  it('hides scroll button when at bottom', () => {
    mockElement.scrollTop = 600; // At bottom (1000 - 400 = 600)

    const { result } = renderHook(() => {
      const ref = useRef(mockElement);
      return useScrollToBottom(ref, []);
    });

    expect(result.current.showScrollToBottom).toBe(false);
  });

  it('scrolls to bottom when requested', () => {
    const { result } = renderHook(() => {
      const ref = useRef(mockElement);
      return useScrollToBottom(ref, []);
    });

    act(() => {
      result.current.handleUserScrollToBottom();
    });

    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      top: mockElement.scrollHeight,
      behavior: 'smooth'
    });
  });

  it('auto-scrolls when dependencies change', () => {
    const { rerender } = renderHook(
      ({ deps }) => {
        const ref = useRef(mockElement);
        return useScrollToBottom(ref, deps, { autoScrollOnInit: true });
      },
      { initialProps: { deps: ['item1'] } }
    );

    // Clear previous calls
    vi.clearAllMocks();

    // Trigger dependency change
    rerender({ deps: ['item1', 'item2'] });

    // Should auto-scroll after delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockElement.scrollTo).toHaveBeenCalled();
  });
});
```

## 🔗 Integration Testing

### Testing Component Composition

```typescript
// integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollableMarkdownFlow } from '../components';

describe('Integration Tests', () => {
  it('handles complete chat flow', async () => {
    const user = userEvent.setup();
    const mockMessages: any[] = [];
    const onSend = vi.fn((params) => {
      mockMessages.push({
        content: `You selected: ${params.buttonText}`,
        isFinished: true
      });
    });

    const { rerender } = render(
      <ScrollableMarkdownFlow
        initialContentList={[
          {
            content: 'Choose your favorite color: ?[%{{color}} Red | Blue | Green]',
            isFinished: false
          }
        ]}
        onSend={onSend}
        height="400px"
      />
    );

    // User clicks a color
    const redButton = screen.getByText('Red');
    await user.click(redButton);

    expect(onSend).toHaveBeenCalledWith({
      variableName: 'color',
      buttonText: 'Red'
    });

    // Simulate adding response message
    rerender(
      <ScrollableMarkdownFlow
        initialContentList={[
          {
            content: 'Choose your favorite color: ?[%{{color}} Red | Blue | Green]',
            isFinished: true
          },
          {
            content: 'You selected: Red',
            isFinished: false
          }
        ]}
        onSend={onSend}
        height="400px"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('You selected: Red')).toBeInTheDocument();
    });
  });

  it('maintains scroll position during typing', async () => {
    const longContent = Array(50).fill('Line of content').join('\n\n');

    render(
      <ScrollableMarkdownFlow
        initialContentList={[
          { content: longContent, isFinished: false }
        ]}
        typingSpeed={1}
        disableTyping={false}
        height="300px"
      />
    );

    const scrollContainer = screen.getByTestId('scroll-container');

    // Should auto-scroll as content is typed
    await waitFor(() => {
      expect(scrollContainer.scrollTop).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});
```

## 👁 Visual Testing

### Storybook Visual Tests

```typescript
// MarkdownFlow.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';
import { MarkdownFlow } from './MarkdownFlow';

const meta: Meta<typeof MarkdownFlow> = {
  title: 'Components/MarkdownFlow',
  component: MarkdownFlow,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    initialContentList: [
      {
        content: '# Interactive Demo\n\nChoose an option: ?[%{{choice}} Option A | Option B | Option C]',
        isFinished: false
      }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that buttons are rendered
    const buttonA = await canvas.findByText('Option A');
    const buttonB = await canvas.findByText('Option B');
    const buttonC = await canvas.findByText('Option C');

    expect(buttonA).toBeInTheDocument();
    expect(buttonB).toBeInTheDocument();
    expect(buttonC).toBeInTheDocument();

    // Test button interaction
    await userEvent.click(buttonA);

    // Verify button is clickable (doesn't throw error)
    expect(buttonA).toBeInTheDocument();
  }
};

export const TypewriterEffect: Story = {
  args: {
    initialContentList: [
      {
        content: '# Typewriter Demo\n\nThis text will appear with a typewriter effect...',
        isFinished: false
      }
    ],
    typingSpeed: 50,
    disableTyping: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially should show heading immediately
    await canvas.findByRole('heading', { name: 'Typewriter Demo' });

    // Text should appear progressively
    // Note: This is a simplified test - in reality, you'd test the progressive appearance
    await expect(async () => {
      await canvas.findByText(/This text will appear/, { timeout: 3000 });
    }).not.toThrow();
  }
};

// Chromatic visual regression test
export const VisualRegression: Story = {
  args: {
    initialContentList: [
      {
        content: `
# Visual Regression Test

This story tests the visual appearance of various elements:

## Text Formatting
**Bold text** and *italic text* and ~~strikethrough~~.

## Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Table
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |

## Interactive Elements
Choose: ?[%{{choice}} Red | Blue | Green]

Click: ?[Action Button]

Input: ?[%{{name}} Enter your name...]

## Math
Inline: $E = mc^2$

Block:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$
        `,
        isFinished: true
      }
    ]
  },
  parameters: {
    chromatic: {
      delay: 1000, // Wait for fonts and images to load
      viewports: [320, 768, 1024] // Test multiple screen sizes
    }
  }
};
```

### Chromatic Configuration

```javascript
// .storybook/main.ts
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'chromatic/storybook'
  ],
  features: {
    interactionsDebugger: true,
  }
};
```

## ♿ Accessibility Testing

### Automated A11y Testing

```typescript
// accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MarkdownFlow, ContentRender } from '../components';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('MarkdownFlow has no accessibility violations', async () => {
    const { container } = render(
      <MarkdownFlow
        initialContentList={[
          { content: '# Accessible Heading\n\nThis is accessible content.' }
        ]}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Interactive elements have proper ARIA labels', async () => {
    const { container } = render(
      <ContentRender
        content="Click here: ?[Action Button]"
        readonly={false}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form elements have proper labels', async () => {
    const { container } = render(
      <ContentRender
        content="Enter name: ?[%{{name}} Your full name...]"
        readonly={false}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation Testing

```typescript
// keyboard-navigation.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentRender } from '../components';

describe('Keyboard Navigation', () => {
  it('supports keyboard navigation for buttons', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ContentRender
        content="Actions: ?[Submit] ?[Cancel]"
        onSend={onSend}
        readonly={false}
      />
    );

    const submitButton = screen.getByText('Submit');
    const cancelButton = screen.getByText('Cancel');

    // Tab navigation
    await user.tab();
    expect(submitButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    // Enter key activation
    await user.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledWith({ buttonText: 'Cancel' });
  });

  it('supports keyboard navigation for inputs', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ContentRender
        content="Name: ?[%{{name}} Enter name...] ?[Submit]"
        onSend={onSend}
        readonly={false}
      />
    );

    const input = screen.getByPlaceholderText('Enter name...');
    const button = screen.getByText('Submit');

    // Focus input and type
    await user.click(input);
    await user.type(input, 'John Doe');

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();

    // Enter on button should trigger submission
    await user.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledWith({
      variableName: 'name',
      inputText: 'John Doe'
    });
  });
});
```

## ⚡ Performance Testing

### Component Performance

```typescript
// performance.test.tsx
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { MarkdownFlow } from '../components';

describe('Performance Tests', () => {
  it('renders large content efficiently', () => {
    const largeContent = Array(1000)
      .fill(0)
      .map((_, i) => ({ content: `# Block ${i}\n\nContent for block ${i}` }));

    const startTime = performance.now();

    render(<MarkdownFlow initialContentList={largeContent} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  it('handles frequent updates without memory leaks', () => {
    const { rerender } = render(
      <MarkdownFlow initialContentList={[{ content: 'Initial' }]} />
    );

    const initialMemory = process.memoryUsage().heapUsed;

    // Simulate many updates
    for (let i = 0; i < 100; i++) {
      rerender(
        <MarkdownFlow
          initialContentList={[{ content: `Update ${i}` }]}
        />
      );
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Bundle Size Testing

```typescript
// bundle-size.test.ts
import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';

describe('Bundle Size Tests', () => {
  beforeAll(() => {
    // Build the library
    execSync('npm run build', { stdio: 'inherit' });
  });

  it('main bundle is within size limits', () => {
    const bundlePath = './dist/index.esm.js';
    const bundleStats = statSync(bundlePath);

    // Main bundle should be less than 100KB
    expect(bundleStats.size).toBeLessThan(100 * 1024);
  });

  it('gzipped bundle is within size limits', () => {
    const bundlePath = './dist/index.esm.js';
    const bundleContent = readFileSync(bundlePath);
    const gzippedSize = gzipSync(bundleContent).length;

    // Gzipped bundle should be less than 30KB
    expect(gzippedSize).toBeLessThan(30 * 1024);
  });

  it('type definitions are generated', () => {
    const typeDefsPath = './dist/index.d.ts';
    const typeDefsStats = statSync(typeDefsPath);

    expect(typeDefsStats.size).toBeGreaterThan(0);
  });
});
```

## 🛠 Test Utilities

### Custom Render Function

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div data-testid="test-wrapper">
        {children}
      </div>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
```

### Mock Factories

```typescript
// src/test/mocks.ts
export const createMockContentList = (count: number = 3) => {
  return Array(count).fill(0).map((_, i) => ({
    content: `# Mock Content ${i + 1}\n\nThis is mock content for testing.`,
    isFinished: Math.random() > 0.5,
  }));
};

export const createMockTypewriterHook = (overrides = {}) => ({
  displayText: 'Mock display text',
  isComplete: false,
  start: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  ...overrides,
});

export const createMockScrollHook = (overrides = {}) => ({
  showScrollToBottom: true,
  handleUserScrollToBottom: vi.fn(),
  ...overrides,
});
```

### Test Data Generators

```typescript
// src/test/generators.ts
import { faker } from '@faker-js/faker';

export const generateMarkdownContent = () => {
  const sections = [
    `# ${faker.lorem.words(3)}`,
    faker.lorem.paragraphs(2),
    `## ${faker.lorem.words(2)}`,
    faker.lorem.paragraph(),
    '```javascript',
    'console.log("Hello, World!");',
    '```',
    faker.lorem.paragraph(),
  ];

  return sections.join('\n\n');
};

export const generateInteractiveContent = () => {
  const variable = faker.word.sample();
  const options = faker.lorem.words(3).split(' ');

  return `Choose ${variable}: ?[%{{${variable}}} ${options.join(' | ')}]`;
};

export const generateLargeContentList = (size: number) => {
  return Array(size).fill(0).map(() => ({
    content: generateMarkdownContent(),
    isFinished: faker.datatype.boolean(),
  }));
};
```

## 🚀 CI/CD Testing

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run type check
      run: npm run type-check

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

    - name: Build library
      run: npm run build

    - name: Run bundle size check
      run: npm run test:bundle-size

  visual-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0 # Required for Chromatic

    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run Chromatic
      uses: chromaui/action@v1
      with:
        projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
        buildScriptName: build-storybook

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build Storybook
      run: npm run build-storybook

    - name: Run accessibility tests
      run: npm run test:a11y
```

### Coverage Configuration

```json
// vitest.config.ts - coverage section
{
  "coverage": {
    "provider": "v8",
    "reporter": ["text", "html", "lcov", "json"],
    "reportsDirectory": "./coverage",
    "exclude": [
      "node_modules/",
      "src/test/",
      "**/*.stories.ts",
      "**/*.test.ts",
      "**/index.ts"
    ],
    "thresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Quality Gates

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:bundle-size": "bundlesize",
    "test:a11y": "storybook-test-runner --test-hook=.storybook/test-runner.js",
    "quality:check": "npm run lint && npm run type-check && npm run test:coverage && npm run test:bundle-size"
  }
}
```

## 📊 Test Metrics and Reporting

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# View terminal summary
cat coverage/text-summary.txt
```

### Test Performance

```bash
# Run tests with performance profiling
npm run test -- --reporter=verbose --logLevel=debug

# Analyze test performance
npm run test -- --reporter=json > test-results.json
```

### Quality Metrics

Track these metrics in your CI/CD:

- **Test Coverage**: Aim for >80% line coverage
- **Test Performance**: Tests should run in <30 seconds
- **Bundle Size**: Main bundle <100KB, gzipped <30KB
- **Accessibility**: Zero axe violations
- **Visual Regression**: Zero unintended changes

---

This testing guide provides comprehensive strategies for ensuring the quality, reliability, and maintainability of the Markdown Flow UI library. Regular testing at all levels helps prevent regressions and ensures a great developer experience.
