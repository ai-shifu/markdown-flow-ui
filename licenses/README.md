# Vendored Markdown math components

The locally adapted `src/vendor/markdown-math/rehype-katex.js` preserves
the renderer's math transformation while using the supported KaTeX dependency
without a package-manager override.

- `rehype-katex.js` is from `rehype-katex@7.0.1`; see
  `remark-math.MIT.txt`.
- The built package bundles the parser from `remark-math@6.0.0` and
  `micromark-extension-math@3.1.0`; see the accompanying MIT licenses.

Revisit the adapter when upstream supports a patched KaTeX version, and
validate Markdown parsing and the generated math stylesheet before replacing it.
