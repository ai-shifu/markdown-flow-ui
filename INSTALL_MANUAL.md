# Installation Manual - Markdown Flow UI

This guide provides comprehensive installation and setup instructions for Markdown Flow UI, a React library designed for conversational AI applications with streaming typewriter effects.

## 📋 Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm (included with Node.js), pnpm (recommended), or yarn
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Development Prerequisites

For development and contribution:

- **TypeScript**: Familiarity with TypeScript 5.0+
- **React**: Knowledge of React 18+ and React Hooks
- **Git**: Version control system for development
- **Code Editor**: VS Code (recommended) with TypeScript support

## 🚀 Quick Installation

### For New Projects

```bash
# Using npm
npm install markdown-flow-ui

# Using pnpm (recommended)
pnpm add markdown-flow-ui

# Using yarn
yarn add markdown-flow-ui
```

### TypeScript Support

The library includes built-in TypeScript definitions. No additional @types packages needed.

```typescript
// TypeScript imports work out of the box
import { MarkdownFlow, ContentRender } from 'markdown-flow-ui';
```

## 🛠 Development Installation

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/ai-shifu/markdown-flow-ui.git
cd markdown-flow-ui

# Or download and extract the source code
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (choose one)
npm install      # Using npm
pnpm install     # Using pnpm (recommended)
yarn install     # Using yarn
```

### Step 3: Environment Setup

The project uses several development tools. Ensure they're properly configured:

```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check package manager
pnpm --version  # If using pnpm
npm --version   # If using npm
```

### Step 4: Start Development Environment

```bash
# Start Storybook for component development
npm run storybook     # Opens http://localhost:6006

# Or start Next.js development server
npm run dev          # Opens http://localhost:3000

# Run both in parallel (recommended)
npm run storybook & npm run dev
```

## 📁 Project Structure

Understanding the project structure helps with development:

```
markdown-flow-ui/
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── ContentRender/      # Core markdown rendering
│   │   ├── MarkdownFlow/       # Flow-based components
│   │   ├── MarkdownFlowEditor/ # Editor components
│   │   ├── Playground/         # Testing components
│   │   └── ui/                 # Base UI components
│   ├── lib/                    # Utility functions
│   └── index.ts               # Main export file
├── .storybook/                 # Storybook configuration
├── dist/                       # Built library (after build)
├── public/                     # Static assets
└── package.json               # Project configuration
```

## 🔧 Configuration

### ESLint Configuration

The project includes comprehensive ESLint rules. Your editor should automatically detect the configuration:

```bash
# Run linting manually
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Prettier Configuration

Code formatting is handled by Prettier:

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

### TypeScript Configuration

The project uses strict TypeScript settings. Key configuration files:

- `tsconfig.json`: Main TypeScript configuration
- `tsconfig.build.json`: Build-specific configuration

## 🧪 Testing Setup

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Tools

The project uses:

- **Vitest**: Fast test runner
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: Additional DOM matchers

## 📦 Building the Library

### Development Build

```bash
# Build for development
npm run build:dev
```

### Production Build

```bash
# Build for production
npm run build

# The built files will be in the dist/ directory
```

### Build Output

The build process creates:

```
dist/
├── index.esm.js        # ES modules build
├── index.cjs.js        # CommonJS build
├── index.d.ts          # TypeScript definitions
├── components/         # Individual component builds
└── assets/             # CSS and other assets
```

## 🎨 Storybook Setup

### Starting Storybook

```bash
# Start development server
npm run storybook

# Build static storybook
npm run build-storybook
```

### Storybook Features

- **Interactive Development**: Test components in isolation
- **Documentation**: Auto-generated documentation from JSDoc
- **Controls**: Dynamic prop testing
- **Accessibility**: Built-in a11y testing

### Adding New Stories

Create stories for new components:

```typescript
// src/components/YourComponent/YourComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Component props
  },
};
```

## 🔍 IDE Setup

### Visual Studio Code (Recommended)

Install these extensions for the best development experience:

```json
// .vscode/extensions.json (included in project)
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "@typescript-eslint.typescript-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Settings

Recommended VS Code settings:

```json
// .vscode/settings.json (included in project)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "['\"](.*?)['\""]"]
  ]
}
```

## 🌐 Framework Integration

### Next.js Integration

```bash
# Install in Next.js project
npm install markdown-flow-ui

