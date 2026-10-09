# MarkdownFlow UI Component Library

**React component library for rendering interactive [MarkdownFlow](https://markdownflow.ai) documents with typewriter effects, real-time streaming, and advanced Mermaid diagram support.**

[MarkdownFlow](https://markdownflow.ai) (also known as MDFlow or markdown-flow) extends standard Markdown with AI to create personalized, interactive pages. Its tagline is **"Write Once, Deliver Personally"**.

<div align="center">

[![npm version](https://badge.fury.io/js/markdown-flow-ui.svg)](https://badge.fury.io/js/markdown-flow-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Storybook](https://img.shields.io/badge/Storybook-Enabled-ff69b4.svg)](https://storybook.js.org/)

English | [简体中文](README_ZH-CN.md)

</div>

## 🚀 Quick Start

### Install

```bash
npm install markdown-flow-ui
# or
yarn add markdown-flow-ui
# or
pnpm add markdown-flow-ui
```

### Basic Usage

```tsx
import { MarkdownFlow } from "markdown-flow-ui";

function App() {
  return (
    <MarkdownFlow
      initialContentList={[
        {
          content:
            "# Hello World\n\nThis is **MarkdownFlow** with typewriter effect!",
        },
      ]}
      enableTypewriter={true}
      typingSpeed={30}
    />
  );
}
```

With the typewriter enabled, prose follows the configured typing pace. Received
HTML is rendered from each received snapshot immediately, including unfinished
fragments, while surrounding prose continues typing. HTML does not consume the
typing budget or wait for earlier prose to finish. Tag-like text such as `<div`
remains ordinary Markdown until a tag-name boundary (whitespace, `/`, or `>`) is
received.

Streaming detection recognizes the backend MarkdownFlow block roots, including
`figure`, `table`, `canvas`, `video`, `header`, `nav`, and `details`. HTML-looking
text inside Markdown code, math, comments, link destinations/titles, reference
definitions, or another tag's attributes stays inert. Unfinished link metadata
also stays literal while streaming; invalid links do not hide subsequent HTML.
Detection and presentation are separate: `pre`, `details`, `summary`,
`aside`, `blockquote`, `ul`, `ol`, `dl`, and `table` keep their native Markdown
styles and language/direction attributes while bypassing typing. Widget roots
retain the sandbox; native presentation blocks with embedded script, style, or
other document resources also use the sandbox (native video frames are exempt).
Detection scans absolute source offsets without reparsing every remaining
suffix. Native videos use the complete received Markdown structure; typing only
changes text visibility, preserving video frames across earlier headings, lists,
quotes, reference links, and subsequent HTML updates. Stable runs apply the
same HTML indentation and newline normalization as the ordinary renderer, with
positions mapped back to the original source for typing and callbacks.
Each received snapshot determines the Markdown structure. Later source that
changes its grammar, such as adding a previously missing reference definition,
can change that structure; typing an already received snapshot preserves it.

### Interactive Elements

```tsx
import { MarkdownFlow } from "markdown-flow-ui";

function InteractiveExample() {
  const content = `
Choose your language: ?[%{{lang}} English | 中文 | Español]

Your name: ?[%{{name}} Enter your name...]

?[Continue | Cancel]
`;

  return (
    <MarkdownFlow
      initialContentList={[{ content }]}
      onSend={(params) => {
        console.log("User interaction:", params);
        // Handle button clicks and input submissions
      }}
    />
  );
}
```

## 📖 Documentation

For detailed API documentation, examples, and advanced usage, see:

**[📋 API Reference](API_REFERENCE.md)** - Complete API documentation with examples

## 🧩 Advanced Examples

### Custom Render Bar

```tsx
const CustomBar: CustomRenderBarProps = ({ displayContent, onSend }) => {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => onSend({ buttonText: "Regenerate" })}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Regenerate
      </button>
      <button
        onClick={() => navigator.clipboard.writeText(displayContent)}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        Copy
      </button>
    </div>
  );
};

<MarkdownFlow customRenderBar={CustomBar} initialContentList={messages} />;
```

## Development verification

Run `npm test` for unit tests and `npm run test:package` for distribution checks.
The package check rebuilds the library before testing both exported stylesheets,
scroll-control visibility and accessibility rules, and bundled math fonts.
CI runs both commands alongside the Storybook browser tests.

## 🌐 MarkdownFlow Ecosystem

markdown-flow-ui is part of the MarkdownFlow ecosystem for creating personalized, AI-driven interactive documents:

- **[markdown-flow](https://github.com/ai-shifu/markdown-flow)** - The main repository containing homepage, documentation, and interactive playground
- **[markdown-flow-agent-py](https://github.com/ai-shifu/markdown-flow-agent-py)** - Python agent for transforming MarkdownFlow documents into personalized content
- **[markdown-it-flow](https://github.com/ai-shifu/markdown-it-flow)** - markdown-it plugin to parse and render MarkdownFlow syntax
- **[remark-flow](https://github.com/ai-shifu/remark-flow)** - Remark plugin to parse and process MarkdownFlow syntax in React applications

## 💖 Sponsors

<div align="center">
  <a href="https://ai-shifu.com">
    <img src="https://raw.githubusercontent.com/ai-shifu/ai-shifu/main/assets/logo_en.png" alt="AI-Shifu" width="150" />
  </a>
  <p><strong><a href="https://ai-shifu.com">AI-Shifu.com</a></strong></p>
  <p>AI-powered personalized learning platform</p>
</div>

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Markdown](https://github.com/remarkjs/react-markdown) for markdown processing
- [Mermaid](https://mermaid.js.org/) for diagram rendering
- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 📞 Support

- 📖 [Documentation](https://github.com/ai-shifu/markdown-flow-ui#readme)
- 🐛 [Issue Tracker](https://github.com/ai-shifu/markdown-flow-ui/issues)
- 💬 [Discussions](https://github.com/ai-shifu/markdown-flow-ui/discussions)
