// `pnpm start`: the docs dev server on top of the libraries built into dist.
//
//   libs/<name>/src ── ng-packagr --watch (Angular of the root) ──▶ dist/libs/<name>
//   dist/libs/<name>, libs/ui/src ── copy (libs.mjs) ──▶ apps/docs/libs
//   apps/docs ── ng serve (Angular of the docs) ──▶ http://localhost:4200
//
// Saving a library file rebuilds its package, the copy follows and the dev server reloads the page.
// Arguments go to `ng serve`, e.g. `pnpm start --configuration production --port 4300`;
// `--verbose` shows the whole output of ng-packagr.
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { docsRoot, mirrors, packages, syncAll, syncAndReport, watchMirror, workspaceRoot } from './libs.mjs';

const serveArgs = process.argv.slice(2).filter((arg) => arg !== '--verbose');
const verbose = process.argv.includes('--verbose');
const children = new Set();
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  // The file watchers keep the process alive.
  setTimeout(() => process.exit(code), 300).unref();
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

const log = (label) => (line) => console.log(`[${label}] ${line}`);

/** Runs a binary of a package; every line of its output goes to `onLine`. */
function run(label, packageRoot, bin, args, onLine) {
  const child = spawn(join(packageRoot, 'node_modules/.bin', bin), args, {
    cwd: packageRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
  });
  children.add(child);
  for (const stream of [child.stdout, child.stderr]) {
    let rest = '';
    stream.on('data', (chunk) => {
      const lines = (rest + chunk).split('\n');
      rest = lines.pop();
      for (const line of lines) if (plain(line).trim()) onLine(line);
    });
  }
  child.on('exit', (code) => {
    children.delete(child);
    if (stopping) return;
    console.error(`[${label}] exited with code ${code}`);
    stop(code ?? 1);
  });
}

// The progress of every entry point: one line per build is enough next to the output of the dev server.
const progress = /^\s*(-{5,}|[-✔] |Building entry point|Built |Build at:)/;
// eslint-disable-next-line no-control-regex
const plain = (line) => line.replace(/\x1b\[[0-9;]*m/g, '');

/**
 * Starts ng-packagr in watch mode and resolves after its first successful build. The production configuration is
 * the published one: partial compilation, which the Angular of the docs links like the one of any application.
 * The package is copied when ng-packagr reports a complete build, never in the middle of its writes.
 *
 * The watcher of an extension also follows the built core. After a change of the core it builds while the core is
 * still being written, which can fail, and again once the core is complete. So a failed build is reported only if
 * no other build follows it at once; ng-packagr builds again after the next change.
 */
function watchPackage(name) {
  const mirror = mirrors.find((item) => item.name === name);
  const print = log(name);
  let build = [];
  let failure;

  return new Promise((resolve) => {
    run(
      name,
      workspaceRoot,
      'ng-packagr',
      ['--project', `libs/${name}/ng-package.json`, '--config', `libs/${name}/tsconfig.lib.prod.json`, '--watch'],
      (line) => {
        const text = plain(line);
        const complete = text.includes('Compilation complete');
        if (verbose) {
          print(line);
        } else {
          if (text.includes('File change detected')) {
            clearTimeout(failure);
            build = [];
          }
          if (!progress.test(text)) build.push(line);
          if (text.includes('Compilation failed')) {
            const lines = build;
            failure = setTimeout(() => lines.forEach(print), 1500);
          }
          if (complete) {
            build.forEach(print);
            build = [];
          }
        }
        if (!complete) return;
        syncAndReport(mirror, log('libs'));
        resolve();
      },
    );
  });
}

const [core, ...extensions] = packages;

// The extensions compile against the built core, so it comes first.
await watchPackage(core);
await Promise.all(extensions.map(watchPackage));

const missing = syncAll(log('libs'));
if (missing.length) {
  console.error(`[libs] Not built: ${missing.join(', ')}.`);
  stop(1);
} else {
  watchMirror(
    mirrors.find((item) => item.name === 'ui'),
    log('libs'),
  );
  run('docs', docsRoot, 'ng', ['serve', ...serveArgs], log('docs'));
}
