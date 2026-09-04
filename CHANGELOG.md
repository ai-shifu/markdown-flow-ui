# Changelog

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
