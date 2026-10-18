// Smoke test of @vflow/cli on fresh projects, the path of a new consumer: `ng new` with Angular 20 and 21 and a fresh
// Nx workspace, Tailwind v4 set up as its guide says, the local ngx-vflow and @vflow/cli tarballs, `init` + `ui`, a
// production build, and a check in Chromium that a flow with nodes, ports, an edge, controls and a status renders in
// the light and the dark theme. It needs the network and takes minutes, so it is not part of CI.
//
//   nx run consumer:smoke                       every target
//   node apps/consumer/scripts/smoke-generators.mjs angular@21 nx@21
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { delimiter, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const { chromium } = createRequire(join(root, 'package.json'))('@playwright/test');
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['angular@20', 'angular@21', 'nx@21'];
const work = mkdtempSync(join(tmpdir(), 'vflow-smoke-'));
// npm 10 (Node 22) fails with "Cannot read properties of null (reading 'edgesOut')" on a fresh Angular 21 or Nx 22
// workspace, before vflow is involved, so the projects are created and installed with npm 11.
const npm11 = dirname(execFileSync('npx', ['-y', '-p', 'npm@11', 'which', 'npm'], { encoding: 'utf8' }).trim());
const env = {
  ...process.env,
  PATH: `${npm11}${delimiter}${process.env.PATH}`,
  NG_CLI_ANALYTICS: 'false',
  NX_DAEMON: 'false',
  NX_NO_CLOUD: 'true',
};
const quiet = ['--no-audit', '--no-fund', '--loglevel=error'];

const run = (cwd, command, ...args) => {
  console.log(`\n$ ${[command, ...args].join(' ')}   (${cwd})`);
  execFileSync(command, args, { cwd, env, stdio: 'inherit' });
};
const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
};
const pack = (dist) =>
  join(
    work,
    execFileSync('npm', ['pack', dist, '--pack-destination', work], { encoding: 'utf8' }).trim().split('\n').pop(),
  );

const tarballs = { core: pack(join(root, 'dist/libs/ngx-vflow')), cli: pack(join(root, 'dist/libs/cli')) };

/** The demo every project renders: one editor per theme, each with its own flow and controls. */
const MAIN = `import { ChangeDetectionStrategy, Component, input, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  selector: 'smoke-editor',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { position: relative; display: block; height: 320px; } vui-controls { position: absolute; left: 8px; bottom: 8px; z-index: 2; } article { width: 200px; }',
  template: \`
    <vflow view="auto" [nodes]="nodes" [edges]="edges">
      <ng-template let-ctx vNode>
        <article vuiNode [selected]="ctx.selected()">
          <header vuiNodeHeader><span vuiTitle>{{ ctx.data().title }}</span></header>
          <footer vuiNodeFooter><span vuiStatus="success">Running</span></footer>
          @if (ctx.node.id === 'target') {
            <span vuiPort handleType="target" position="left"></span>
          } @else {
            <span vuiPort handleType="source" position="right"></span>
          }
        </article>
      </ng-template>
      <ng-template let-ctx vEdge>
        <svg:g vEdgeInteraction>
          <svg:path vuiEdge [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" [selected]="ctx.selected()" />
        </svg:g>
      </ng-template>
    </vflow>
    @if (flow(); as flow) {
      <vui-controls [flow]="flow" />
    }
  \`,
})
class Editor {
  readonly flow = viewChild(VflowComponent);
  readonly nodes = createNodes([
    { id: 'source', point: { x: 20, y: 40 }, ariaLabel: 'Source', data: { title: 'Source' } },
    { id: 'target', point: { x: 320, y: 60 }, ariaLabel: 'Target', data: { title: 'Target' } },
  ]);
  readonly edges = createEdges([
    { id: 'source-target', source: 'source', target: 'target', curve: 'smooth-step', markers: { end: {} } },
  ]);
}

@Component({
  selector: 'smoke-root',
  imports: [Editor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <section data-testid="light" data-vui-theme="light"><smoke-editor /></section>
    <section data-testid="dark" data-vui-theme="dark"><smoke-editor /></section>
  \`,
})
class Root {}

bootstrapApplication(Root, { providers: [provideZonelessChangeDetection()] }).catch((error) => console.error(error));
`;
const INDEX =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>vflow smoke</title><base href="/"></head><body><smoke-root></smoke-root></body></html>';
// The ui section is written up front: its questions need a terminal, and the unit tests cover them.
const VFLOW = { ui: { componentsPath: 'libs/ui', importAlias: '@vflow/ui', buildable: false } };

/** Tailwind v4 the way its framework guide sets it up for Angular. */
function setupTailwind(cwd, appRoot) {
  run(cwd, 'npm', 'install', ...quiet, 'tailwindcss@4', '@tailwindcss/postcss@4', 'postcss');
  write(join(appRoot, '.postcssrc.json'), { plugins: { '@tailwindcss/postcss': {} } });
  const styles = join(appRoot, 'src/styles.css');
  write(styles, `@import 'tailwindcss';\n${existsSync(styles) ? readFileSync(styles, 'utf8') : ''}`);
}

/**
 * The local ngx-vflow, which `init` would otherwise add from npm, with its peer @angular/cdk in the major of the
 * project's Angular, as `init` adds it.
 */
function installCore(cwd) {
  const { dependencies } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const major = /\d+/.exec(dependencies['@angular/core'])[0];
  run(cwd, 'npm', 'install', ...quiet, tarballs.core, `@angular/cdk@^${major}.0.0`);
}

