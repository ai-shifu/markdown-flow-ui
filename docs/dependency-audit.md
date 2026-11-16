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

## Development-only KaTeX 0.16.47

[GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7)
reports a real low-severity vulnerability, not a false positive. If another
vulnerability has already polluted a prototype, affected KaTeX versions can
inherit renderer options such as `trust`; attacker-controlled expressions may
then produce unsafe links or external resource loads when rendered output is
inserted into a page without separate sanitization. This project accepts the
remaining risk only for the development tooling dependency described below.

`markdownlint-cli` and the development-only `remark-math` dependency reach
`micromark-extension-math`, which currently requires KaTeX `^0.16.0`; the
installed version is `0.16.47`. Its published integrity must be exactly
`sha512-Eeo8Ys1doU1z+x8AZsPpQu+p/QcZBI5PeOo7QGQdy2x2m0MU/hYagBbGOmXwr5KVbEfVuWv9LpnQWeehogurjg==`.
The audit disposition accepts only this exact version, integrity, advisory and
low severity. Every reported npm node must be development-only and each carrier
must reach the advisory through real lockfile dependency edges. Each pnpm path
must start at a development dependency and match the lockfile. Both production
graphs are independently traversed and reject every affected version in the
advisory range `>=0.11.0 <0.18.2`, even when the audit report omits a path or
marks a production-reachable node as development-only. Other advisories,
versions, severities, missing paths and malformed reports remain blocking.

Revisit this acceptance when `micromark-extension-math` or its consumers
support a patched KaTeX version (at least 0.18.2), or a compatible replacement
is available. Upgrade the development toolchain, verify both lockfiles and
remove this disposition and its acceptance tests once neither lockfile retains
the vulnerable dependency. Do not force an incompatible major version merely
to silence the audit.
