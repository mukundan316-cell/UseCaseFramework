---
name: Dependency compatibility
description: Non-obvious compatibility lessons from dependency security remediation
---

Do not treat a declared peer range or a successful package installation as proof
that a security upgrade is compatible.

**Why:** drizzle-zod advertised Zod 3 peer compatibility while generating Zod 4
schemas, breaking existing refinements. The latest esbuild also rejected the
existing Vite browser targets. Patched earlier release lines avoided changing
application validation or browser support.

**How to apply:** Exercise generated schemas and a production build, not just
installation or an audit. Read `docs/dependency-security.md` before changing
security overrides; it records the compatibility evidence and verification
boundaries.

Prefer a genuinely hardened compatible spreadsheet fork over republishing or
aliasing the official SheetJS tarball solely to avoid scanner findings.

**Why:** The official latest SheetJS release already contained the publisher's
fixes, but scanner metadata marked every release of the original package as
affected. The hardened fork was chosen for its additional protections and
preservation of legacy XLS support, not just its different package identity.

**How to apply:** Verify published security guards, malicious-input regressions,
and both supported formats through application services when reconsidering
the spreadsheet dependency. Do not remove XLS support as an incidental
consequence of security remediation.
