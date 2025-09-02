# Architecture Documentation - Markdown Flow UI

This document provides an in-depth overview of the technical architecture, design decisions, and implementation details of the Markdown Flow UI library.

## 📋 Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Component Architecture](#component-architecture)
- [Plugin System](#plugin-system)
- [State Management](#state-management)
- [Rendering Pipeline](#rendering-pipeline)
- [Performance Optimizations](#performance-optimizations)
- [Build System](#build-system)
- [Dependencies](#dependencies)
- [Future Considerations](#future-considerations)

## 🏗 Overview

Markdown Flow UI is a React library specifically designed for conversational AI applications. It provides a comprehensive solution for rendering markdown content with typewriter effects, interactive elements, and streaming capabilities.

### Key Architectural Goals

1. **Modular Design**: Components can be used independently or composed together
2. **Plugin Architecture**: Extensible system for custom markdown elements
3. **Performance**: Optimized for real-time streaming and large content rendering
4. **Type Safety**: Full TypeScript support with comprehensive type definitions
5. **Accessibility**: WCAG 2.1 compliant components with proper ARIA support
6. **Framework Agnostic**: Core functionality that can integrate with any React application

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  MarkdownFlow  │  ScrollableMarkdownFlow  │  Editor        │
├─────────────────────────────────────────────────────────────┤
│                    ContentRender (Core)                     │
├─────────────────────────────────────────────────────────────┤
│     Plugins     │    Hooks      │    Utils      │  Types   │
├─────────────────────────────────────────────────────────────┤
│  React Markdown │  Remark/Rehype │  Highlight.js │ Mermaid │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. Composition Over Inheritance

Components are designed to be composed together rather than extended through inheritance. This allows for maximum flexibility and reusability.

```typescript
// Good: Composition
<ScrollableMarkdownFlow>
  <MarkdownFlow>
    <ContentRender />
  </MarkdownFlow>
</ScrollableMarkdownFlow>

// Avoided: Deep inheritance hierarchies
```

### 2. Controlled vs Uncontrolled Components

Components support both controlled and uncontrolled usage patterns:

```typescript
// Controlled: Parent manages state
<MarkdownFlow
  initialContentList={messages}
  onSend={handleSend}
/>

// Uncontrolled: Component manages internal state
<ContentRender content="# Auto-managed content" />
```

### 3. Progressive Enhancement

Features are layered so that basic functionality works without advanced features:

- Basic markdown rendering (core)
- + Typewriter effects (enhanced UX)
- + Interactive elements (advanced functionality)
- + Streaming support (real-time features)

### 4. Predictable State Updates

State changes follow predictable patterns using React's built-in state management and custom hooks:

```typescript
// Predictable state flow
content → typewriter → display → completion → callback
```

## 🧩 Component Architecture

### Core Component Hierarchy

```
MarkdownFlow (Container)
├── ContentRender (Core Renderer)
│   ├── ReactMarkdown (Markdown Processing)
│   ├── Custom Plugins (Interactive Elements)
│   ├── Syntax Highlighting (Code Display)
│   └── Math Rendering (KaTeX)
├── ScrollableMarkdownFlow (Enhanced Container)
│   ├── MarkdownFlow (Base Functionality)
│   ├── useScrollToBottom (Auto-scroll Logic)
│   └── Scroll Controls (UI Controls)
└── MarkdownFlowEditor (Development Tool)
    ├── CodeMirror (Editor Core)
    ├── Markdown Language Support
    └── Preview Integration
```

### Component Responsibilities

#### MarkdownFlow
- **Purpose**: Container component for rendering multiple content blocks
- **Responsibilities**:
  - Managing content list state
  - Coordinating typewriter effects across blocks
  - Handling user interactions and callbacks
  - Providing consistent styling context

#### ContentRender
- **Purpose**: Core markdown rendering with plugins
- **Responsibilities**:
  - Processing markdown content through remark/rehype
  - Managing typewriter animation state
  - Rendering interactive plugins
  - Providing extension points for customization

#### ScrollableMarkdownFlow
- **Purpose**: Enhanced container with scroll management
- **Responsibilities**:
  - Managing scroll position and behavior
  - Auto-scrolling to new content
  - Providing scroll-to-bottom controls
  - Handling container overflow

#### MarkdownFlowEditor
- **Purpose**: Development and content authoring tool
- **Responsibilities**:
  - Providing markdown editing interface
  - Syntax highlighting for markdown
  - Live preview integration
  - Export/import functionality

### Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User Input     │───▶│  Event Handlers  │───▶│  State Updates  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Component      │◀───│  Re-render       │◀───│  Hook Updates   │
│  Updates        │    │  Cycle           │    │  (useTypewriter) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔌 Plugin System

### Plugin Architecture

The plugin system is built on React's component composition model with markdown processing integration:

```typescript
// Plugin Registration
const components = {
  'custom-variable': CustomVariablePlugin,
  'mermaid-chart': MermaidPlugin,
  'custom-button': CustomButtonPlugin,
  // ... additional plugins
};

// Plugin Integration
<ReactMarkdown
  components={components}
  remarkPlugins={[remarkFlow, ...otherPlugins]}
>
  {content}
</ReactMarkdown>
```

### Plugin Interface

```typescript
interface MarkdownPlugin {
  // Component that renders the plugin
  component: React.ComponentType<any>;

  // Remark plugin for parsing
  remarkPlugin?: Plugin;

  // Rehype plugin for processing
  rehypePlugin?: Plugin;

  // Plugin configuration
  config?: PluginConfig;
}

interface PluginConfig {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}
```

### Built-in Plugins

#### 1. Custom Variable Plugin
- **Purpose**: Interactive buttons and input fields
- **Implementation**: Custom remark plugin + React component
- **Features**: Variable extraction, validation, multiple choice support

#### 2. Mermaid Plugin
- **Purpose**: Diagram rendering
- **Implementation**: Code block processor + Mermaid.js integration
- **Features**: Multiple diagram types, responsive rendering, error handling

#### 3. Math Plugin
- **Purpose**: Mathematical expression rendering
- **Implementation**: remark-math + rehype-katex
- **Features**: Inline and block math, LaTeX syntax support

### Plugin Development Guide

#### Creating a Custom Plugin

1. **Define the React Component**:
```typescript
interface CustomPluginProps {
  value: string;
  attributes?: Record<string, any>;
}

const CustomPlugin: React.FC<CustomPluginProps> = ({ value, attributes }) => {
  return (
    <div className="custom-plugin" {...attributes}>
      <span>Custom: {value}</span>
    </div>
  );
};
```

2. **Create Remark Plugin** (if needed):
```typescript
import { visit } from 'unist-util-visit';

const remarkCustomPlugin = () => {
  return (tree: any) => {
    visit(tree, 'text', (node, index, parent) => {
      // Process and transform nodes
      if (node.value.includes('[[custom:')) {
        // Transform to custom element
        const customNode = {
          type: 'element',
          tagName: 'custom-plugin',
          properties: { value: extractValue(node.value) },
          children: []
        };
        parent.children[index] = customNode;
      }
    });
  };
};
```

3. **Register with ContentRender**:
```typescript
const customComponents = {
  'custom-plugin': CustomPlugin,
};

<ContentRender
  content={content}
  customComponents={customComponents}
/>
```

## 🔄 State Management

### State Architecture

The library uses a combination of React's built-in state management and custom hooks:

```typescript
// Component State
useState()     // Local component state
useReducer()   // Complex state logic
useRef()       // Mutable references

// Custom Hooks
useTypewriter()      // Typewriter animation
useScrollToBottom()  // Scroll management
useSSE()            // Server-sent events
```

### Typewriter State Machine

The typewriter effect is implemented as a state machine:

```typescript
type TypewriterState =
  | 'idle'
  | 'typing'
  | 'paused'
  | 'complete';

// State transitions
idle → typing → complete
typing ⇄ paused
* → idle (on reset)
```

### State Flow Diagram

```
┌─────────────┐    start()    ┌─────────────┐
│    Idle     │──────────────▶│   Typing    │
└─────────────┘               └─────────────┘
       ▲                             │
       │ reset()                     │ pause()
       │                             ▼
┌─────────────┐   complete    ┌─────────────┐
│  Complete   │◀──────────────│   Paused    │
└─────────────┘               └─────────────┘
```

### Performance Considerations

#### 1. Memoization Strategy
```typescript
// Component memoization
export const ContentRender = React.memo(ContentRenderImpl);

// Hook memoization
const memoizedComponents = useMemo(() => ({
  'custom-variable': CustomVariable,
  // ... other components
}), []);

// Callback memoization
const handleSend = useCallback((params) => {
  // Handle send logic
}, [dependencies]);
```

#### 2. Ref-based Optimizations
```typescript
// Avoid re-renders for frequently changing values
const animationFrameRef = useRef<number>();
const hasCompletedRef = useRef<boolean>(false);

// Direct DOM manipulation for animations
const updateText = useCallback((text: string) => {
  if (elementRef.current) {
    elementRef.current.textContent = text;
  }
}, []);
```

## 🎨 Rendering Pipeline

### Markdown Processing Pipeline

```
Raw Markdown
    │
    ▼
┌─────────────┐
│ Remark      │ ← remarkGfm, remarkMath, remarkFlow
│ (Parse)     │
└─────────────┘
    │
    ▼
┌─────────────┐
│ MDAST       │ ← Abstract Syntax Tree
│ (Transform) │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Rehype      │ ← rehypeHighlight, rehypeKatex
│ (Process)   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ HAST        │ ← HTML Abstract Syntax Tree
│ (Render)    │
└─────────────┘
    │
    ▼
React Components
```

### Component Rendering Flow

```typescript
// Rendering sequence
1. Content Processing (remark/rehype)
2. Typewriter State Calculation
3. Component Tree Generation
4. Plugin Component Rendering
5. Event Handler Attachment
6. DOM Updates
```

### Optimization Techniques

#### 1. Incremental Rendering
```typescript
// Only re-render changed content blocks
const ContentBlock = React.memo(({ content, index }) => {
  // Block-level memoization
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content &&
         prevProps.index === nextProps.index;
});
```

#### 2. Virtual Scrolling (Future)
```typescript
// For large content lists
const VirtualizedFlow = () => {
  const [visibleRange, setVisibleRange] = useState([0, 10]);

  return (
    <div>
      {contentList.slice(...visibleRange).map(renderBlock)}
    </div>
  );
};
```

## ⚡ Performance Optimizations

### Bundle Size Optimization

#### 1. Tree Shaking Support
```typescript
// Individual component exports
export { MarkdownFlow } from './components/MarkdownFlow';
export { ContentRender } from './components/ContentRender';
export { useTypewriter } from './hooks/useTypewriter';

// Bundler can eliminate unused exports
```

#### 2. Dynamic Imports
```typescript
// Lazy load heavy dependencies
const MermaidChart = React.lazy(() => import('./MermaidChart'));

// Code splitting for editor
const MarkdownFlowEditor = React.lazy(() =>
  import('./MarkdownFlowEditor')
);
```

#### 3. External Dependencies
```typescript
// Mark as external to avoid bundling
externals: {
  'react': 'React',
  'react-dom': 'ReactDOM',
  'highlight.js': 'hljs',
}
```

### Runtime Performance

#### 1. Animation Optimization
```typescript
// Use requestAnimationFrame for smooth animations
const animateText = useCallback(() => {
  const frame = () => {
    // Update display text
    setDisplayText(currentText);

    if (shouldContinue) {
      animationFrameRef.current = requestAnimationFrame(frame);
    }
  };

  frame();
}, []);
```

#### 2. Event Handling Optimization
```typescript
// Debounce frequent events
const debouncedScroll = useMemo(
  () => debounce(handleScroll, 16), // ~60fps
  [handleScroll]
);

// Passive event listeners
useEffect(() => {
  element.addEventListener('scroll', debouncedScroll, { passive: true });
}, []);
```

#### 3. Memory Management
```typescript
// Cleanup on unmount
useEffect(() => {
  return () => {
    // Cancel animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close SSE connections
    eventSource?.close();

    // Clear timers
    clearTimeout(timerId);
  };
}, []);
```

## 🔨 Build System

### Build Architecture

```
Source Code (TypeScript + CSS)
    │
    ▼
┌─────────────┐
│ Vite        │ ← Build tool
│ TypeScript  │ ← Type checking
│ Rollup      │ ← Bundle generation
└─────────────┘
    │
    ▼
┌─────────────┐
│ ESM Bundle  │ ← Modern modules
│ CJS Bundle  │ ← CommonJS support
│ Type Defs   │ ← TypeScript definitions
└─────────────┘
    │
    ▼
Distribution Package
```

### Build Configuration

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MarkdownFlowUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "node"
  }
}
```

### Output Structure

```
dist/
├── index.esm.js         # ES modules build
├── index.esm.js.map     # Source map
├── index.cjs.js         # CommonJS build
├── index.cjs.js.map     # Source map
├── index.d.ts           # Main type definitions
├── components/          # Individual component builds
│   ├── MarkdownFlow/
│   │   ├── index.js
│   │   └── index.d.ts
│   └── ContentRender/
│       ├── index.js
│       └── index.d.ts
└── assets/              # CSS and other assets
    ├── styles.css
    └── fonts/
```

## 📦 Dependencies

### Core Dependencies

#### Production Dependencies
```json
{
  "react": "^18.0.0",
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "remark-math": "^6.0.0",
  "remark-flow": "^1.0.0",
  "rehype-highlight": "^7.0.0",
  "rehype-katex": "^7.0.0",
  "highlight.js": "^11.0.0",
  "katex": "^0.16.0",
  "mermaid": "^10.0.0",
  "lucide-react": "^0.263.0"
}
```

#### Development Dependencies
```json
{
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@storybook/react": "^7.0.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

### Dependency Analysis

#### Bundle Size Impact
```
react-markdown:  45kb (gzipped)
highlight.js:    35kb (subset languages)
katex:          280kb (math rendering)
mermaid:        150kb (diagrams)
core library:    25kb (our code)
```

#### Peer Dependencies Strategy
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": false },
    "react-dom": { "optional": false }
  }
}
```

## 🔮 Future Considerations

### Scalability Improvements

#### 1. Virtual Scrolling
For applications with thousands of messages:
```typescript
// Planned implementation
const VirtualMarkdownFlow = () => {
  const [virtualItems] = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
  });

  return virtualItems.map(renderVirtualItem);
};
```

#### 2. Web Workers
For heavy markdown processing:
```typescript
// Planned architecture
const processMarkdown = async (content: string) => {
  const worker = new Worker('/markdown-worker.js');
  return await postMessage(worker, { content });
};
```

### Plugin Ecosystem

#### 1. Plugin Registry
```typescript
// Planned plugin system
interface PluginRegistry {
  register(plugin: MarkdownPlugin): void;
  unregister(pluginName: string): void;
  list(): PluginInfo[];
  load(pluginName: string): Promise<MarkdownPlugin>;
}

const registry = createPluginRegistry();
registry.register(customPlugin);
```

#### 2. Plugin Marketplace
- Community-contributed plugins
- Version management and compatibility
- Security scanning and validation

### Performance Enhancements

#### 1. Server-Side Rendering
```typescript
// Planned SSR support
export const renderToString = (props: MarkdownFlowProps) => {
  return ReactDOMServer.renderToString(
    <MarkdownFlow {...props} />
  );
};
```

#### 2. Streaming Rendering
```typescript
// Planned streaming API
export const renderToStream = (props: MarkdownFlowProps) => {
  return ReactDOMServer.renderToPipeableStream(
    <MarkdownFlow {...props} />
  );
};
```

### Accessibility Improvements

#### 1. Screen Reader Enhancements
- Live region announcements for new content
- Skip navigation for long conversations
- Keyboard shortcuts for common actions

#### 2. High Contrast Mode
- Automatic high contrast detection
- Custom theme support
- Forced colors mode compatibility

### Mobile Optimizations

#### 1. Touch Interactions
- Swipe gestures for navigation
- Touch-friendly interactive elements
- Haptic feedback integration

#### 2. Performance
- Reduced motion preferences
- Battery-conscious animations
- Network-aware loading strategies

---

This architecture documentation provides a comprehensive overview of the Markdown Flow UI library's technical implementation. For specific implementation details, refer to the source code and component documentation.
