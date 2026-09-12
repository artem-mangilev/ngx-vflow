// Verifies the two consumer builds made from the published packages:
// - core-only: no trace of @vflow/ui in scripts or styles, while the core is present;
// - ui: the compiled stylesheet is included as-is (no Tailwind directives left) and the BPMN entry is bundled.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (dir, ext) =>
  readdirSync(dir)
    .filter((name) => name.endsWith(ext))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .join('\n');

const core = join(root, 'dist/apps/consumer-core-only/browser');
const coreJs = read(core, '.js');
const coreCss = read(core, '.css');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
assert(coreJs.includes('vflow-root'), 'core-only build does not contain ngx-vflow');
assert(!/vui-|vui\\:|@vflow\/ui/.test(coreJs + coreCss), 'core-only build contains @vflow/ui code or classes');

const ui = join(root, 'dist/apps/consumer-ui/browser');
const uiJs = read(ui, '.js');
const uiCss = read(ui, '.css');
assert(uiJs.includes('vui-bpmn-task'), 'ui build does not bundle @vflow/ui/bpmn');
assert(uiJs.includes('vui-controls'), 'ui build does not bundle vflow-controls');
assert(/\.vui\\:bg-surface/.test(uiCss), 'ui build stylesheet lacks the compiled utilities');
assert(!/@theme|@source|@import ['"]tailwindcss/.test(uiCss), 'ui build stylesheet still contains Tailwind directives');
console.log('Consumer builds verified: core-only without UI, ui with compiled CSS and the BPMN entry.');
