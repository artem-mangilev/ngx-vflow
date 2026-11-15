// Copies the built libraries and the @vflow/ui sources to apps/docs/libs, see libs.mjs.
// `docs:libs` runs it after the builds of the libraries; `pnpm start` keeps the copies current on its own.
import { mirrors, syncAll } from './libs.mjs';

const missing = syncAll((line) => console.log(`[libs] ${line}`));
if (missing.length) {
  console.error(
    `[libs] Not built: ${missing.join(', ')}. Run \`pnpm nx run-many -t build -p tag:release\` first, or \`pnpm start\`.`,
  );
  process.exit(1);
}
console.log(`[libs] ${mirrors.length} libraries are up to date in apps/docs/libs.`);
