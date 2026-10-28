# Changelog

## 0.3.4 - Unreleased

### Fixed

- Include remark-flow 1.4.2 in the published renderer and editor bundles so
  interactions accept both `%{{name}}` and `{{name}}` as a leading named binding.
- Verify both packaged module formats submit named answers and preserve stored
  values when interactions are replayed.

## 0.3.3 - 2026-10-26

### Fixed

- Keep remark-flow helpers bound in published ESM and CommonJS editor bundles,
  so consumers can load the editor and update Markdown content reliably.
- Use KaTeX 0.18.2 consistently for mathematical markup and styles, including
  the patched handling of inherited trust settings.

### Changed

- Require the patched Next.js 15.5.28 peer version and pin Sharp 0.35.5 for
  development installs with both npm and pnpm.
- Update Vite, Storybook and Vitest to patched versions, and keep browser gesture
  tests consistent with native pointer and orientation event timing.
- Remove the unused Rollup CommonJS and Terser plugins and the daisyUI development
  dependency while keeping the bundled blackboard styles unchanged.

## 0.3.2 - 2026-10-25

### Changed

- Simplify the editor by removing variable toolbar actions, the variable slash
  command, and the variable selection and creation panel.
- Show variable references and assignment markers as editable source in QuickEdit
  instead of interactive labels. Keep the existing variable-list props accepted
  for compatibility.
- Refresh dialog, popover, and slot dependencies alongside the development
  toolchain.

### Fixed

- Keep image- and video-like text inside variable names editable while preserving
  ordinary media placeholders and their settings.
- Refresh media placeholders when edits to variable delimiters on another line
  change whether the media belongs to a variable name.

## 0.3.1 - 2026-10-25

### Fixed

- Ship Mermaid 11.16.1 with js-yaml 4.3.2 for both module formats and lazy
  diagrams, so consumers no longer need aliases for embedded parser files.
- Use the same patched YAML parser in Storybook previews, browser tests and
  static builds while preserving diagram syntax and renderer APIs.
- Keep Chinese diagram labels visible after a zoomed mount and preserve XY tick
  labels in centered and narrow layouts.
- Retain valid XY diagrams when optional font geometry measurement is unavailable.

## 0.3.0 - 2026-10-24

### Added

- Use complete questions and other Unicode text as memory keys, preserving
  internal spaces, punctuation, emoji, and single braces after boundary trimming.

### Fixed

- Use the stable remark-flow 1.4.1 parser so link titles containing variable-like
  examples preserve following headings and answer controls with newer parsers.
- Share variable rules across rendering, editing, validation, suggestions, and
  answer replay while preserving existing compact markers.
- Keep markup and interaction delimiters inside variable names opaque, and keep
  incomplete code or HTML examples from hiding later real controls.
- Preserve literal code boundaries across blank paragraphs and fences, and use
  padded markers when inserting names that end with a single closing brace.

## 0.2.34 - 2026-10-11

### Fixed

- Fit ordinary sandbox blocks to their content instead of reserving a minimum
  16:9 slide, removing excess blank space below compact lesson cards.
- Preserve a separate iframe layout viewport for viewport-relative sizes and
  fixed-position controls, while following content growth, collapse and image
  loads without rebuilding the iframe.
- Keep authored spacing, blackboard sizing and sandbox permissions unchanged.
- Reserve the visible fullscreen control's measured height on very short blocks.

## 0.2.32 - 2026-10-10

### Fixed

- Reveal sandbox HTML, native HTML, and video frames only after preceding prose
  has finished typing, while keeping HTML updates progressive and unpaced.
- Report displayed source progress accurately and keep waiting HTML out of
  custom render bars until it is reached.
- Preserve displayed iframe instances and native Markdown structure as later
  prose types and additional HTML arrives.

## 0.2.31 - 2026-10-09

### Fixed

- Keep self-closing HTML and video frames visible during streaming, preserve
  literal less-than signs and ambiguous tag prefixes, and isolate HTML after
  unmatched backticks.
- Preserve custom render bars for native videos and pending video headers.
- Keep quoted, nested, and unfinished Markdown code examples out of HTML and SVG
  rendering.
- Reuse bounded Markdown code ranges and skip unused parsing while typing.
- Preserve legacy quoted HTML payloads and their Markdown diagram boundaries.
- Preserve quoted and nested Markdown context around immediate native videos.
- Preserve headings, emphasis, and links around immediate native videos.
- Mount received videos inside GFM tables immediately while preserving table
  structure and inert code examples.
- Keep iframe examples inside inline and block math inert during video detection.
- Recognize the backend's complete HTML block-root set and keep HTML-looking
  comment and attribute contents inert during progressive rendering.
- Preserve native code blocks, alerts, details, lists, and tables while making
  their received HTML visible immediately; keep embedded widget resources in
  the sandbox.
- Preserve HTML indentation normalization and original source budgets in stable
  Markdown runs.
- Keep HTML and SVG examples in link metadata literal, including unfinished
  titles, without hiding real markup after invalid links.
- Keep image alt text literal during typing and streaming, including reference
  images whose definitions arrive later, while preserving final alt values.
- Preserve quoted and nested list code fences immediately after closed HTML
  blocks, including unfinished fences and container exits.
- Reveal thematic breaks, line breaks, and task checkboxes at their own prose
  source boundaries.
- Reveal ordinary Markdown containers when typing reaches their source start,
  while keeping received HTML and video ancestors immediately visible.
- Scan received snapshots once without recursively parsing Markdown suffixes.
- Preserve the complete received Markdown tree while typing around native
  videos, including preceding sibling containers, reference definitions, escaped
  characters, and entities.

## 0.2.30 - 2026-10-09

### Fixed

- Render received sandbox HTML progressively without applying the prose
  typewriter delay, while preserving typing order and stable iframe instances.

## 0.2.24 - 2026-09-04

### Added

- Added a configurable `sendShortcut` policy to `MarkdownFlowInput` so host
  applications can use Enter to send on desktop and preserve mobile newlines.

### Fixed

- Kept the legacy `markdown-flow-ui/dist/markdown-flow-ui.css` import path as
  a physical package file for existing applications.

## 0.2.15 - 2026-08-27

### Added

- Added Arabic and Thai localizations across the markdown renderer, editor, and slide player.
- Added right-to-left layout support for Arabic interfaces.

### Fixed

- Improved rendering, interaction, and localization coverage for markdown content and slide playback.

## 0.2.7 - 2026-07-28

### Fixed

- Kept slide interaction inputs focused across parent re-renders, callback updates, equivalent default-value arrays, mobile keyboard viewport resizes, and duplicate orientation events.