function angularCli(version) {
  const cwd = join(work, `angular-${version}`);
  run(
    work,
    'npx',
    '-y',
    `@angular/cli@${version}`,
    'new',
    'app',
    `--directory=angular-${version}`,
    '--defaults',
    '--skip-git',
    '--skip-tests',
    '--style=css',
    '--ssr=false',
    '--routing=false',
  );
  setupTailwind(cwd, cwd);
  installCore(cwd);
  run(cwd, 'npm', 'install', ...quiet, '-D', tarballs.cli);
  write(join(cwd, 'vflow.json'), VFLOW);
  run(cwd, 'npx', 'ng', 'g', '@vflow/cli:init');
  run(cwd, 'npx', 'ng', 'g', '@vflow/cli:ui');
  write(join(cwd, 'src/main.ts'), MAIN);
  write(join(cwd, 'src/index.html'), INDEX);
  run(cwd, 'npx', 'ng', 'build');
  return join(cwd, 'dist/app/browser');
}

function nx(version) {
  const cwd = join(work, `nx-${version}`);
  run(
    work,
    'npx',
    '-y',
    `create-nx-workspace@${version}`,
    `nx-${version}`,
    '--preset=angular-monorepo',
    '--appName=app',
    '--style=css',
    '--bundler=esbuild',
    '--e2eTestRunner=none',
    '--unitTestRunner=none',
    '--ssr=false',
    '--routing=false',
    '--nxCloud=skip',
    '--packageManager=npm',
    '--interactive=false',
    '--skipGit=true',
  );
  setupTailwind(cwd, join(cwd, 'apps/app'));
  installCore(cwd);
  run(cwd, 'npm', 'install', ...quiet, '-D', tarballs.cli);
  write(join(cwd, 'vflow.json'), VFLOW);
  run(cwd, 'npx', 'nx', 'g', '@vflow/cli:init', '--project=app');
  run(cwd, 'npx', 'nx', 'g', '@vflow/cli:ui');
  write(join(cwd, 'apps/app/src/main.ts'), MAIN);
  write(join(cwd, 'apps/app/src/index.html'), INDEX);
  run(cwd, 'npx', 'nx', 'build', 'app', '--skip-nx-cache');
  return join(cwd, 'dist/apps/app/browser');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ico': 'image/x-icon' };
function serve(dir) {
  const server = createServer((request, response) => {
    let path = join(dir, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    if (!existsSync(path) || path.endsWith('/')) path = join(dir, 'index.html');
    response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    response.end(readFileSync(path));
  });
  return new Promise((done) => server.listen(0, () => done(server)));
}

/** What a consumer would see: every part rendered, and the theme values reaching the parts and the core tokens. */
async function check(target, dir) {
  const server = await serve(dir);
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    await page.goto(`http://localhost:${server.address().port}/`);
    await page.locator('[data-testid=dark] .vui-node').first().waitFor();
    await page.locator('[data-testid=dark] path.vui-edge').first().waitFor({ state: 'attached' });
    const editors = await page.evaluate(() =>
      ['light', 'dark'].map((theme) => {
        const scope = document.querySelector(`[data-testid=${theme}]`);
        const node = scope.querySelector('.vui-node');
        const style = node && getComputedStyle(node);
        return {
          theme,
          nodes: scope.querySelectorAll('.vui-node').length,
          ports: scope.querySelectorAll('.vui-port').length,
          edge: !!scope.querySelector('path.vui-edge')?.getAttribute('d'),
          controls: scope.querySelectorAll('vui-controls button').length,
          status: scope.querySelector('.vui-status')?.textContent?.trim(),
          background: style?.backgroundColor,
          radius: style?.borderTopLeftRadius,
          coreSurface: getComputedStyle(scope).getPropertyValue('--v-surface').trim(),
        };
      }),
    );
    await page.screenshot({ path: join(work, `${target}.png`), fullPage: true });

    const expected = { light: 'rgb(255, 255, 255)', dark: 'rgb(44, 44, 46)' };
    const problems = [...errors.map((error) => `page error: ${error}`)];
    for (const editor of editors) {
      const fail = (message) => problems.push(`${editor.theme}: ${message} (${JSON.stringify(editor)})`);
      if (editor.nodes !== 2) fail('expected 2 nodes');
      if (editor.ports < 2) fail('expected ports');
      if (!editor.edge) fail('expected a drawn edge');
      if (editor.controls < 3) fail('expected zoom in, zoom out and fit view');
      if (editor.status !== 'Running') fail('expected the status');
      if (editor.background !== expected[editor.theme]) fail(`node background should be ${expected[editor.theme]}`);
      if (editor.radius !== '10px') fail('node radius should come from the vui scale (10px)');
      if (!editor.coreSurface) fail('the theme scope should map onto the core tokens');
    }
    return problems;
  } finally {
    await browser.close();
    server.close();
  }
}

const results = [];
for (const target of targets) {
  const [kind, version] = target.split('@');
  try {
    const dist = kind === 'nx' ? nx(version) : angularCli(version);
    const problems = await check(target, dist);
    results.push({ target, problems });
  } catch (error) {
    results.push({ target, problems: [error.message.split('\n')[0]] });
  }
}

console.log(`\nSmoke projects and screenshots: ${work}`);
for (const { target, problems } of results) {
  console.log(`${problems.length ? '✗' : '✓'} ${target}${problems.map((problem) => `\n    ${problem}`).join('')}`);
}
process.exit(results.some(({ problems }) => problems.length) ? 1 : 0);
