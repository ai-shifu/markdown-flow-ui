# AGENTS.md

This file provides guidance to all Coding Agents such as Claude Code (claude.ai/code), Codex when working with code in this repository.

## Quick Start

### Most Common Tasks

| Task | Command | Location |
|------|---------|----------|
| Start development server | `npm run dev` | Root directory |
| Build library | `npm run build` | Root directory |
| Run Storybook | `npm run storybook` | Root directory |
| Run tests | `npm test` | Root directory |
| Run linting | `npm run lint` | Root directory |
| Format code | `npm run format` | Root directory |
| Check code quality | `npm run lint && npm run format:check` | Root directory |

### Essential Files and Directories

```bash
# Core library components
src/components/           # Main UI components
src/lib/                 # Utility functions
src/index.ts            # Main export file

# Documentation and examples
.storybook/             # Storybook configuration
src/**/*.stories.ts     # Component stories
README.md              # Project documentation

# Configuration
package.json           # Dependencies and scripts
tsconfig.json         # TypeScript configuration
eslint.config.mjs     # ESLint configuration
.prettierrc           # Prettier formatting rules
```

## Critical Warnings ⚠️

### MUST DO Before Any Commit

1. **Run lint and format checks**: `npm run lint && npm run format:check` (MANDATORY)
2. **Test your changes**: Run `npm test` and verify Storybook examples work
3. **Build the library**: Run `npm run build` to ensure no build errors
4. **Use English for all code**: Comments, variables, commit messages
5. **Follow Conventional Commits**: `type: description` (lowercase type, imperative mood)
6. **Update Storybook stories**: Add/update stories for new or modified components

### Common Pitfalls to Avoid

- **Never hardcode user-facing strings** - Use props and make components configurable
- **Don't skip linting/formatting** - Pre-commit hooks will catch these issues
- **Don't commit secrets** - No API keys or sensitive data in code
- **Don't use non-English in code** - English only (except for user-facing content examples)
- **Don't break existing APIs** - Maintain backward compatibility for public interfaces
- **Don't forget TypeScript types** - All public APIs must be properly typed

## Project Overview

markdown-flow-ui is a React UI library for rendering markdown with interactive flow components, typewriter effects, and plugin support. It provides components for creating dynamic, interactive markdown experiences with features like:

- Real-time markdown rendering with syntax highlighting
- Typewriter effect animations
- Interactive flow components
- Plugin system for custom components
- Server-Sent Events (SSE) support for streaming content
- Mermaid diagram rendering
- Mathematical expressions with KaTeX

## Architecture

The project follows a component-based architecture with these main parts:

- **Core Components (`src/components/`)**: Main UI components for markdown rendering
- **Utility Functions (`src/lib/`)**: Helper functions and utilities
- **Plugin System**: Extensible architecture for custom markdown components
- **Storybook Integration**: Documentation and examples for all components

### Main Components

#### ContentRender (`src/components/ContentRender/`)

- **Purpose**: Core markdown rendering component with typewriter effects
- **Key Features**:
  - Markdown-to-HTML conversion with syntax highlighting
  - Typewriter animation support
  - Plugin system for custom components
  - Stream processing capabilities
- **Key Files**:
  - `ContentRender.tsx`: Main component implementation
  - `useTypewriter.ts`: Typewriter effect logic
  - `plugins/`: Custom component plugins (MermaidChart, CustomVariable)
  - `utils/`: Processing utilities

#### MarkdownFlow (`src/components/MarkdownFlow/`)

- **Purpose**: Flow-based markdown rendering with scroll management
- **Key Features**:
  - Scrollable markdown container
  - Auto-scroll to bottom functionality
  - Flow-based content display
- **Key Files**:
  - `MarkdownFlow.tsx`: Main flow component
  - `ScrollableMarkdownFlow.tsx`: Scrollable variant
  - `useScrollToBottom.ts`: Scroll behavior logic

#### MarkdownFlowEditor (`src/components/MarkdownFlowEditor/`)

