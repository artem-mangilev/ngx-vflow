// Build libraries first. Installs actual local tarballs in an isolated temporary consumer.
// node .scratch/flow-design-system/check-consumer.mjs 20.0.0 5.8.3
// node .scratch/flow-design-system/check-consumer.mjs 21.0.0 5.9.3
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
const angular = process.argv[2] ?? '20.0.0';
const typescript = process.argv[3] ?? '5.8.3';
const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'vui-consumer-'));
const run = (command, args, cwd = work) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const tarballs = ['ngx-vflow', 'ui'].map((name) => {
  const info = JSON.parse(
    run('npm', ['pack', '--json', '--pack-destination', work], resolve(root, 'dist/libs', name)),
  )[0];
  return join(work, info.filename);
});
writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'vui-consumer', private: true, type: 'module' }));
console.log(
  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    ...tarballs,
    `@angular/core@${angular}`,
    `@angular/common@${angular}`,
    `@angular/cdk@${angular}`,
    `@angular/platform-browser@${angular}`,
    'zone.js@0.15.1',
    `@angular/compiler@${angular}`,
    `@angular/compiler-cli@${angular}`,
    `typescript@${typescript}`,
  ]),
);
writeFileSync(
  join(work, 'core.ts'),
  `import { Component } from '@angular/core';
import { Vflow, createNodes, createEdges } from 'ngx-vflow';
@Component({selector:'core-consumer', imports:[Vflow], template:\`<vflow [nodes]="nodes" [edges]="edges"><ng-template nodeHtml let-ctx><article>{{ctx.data().title}}<handle type="source" position="right" /></article></ng-template><ng-template edge let-ctx><svg:g customTemplateEdge selectable><svg:path [attr.d]="ctx.path()" stroke="black" fill="none" /></svg:g></ng-template></vflow>\`})
export class CoreConsumer { nodes = createNodes([{id:'a', type:'html-template', point:{x:0,y:0}, data:{title:'Own UI'}}]); edges = createEdges([]); }
`,
);
writeFileSync(
  join(work, 'ui.ts'),
  `import { Component } from '@angular/core';
import { Vflow } from 'ngx-vflow';
import { VflowUi } from '@vflow/ui';
import { VflowBpmn } from '@vflow/ui/bpmn';
@Component({selector:'ui-consumer', imports:[Vflow, VflowUi, VflowBpmn], template:\`<section vflowTheme="dark"><vflow #flow [nodes]="[]" /><vflow-controls [flow]="flow" /><article vflowNode><header vflowNodeHeader>Title</header><span vflowStatus="warning" [vflowStatusActive]="true">Checking</span></article><div vflowBpmnEvent="end"></div><div vflowBpmnGateway="parallel">+</div></section>\`})
export class UiConsumer {}
`,
);
for (const name of ['core', 'ui']) {
  writeFileSync(
    join(work, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'node',
        experimentalDecorators: true,
        skipLibCheck: true,
        strict: true,
        outDir: `out-${name}`,
      },
      angularCompilerOptions: { strictTemplates: true },
      files: [`${name}.ts`],
    }),
  );
  console.log(run(join(work, 'node_modules/.bin/ngc'), ['-p', 'tsconfig.json']));
}
const manifest = JSON.parse(readFileSync(join(work, 'node_modules/@vflow/ui/package.json'), 'utf8'));
for (const name of ['styles.css', 'styles.source.css']) {
  if (!manifest.exports['./' + name] || !readFileSync(join(work, 'node_modules/@vflow/ui', name), 'utf8').length)
    throw new Error('Missing CSS ' + name);
}
// Runtime smoke with a plain JS bundler: this consumer has no Tailwind dependency or plugin.
for (const name of ['core', 'ui']) {
  const component = name === 'core' ? 'CoreConsumer' : 'UiConsumer';
  writeFileSync(
    join(work, `main-${name}.ts`),
    `import 'zone.js'; import '@angular/compiler';
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ${component} } from './out-${name}/${name}.js';
document.body.innerHTML = '<${name}-consumer></${name}-consumer>';
bootstrapApplication(${component}, { providers: [provideZoneChangeDetection()] }).catch(error => { throw error; });
`,
  );
  await build({
    entryPoints: [join(work, `main-${name}.ts`)],
    bundle: true,
    outfile: join(work, `${name}.js`),
    platform: 'browser',
    target: 'es2022',
    format: 'esm',
  });
}
if (readFileSync(join(work, 'core.js'), 'utf8').includes('vui-node'))
  throw new Error('UI leaked into core-only bundle');
const server = createServer((request, response) => {
  if (request.url === '/core.js' || request.url === '/ui.js') {
    response.setHeader('content-type', 'text/javascript');
    response.end(readFileSync(join(work, request.url.slice(1))));
    return;
  }
  const css =
    request.url === '/core'
      ? ''
      : readFileSync(
          join(work, 'node_modules/@vflow/ui', request.url === '/source' ? 'styles.source.css' : 'styles.css'),
          'utf8',
        );
  response.setHeader('content-type', 'text/html');
  response.end(
    `<style>vflow { display:block; width:600px; height:300px; } ${css}</style><script type="module" src="/${request.url === '/core' ? 'core' : 'ui'}.js"></script>`,
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const outputs = [];
try {
  for (const mode of ['core', 'compiled', 'source']) {
    await page.goto(`http://127.0.0.1:${server.address().port}/${mode}`);
    await page.locator(mode === 'core' ? '.vflow-node article' : '.vui-bpmn-event').waitFor();
    if (mode !== 'core')
      outputs.push(
        await page.locator('.vui-node').evaluate((el) => {
          const css = getComputedStyle(el);
          return { color: css.color, background: css.backgroundColor, border: css.borderRadius };
        }),
      );
    if (mode === 'core' && (await page.locator('.vui-node').count()))
      throw new Error('Unexpected UI in core-only consumer');
  }
  if (JSON.stringify(outputs[0]) !== JSON.stringify(outputs[1])) throw new Error('CSS modes differ');
  if (outputs[0].background !== 'rgb(27, 40, 59)') throw new Error('Dark theme missing');
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  JSON.stringify({
    angular,
    typescript,
    work,
    coreOnly: 'ngc + Chromium passed',
    uiAndBpmn: 'ngc + Chromium passed',
    css: 'both tarball exports rendered identically; no Tailwind consumer dependency',
  }),
);
