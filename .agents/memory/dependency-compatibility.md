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
security overrides; it records the compatibility evidence and explains why
the two SheetJS scanner findings disagree with the publisher's fixed releases.