- **Purpose**: Interactive markdown editor with CodeMirror integration
- **Key Features**:
  - Syntax highlighting for markdown
  - Real-time editing capabilities
  - CodeMirror-based editing experience

#### Playground (`src/components/Playground/`)

- **Purpose**: Interactive playground for testing markdown rendering
- **Key Features**:
  - Live preview of markdown content
  - Component testing interface
  - Markdown information extraction

### Plugin Architecture

The plugin system allows for extensible markdown components:

```typescript
// Example plugin structure
interface MarkdownPlugin {
  component: React.ComponentType<any>;
  matcher: (node: any) => boolean;
  renderer: (node: any, props: any) => React.ReactElement;
}
```

## Development Commands

### Library Development

```bash
# Development server (Next.js for testing)
npm run dev

# Build library for distribution
npm run build

# Build Storybook documentation
npm run build-storybook

# Start Storybook development server
npm run storybook
```

### Code Quality

```bash
# Linting
npm run lint                    # Check for lint errors
npm run lint:fix               # Fix lint errors automatically

# Formatting
npm run format                 # Format all files
npm run format:check          # Check formatting without changing files

# Testing
npm test                       # Run tests (when implemented)
```

### Package Management

```bash
# Install dependencies
npm install

# Prepare package for publishing
npm run prepublishOnly

# The library uses pnpm as package manager, but npm commands work too
pnpm install
pnpm build
```

## Component Development Standards

### Component Structure

Follow this structure for new components:

```typescript
// ComponentName.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentNameProps {
  /** Component description */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Other component-specific props */
  variant?: 'default' | 'alternative';
}

export const ComponentName = React.forwardRef<
  HTMLDivElement,
  ComponentNameProps
>(({ children, className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'base-component-classes',
        {
          'variant-classes': variant === 'alternative',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

### Story Structure

Create Storybook stories for all components:

```typescript
// ComponentName.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'alternative'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default component content',
  },
};

export const Alternative: Story = {
  args: {
    variant: 'alternative',
    children: 'Alternative variant content',
  },
};
```

### TypeScript Standards

- **Export all public interfaces**: Make component props interfaces available
- **Use proper generics**: For reusable components
- **Document props**: Use JSDoc comments for all public props
- **Strict typing**: Avoid `any` types, use proper type definitions

### CSS and Styling

- **Tailwind CSS**: Use Tailwind classes for styling
- **CSS Modules**: Use for component-specific styles when needed
- **Class utility**: Use `cn()` utility for conditional classes
- **Responsive design**: Consider mobile-first approach

## Plugin Development Guidelines

### Creating Custom Plugins

1. **Create plugin component** in `src/components/ContentRender/plugins/`
2. **Define plugin interface** with proper TypeScript types
3. **Implement rendering logic** for markdown AST nodes
4. **Add to plugin registry** in ContentRender component
5. **Create stories** for plugin examples

### Plugin Example

```typescript
// src/components/ContentRender/plugins/CustomPlugin.tsx
import React from 'react';

export interface CustomPluginProps {
  value: string;
  type?: string;
}

export const CustomPlugin: React.FC<CustomPluginProps> = ({
  value,
  type = 'default'
}) => {
  return (
    <div className="custom-plugin-container">
      <span className="custom-plugin-label">{type}:</span>
      <span className="custom-plugin-value">{value}</span>
    </div>
  );
};
```

## Testing Guidelines

### Component Testing

When tests are implemented, follow these patterns:

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders children correctly', () => {
    render(<ComponentName>Test content</ComponentName>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ComponentName className="custom-class">Content</ComponentName>
    );
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });
});
```

### Storybook Testing

- **Visual testing**: Use Storybook for visual regression testing
- **Interaction testing**: Test component interactions in stories
- **Accessibility testing**: Use Storybook a11y addon
- **Documentation**: Stories serve as living documentation

## API Documentation Standards

### Component Documentation

Document all public APIs:

