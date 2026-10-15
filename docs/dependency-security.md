# Dependency security maintenance

## Verification (15 October 2026)

The supplied vulnerable versions have been upgraded or replaced. `npm audit`
reports **zero vulnerabilities** across development and runtime dependencies.
Run `npm run test:dependencies` to exercise the compatibility and depth-guard
regressions without connecting to a database or changing application data.

Verification performed:
- Production build passed.
- All 8 dependency regression tests passed.
- Existing Excel validation tests passed (7 tests).
- Existing governance tests passed (22 tests).
- Drizzle's CLI generated the schema successfully into a temporary directory;
  no migration was applied to a database.
- The restarted application served the dashboard without browser errors, and
  the use-case read API returned data.
- Type checking reported 66 errors versus 67 before the updates, with no new
  error locations. Those existing application errors remain out of scope.

The Replit dependency scanner still reports two SheetJS findings on `xlsx@0.20.3`.
Its returned advisory ranges have no fixed version and classify all `xlsx`
versions as affected. These are a scanner-metadata discrepancy, not ignored
findings: the publisher documents fixes in 0.19.3 (prototype pollution) and
0.20.2 (regular-expression denial of service). The installed 0.20.3 release
contains both fixes. Do not describe the Replit scanner as clean while it
continues to return these findings.

Sources:
- https://docs.sheetjs.com/docs/getting-started/installation/nodejs/
- https://cdn.sheetjs.com/advisories/CVE-2023-30533
- https://cdn.sheetjs.com/advisories/CVE-2024-22363
- https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
- https://github.com/advisories/GHSA-5pgg-2g8v-p4x9

## Nonstandard resolutions

- **SheetJS:** install the fixed release from the publisher's official tarball,
  not npm's abandoned 0.18.5 release. Keep the lockfile's integrity hash.
  This preserves both `.xls` and `.xlsx` support and existing workbook APIs.
- **Braces:** upstream 3.0.3 has no published patch for
  GHSA-vfj7-8cjw-p6xm. The override pins the MIT-licensed
  `@dieub/braces-depth-guard@3.0.3-pn.2` derivative, which backports the depth
  guards from upstream pull request 72. Its published runtime was inspected for
  parser, compile, stringify and expand depth checks, plus cyclic-parent checks.
  It caps brace/parenthesis nesting and recursive AST traversal at 100 levels.
  Regression tests verify both normal patterns and malicious inputs through
  the actual micromatch/chokidar dependency paths. This is a third-party
  derivative, not an upstream release; it does not claim protection against
  every possible resource-exhaustion input. Revisit when upstream releases a
  patch rather than updating this override blindly.
  Sources: https://github.com/dieub/braces-depth-guard and
  https://github.com/micromatch/braces/pull/72
- **Coverage YAML:** the coverage-config loader uses `load`, which is supported
  by js-yaml 4. Its scoped override removes the vulnerable, unpatched
  `sprintf-js` dependency brought in by the older js-yaml 3/argparse 1 chain.
- **Esbuild:** all toolchain copies resolve to the patched 0.25 release line.
  The newest 0.28 release is not compatible with Vite 6's existing browser
  targets. Test production builds before changing this resolution.
- **Drizzle/Zod:** retain drizzle-zod 0.7 with patched Drizzle ORM.
  drizzle-zod 0.8 generates Zod 4 schemas despite a Zod 3-compatible peer
  range; the app's schema refinements use Zod 3.
- Other overrides keep patched transitive versions within their existing major
  branches where possible. The selector-parser override crosses from 6 to 7
  because older releases remain vulnerable; production CSS generation must
  continue to be tested.

Keep Survey.js core, React UI and PDF on matching versions. Preserve the
jsPDF/proxy-addr security overrides unless their parent dependencies resolve
patched versions without them. Commit manifest and lockfile changes together.

## Verification boundaries

This work addresses dependencies, not application authentication, authorization,
privacy, or a full security review. Type checking already failed before these
updates; compare errors with the baseline rather than calling it a passing
check. Do not deploy or alter the database as part of dependency verification.
