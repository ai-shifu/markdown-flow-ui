# Dependency audit dispositions

`npm run audit:dependencies` audits both lockfiles against the official npm
registry. Unknown findings, command failures, invalid reports, inconsistent
counts, muted findings and unresolved dependency references fail the check.
The check does not omit development dependencies or raise a severity threshold.

## Legacy minimatch 3.1.5

The [maintainer advisory for GHSA-g3hv-75wg-m249](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249)
identifies pattern amplification in `firstPhasePreProcess()` and
`secondPhasePreProcess()` when `optimizationLevel >= 2`, demonstrated in
minimatch 10.2.6. The
[central advisory record](https://github.com/github/advisory-database/blob/main/advisories/github-reviewed/2026/10/GHSA-g3hv-75wg-m249/GHSA-g3hv-75wg-m249.json)
instead applies a range beginning at version zero.

The pinned [3.1.5 source](https://github.com/isaacs/minimatch/blob/v3.1.5/minimatch.js)
does not implement that optimizer or those preprocessing phases. We therefore
classify this specific advisory against that exact source as a false positive.
This is an inference from the affected mechanism and source, not a claim that
the registry's raw audit report has no findings. Modern minimatch consumers use
the patched release; legacy CommonJS consumers retain their callable API.

The disposition applies only when all of the following remain true:

- The advisory is exactly `GHSA-g3hv-75wg-m249`, for `minimatch`, at moderate severity.
- The finding is exactly version `3.1.5` and its published integrity is
  `sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==`.
- The installed `minimatch.js` SHA-256 is
  `746849f267c4868a53729225bd85c7dccd387712136fb305fcc0a3eadd4a3d9d`.
- Every affected npm node is a development dependency. Every pnpm finding path
  begins in a development dependency, matches the lockfile, and the production
  snapshot graph cannot reach legacy minimatch.
- Every dependency-carried npm finding follows declared dependency, optional or
  peer edges in the lockfile, resolving the nearest nested or hoisted instance.
  Each installed instance must reach the verified direct advisory; circular
  references or another instance alone do not satisfy that condition.

Any change to these conditions requires revalidation. Additional advisories,
versions or severities remain blocking. Remove this disposition when upstream
corrects its affected range or legacy consumers migrate to the modern API.

Regression checks run with `node --test tests/audit/*.test.mjs`.

## KaTeX 0.16.47

[GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7)
is a real low-severity vulnerability in a production dependency, not a false
positive. If another vulnerability has already polluted a prototype, KaTeX
may inherit renderer settings and internal metadata. Untrusted expressions
can then produce unsafe links or load external resources. The vulnerability
also affects namespace and resource-limit handling.

`rehype-katex` and `micromark-extension-math` currently depend on KaTeX 0.16.
The Markdown renderer explicitly sets `trust: false` to block the common
inherited `trust` path. This is a partial mitigation: polluted `processor` or
other metadata can still change KaTeX behavior. It does not fix the advisory,
protect other KaTeX entry points, or replace preventing prototype pollution.

Mermaid 12 resolves a separate patched KaTeX version. The build includes the
official 0.18 stylesheet through the `katex-mermaid-css` development
dependency for Mermaid's legacy HTML math output, alongside the 0.16 Markdown
stylesheet. Package tests compare those stylesheets and their font files with
the actual resolved renderers so dependency updates cannot silently break
either path.

The audit reports this known production risk and allows only this exact
advisory, low severity, version `0.16.47`, and published integrity
`sha512-Eeo8Ys1doU1z+x8AZsPpQu+p/QcZBI5PeOo7QGQdy2x2m0MU/hYagBbGOmXwr5KVbEfVuWv9LpnQWeehogurjg==`.
Every reported carrier must reach the advisory through lockfile dependency
edges. Additional advisories, versions, severities, invalid paths and
malformed reports remain blocking; the existing minimatch development-only
checks remain in force.

Upgrade the official dependencies when they support a patched KaTeX version,
remove this disposition, and rerun the security and formula regression tests.
