#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Reproduce the merged lockfile without changing package versions.
npm ci --include=dev --no-audit --no-fund

# Verify dependency compatibility without touching application data.
npm run test:dependencies
npm run build

# Workflow reconciliation restarts the app after this script succeeds.
# Do not apply database migrations or seed data from this hook.
