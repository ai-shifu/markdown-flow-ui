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
- Every dependency-carried npm finding reaches the verified direct advisory;
  circular references alone do not satisfy that condition.

Any change to these conditions requires revalidation. Additional advisories,
versions or severities remain blocking. Remove this disposition when upstream
corrects its affected range or legacy consumers migrate to the modern API.

Regression checks run with `node --test tests/audit/*.test.mjs`.