```typescript
/**
 * ContentRender component for rendering markdown with typewriter effects
 *
 * @example
 * ```tsx
 * <ContentRender
 *   content="# Hello World"
 *   typewriter={true}
 *   speed={50}
 * />
 * ```
 */
export interface ContentRenderProps {
  /** Markdown content to render */
  content: string;
  /** Enable typewriter effect animation */
  typewriter?: boolean;
  /** Typing speed in milliseconds per character */
  speed?: number;
  /** Custom CSS classes */
  className?: string;
}
```

### Hook Documentation

```typescript
/**
 * Hook for managing typewriter effect state and animations
 *
 * @param content - The text content to animate
 * @param speed - Animation speed in milliseconds
 * @returns Object with current text, completion status, and control functions
 *
 * @example
 * ```tsx
 * const { displayText, isComplete, start, pause } = useTypewriter(
 *   'Hello World',
 *   50
 * );
 * ```
 */
export function useTypewriter(content: string, speed: number = 50) {
  // Implementation
}
```

## Build and Distribution

### Build Process

The library uses Vite for building:

1. **TypeScript compilation**: Generates type definitions
2. **Bundle creation**: Creates ESM and CJS bundles
3. **Asset optimization**: Optimizes CSS and other assets
4. **Type checking**: Ensures TypeScript correctness

### Package Structure

```text
dist/
├── index.esm.js        # ES modules build
├── index.cjs.js        # CommonJS build
├── index.d.ts          # TypeScript definitions
├── assets/             # Bundled CSS and other assets
└── components/         # Individual component builds
```

### Publishing Checklist

- [ ] Version updated in `package.json`
- [ ] Build completes successfully: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Storybook builds: `npm run build-storybook`
- [ ] CHANGELOG updated with changes
- [ ] Git tags applied for release

## Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Build fails with TypeScript errors | Check `tsconfig.json` and fix type errors |
| Storybook won't start | Clear `.storybook` cache, reinstall dependencies |
| Components not rendering | Check imports and exports in `src/index.ts` |
| Styling not applied | Verify Tailwind configuration and class names |
| Plugin not working | Check plugin registration in ContentRender |
| SSE connection fails | Verify server endpoint and CORS settings |

### Debug Commands

```bash
# Check Node/npm versions
node --version
npm --version

# Clear dependency cache
rm -rf node_modules package-lock.json
npm install

# Check build output
npm run build
ls -la dist/

# Check Storybook
npm run storybook

# Verify package structure
npm pack --dry-run
```

## Code Quality Standards

### Language Requirements

**English-Only Policy for Code**: All code-related content MUST be written in English.

#### What MUST be in English

- **Code Comments**: All inline comments and documentation
- **Variable and Function Names**: All identifiers
- **Component Props**: All prop names and descriptions
- **Type Definitions**: Interface names, type names, and documentation
- **Error Messages**: All error messages and logging
- **Git Commit Messages**: Must follow Conventional Commits format
- **Documentation**: README, API docs, and inline documentation

#### Conventional Commits Format

**Required Format**: `<type>: <description>`

**Common Types**:
- `feat:` - New feature or component
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `perf:` - Performance improvements
- `style:` - Code formatting (no functional changes)

**Examples**:
- `feat: add typewriter effect to ContentRender component`
- `fix: resolve markdown parsing issue with nested lists`
- `docs: update component API documentation`

### Pre-commit Quality Checks

Pre-commit hooks automatically run:
- **ESLint**: Code quality and style checks
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Lint-staged**: Only check modified files

```bash
# Manual quality check
npm run lint && npm run format:check

# Fix formatting issues
npm run format

# Fix linting issues
npm run lint:fix
```

## Additional Resources

- **React Documentation**: https://reactjs.org/
- **TypeScript Documentation**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Storybook**: https://storybook.js.org/
- **Vite**: https://vitejs.dev/
- **Conventional Commits**: https://www.conventionalcommits.org/
- **React Markdown**: https://github.com/remarkjs/react-markdown
- **Remark Plugins**: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
