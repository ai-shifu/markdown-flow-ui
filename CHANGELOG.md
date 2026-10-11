# Changelog

## 0.2.34 - 2026-10-11

### Fixed

- Fit ordinary sandbox blocks to their content instead of reserving a minimum
  16:9 slide, removing excess blank space below compact lesson cards.
- Preserve a separate iframe layout viewport for viewport-relative sizes and
  fixed-position controls, while following content growth, collapse and image
  loads without rebuilding the iframe.
- Keep authored spacing, blackboard sizing and sandbox permissions unchanged.

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
