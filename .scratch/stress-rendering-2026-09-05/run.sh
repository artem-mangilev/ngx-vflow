#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../.."
target=projects/ngx-vflow-lib/src/lib/vflow/stress-benchmark.tmp.spec.ts
test ! -e "$target"
trap 'rm -f "$target"' EXIT
cp .scratch/stress-rendering-2026-09-05/stress-benchmark.spec.ts "$target"
npx ng test ngx-vflow-lib --watch=false --browsers=ChromeHeadless --progress=false --include='**/stress-benchmark.tmp.spec.ts'