# No additional configuration needed
```

```typescript
// pages/chat.tsx or app/chat/page.tsx
import { MarkdownFlow } from 'markdown-flow-ui';

export default function ChatPage() {
  return (
    <div>
      <MarkdownFlow
        initialContentList={[{ content: "# Hello from Next.js!" }]}
      />
    </div>
  );
}
```

### Create React App

```bash
# Install in CRA project
npm install markdown-flow-ui

# Import and use
```

```typescript
// src/App.tsx
import React from 'react';
import { MarkdownFlow } from 'markdown-flow-ui';

function App() {
  return (
    <div className="App">
      <MarkdownFlow
        initialContentList={[{ content: "# Hello from React!" }]}
      />
    </div>
  );
}

export default App;
```

### Vite Integration

```bash
# Install in Vite project
npm install markdown-flow-ui
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarkdownFlow } from 'markdown-flow-ui';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MarkdownFlow
      initialContentList={[{ content: "# Hello from Vite!" }]}
    />
  </React.StrictMode>
);
```

## 🎯 CSS and Styling Setup

### Tailwind CSS (Required)

The library requires Tailwind CSS to be installed in your project:

```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind to scan the library files:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/markdown-flow-ui/**/*.{js,ts,jsx,tsx}', // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Custom Styling

Override default styles by customizing CSS variables:

```css
/* globals.css */
:root {
  --markdown-flow-primary: #2563eb;
  --markdown-flow-secondary: #64748b;
  --markdown-flow-background: #ffffff;
  --markdown-flow-text: #1f2937;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --markdown-flow-background: #1f2937;
    --markdown-flow-text: #f9fafb;
  }
}
```

## 📱 Mobile Development

### React Native (Expo)

For React Native applications using Expo:

```bash
# Note: React Native support is limited
# Use react-native-webview for full functionality
npm install react-native-webview
```

### PWA Support

The library works well in Progressive Web Apps:

```javascript
// public/sw.js - Cache library assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('markdown-flow-ui')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

## 🚀 Performance Optimization

### Bundle Size Optimization

Use tree shaking to reduce bundle size:

```typescript
// Import only what you need
import { MarkdownFlow } from 'markdown-flow-ui/MarkdownFlow';
import { ContentRender } from 'markdown-flow-ui/ContentRender';

// Instead of
import { MarkdownFlow, ContentRender } from 'markdown-flow-ui';
```

### Lazy Loading

For better performance, lazy load components:

```typescript
import { lazy, Suspense } from 'react';

const MarkdownFlow = lazy(() =>
  import('markdown-flow-ui').then(module => ({
    default: module.MarkdownFlow
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarkdownFlow initialContentList={[]} />
    </Suspense>
  );
}
```

## 🔧 Troubleshooting Installation

### Common Issues

#### Node Version Conflicts

```bash
# Check Node version
node --version

# Use Node Version Manager if needed
nvm use 18
# or
nvm install 18 && nvm use 18
```

#### Package Manager Issues

```bash
# Clear npm cache
npm cache clean --force

# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Ensure TypeScript version compatibility
npm install -D typescript@^5.0.0

# Check for type conflicts
npx tsc --noEmit
```

#### Build Failures

```bash
# Check for missing dependencies
npm ls

# Update dependencies
npm update

# Clear build cache
rm -rf dist .next
npm run build
```

### Development Server Issues

```bash
# Port conflicts
# Change port in package.json scripts or use:
npm run storybook -- --port 6007
npm run dev -- --port 3001

# Permission issues (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Integration Issues

#### CSS Not Loading

Ensure Tailwind CSS is properly configured:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    // Include library path
    './node_modules/markdown-flow-ui/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
}
```

#### Import Errors

Check your module resolution:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 📚 Next Steps

After installation:

1. **Read the Documentation**: Check out [API.md](./API.md) for component APIs
2. **View Examples**: Explore Storybook at http://localhost:6006
3. **Join Community**: Visit our GitHub discussions for questions
4. **Contribute**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

## 🔗 Additional Resources

- [Official Documentation](https://github.com/ai-shifu/markdown-flow-ui)
- [API Reference](./API.md)
- [Component Examples](./src/components)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/ai-shifu/markdown-flow-ui/issues)

---

Need help? Create an issue on GitHub or start a discussion. We're here to help! 🚀
