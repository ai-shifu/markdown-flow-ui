# Contributing to Markdown Flow UI

Thank you for your interest in contributing to Markdown Flow UI! This guide will help you get started with contributing to our React library for conversational AI applications.

## 🚀 Quick Start for Contributors

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git knowledge
- Basic understanding of React and TypeScript

### Development Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/markdown-flow-ui.git
cd markdown-flow-ui

# 3. Install dependencies
npm install

# 4. Start development environment
npm run storybook  # Interactive component documentation
npm run dev        # Next.js development server
```

Open [http://localhost:6006](http://localhost:6006) to view Storybook.

## 📋 Before Contributing

### Code of Conduct

We follow a friendly and inclusive code of conduct. Please be respectful and constructive in all communications.

### Issue Guidelines

1. **Search First**: Check existing issues before creating new ones
2. **Use Templates**: Follow our issue templates for bugs and features
3. **Be Specific**: Provide clear reproduction steps and expected behavior
4. **Include Context**: Share your environment (OS, Node version, browser)

### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feat/your-feature-name`
2. **Follow Conventions**: Use our coding standards and commit format
3. **Test Thoroughly**: Ensure all tests pass and add new tests
4. **Update Documentation**: Include relevant documentation updates
5. **Submit PR**: Use our PR template and link related issues

## 🛠 Development Workflow

### Branch Naming Convention

- **Features**: `feat/feature-description`
- **Bug Fixes**: `fix/issue-description`
- **Documentation**: `docs/documentation-update`
- **Refactoring**: `refactor/code-improvement`
- **Tests**: `test/test-description`

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code formatting (no functional changes)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements
- `ci:` CI/CD changes
- `build:` Build system changes

**Examples:**
```bash
feat: add typewriter speed control to ContentRender component
fix: resolve markdown parsing issue with nested code blocks
docs: update component API documentation
test: add unit tests for useTypewriter hook
```

## 📝 Code Standards

### TypeScript Requirements

- **Strict Types**: Avoid `any` types, use proper type definitions
- **Export Interfaces**: Make component prop interfaces public
- **Document Props**: Use JSDoc comments for all public APIs
- **Generic Support**: Use generics for reusable components

### Component Development Standards

#### File Structure

```typescript
// ComponentName.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentNameProps {
  /** Component description */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Component-specific props with descriptions */
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

#### Required Stories

Every component must have Storybook stories:

```typescript
// ComponentName.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Comprehensive component description with usage examples.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'alternative'],
      description: 'Visual variant of the component',
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

// Include interactive examples
export const Interactive: Story = {
  args: {
    children: 'Interactive example',
  },
  play: async ({ canvasElement }) => {
    // Add interaction tests here
  },
};
```

### Styling Guidelines

- **Tailwind First**: Use Tailwind CSS classes for styling
- **Component Variants**: Support multiple visual variants
- **Responsive Design**: Ensure mobile-first responsive behavior
- **Dark Mode**: Support dark mode with appropriate color schemes
- **Accessibility**: Follow WCAG guidelines for color contrast and interactions

### Testing Requirements

#### Component Testing

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
    render(<ComponentName className="custom-class">Content</ComponentName>);
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });

  it('supports different variants', () => {
    render(<ComponentName variant="alternative">Content</ComponentName>);
    expect(screen.getByText('Content')).toHaveClass('variant-classes');
  });
});
```

#### Hook Testing

```typescript
// useCustomHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('returns expected initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

## 🧪 Testing Guidelines

### Test Categories

1. **Unit Tests**: Individual component and hook testing
2. **Integration Tests**: Component interaction testing
3. **Visual Tests**: Storybook visual regression testing
4. **Accessibility Tests**: ARIA compliance and screen reader testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Visual testing with Storybook
npm run chromatic
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% overall code coverage
- **Critical Paths**: 100% coverage for core functionality
- **Public APIs**: All exported functions and components must be tested
- **Edge Cases**: Include tests for error conditions and edge cases

## 📚 Documentation Requirements

### Component Documentation

All components must include:

1. **JSDoc Comments**: Comprehensive prop descriptions
2. **Usage Examples**: Practical implementation examples
3. **Storybook Stories**: Interactive documentation
4. **API Reference**: Complete prop interface documentation

### README Updates

When adding new features:

1. **Update Examples**: Add relevant usage examples
2. **Feature List**: Update feature descriptions
3. **Migration Notes**: Document breaking changes
4. **Performance Notes**: Document performance implications

## 🔄 Plugin Development

### Creating Custom Plugins

1. **Plugin Structure**: Follow established plugin architecture
2. **Type Definitions**: Include comprehensive TypeScript types
3. **Documentation**: Create plugin-specific documentation
4. **Examples**: Provide working examples in Storybook

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

## ⚡ Performance Guidelines

### Component Performance

- **Memoization**: Use React.memo for expensive components
- **Lazy Loading**: Implement code splitting for large components
- **Bundle Size**: Keep bundle impact minimal
- **Render Optimization**: Avoid unnecessary re-renders

### Testing Performance

- **Bundle Analysis**: Check bundle size impact
- **Render Performance**: Test component render times
- **Memory Usage**: Monitor memory consumption

## 🚦 Pull Request Checklist

### Before Submitting

- [ ] **Code Quality**: Passes ESLint and Prettier checks
- [ ] **Tests**: All tests pass and coverage meets requirements
- [ ] **Stories**: Storybook stories added/updated
- [ ] **Documentation**: README and API docs updated
- [ ] **Types**: TypeScript types are properly defined
- [ ] **Build**: Library builds successfully
- [ ] **Performance**: No significant performance regressions

### PR Template

Use this template when creating pull requests:

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Storybook stories work correctly
- [ ] Manual testing completed

## Screenshots/GIFs
Include visual evidence of changes if applicable.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Bug Reports

### Bug Report Template

When reporting bugs, please include:

1. **Bug Description**: Clear description of the issue
2. **Reproduction Steps**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, browser details
6. **Code Examples**: Minimal reproduction code
7. **Screenshots**: Visual evidence if applicable

## 💡 Feature Requests

### Feature Request Template

When requesting features:

1. **Feature Summary**: Brief description of the feature
2. **Use Case**: Real-world scenario where this is needed
3. **Proposed Solution**: How you envision the implementation
4. **Alternatives**: Other approaches you've considered
5. **Examples**: Similar implementations in other libraries

## 📞 Community & Support

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community discussions
- **Pull Requests**: Code contributions and reviews

### Getting Help

1. **Check Documentation**: Review existing docs and examples
2. **Search Issues**: Look for similar questions or problems
3. **Create Discussion**: Start a discussion for questions
4. **Report Issues**: Use issue templates for bugs

### Response Times

- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Reviews typically within 3-5 days
- **Security Issues**: Immediate priority, contact maintainers directly

## 🏆 Recognition

We appreciate all contributions! Contributors will be:

- **Acknowledged**: Listed in our contributors section
- **Credited**: Mentioned in release notes for significant contributions
- **Invited**: To become maintainers for consistent high-quality contributions

---

Thank you for contributing to Markdown Flow UI! Your contributions help make conversational AI interfaces better for everyone. 🚀
