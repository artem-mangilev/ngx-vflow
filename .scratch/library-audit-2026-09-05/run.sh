#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../.."
npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless --progress=false --include='**/audit-regressions.spec.ts'
