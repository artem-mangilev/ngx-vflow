// Run after `nx build ui`: install packed artifacts outside the workspace, without Tailwind.
import { mkdtempSync, cpSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const directory = mkdtempSync(join(tmpdir(), 'vflow-angular21-'));
const run = (command, args) => execFileSync(command, args, { cwd: directory, stdio: 'inherit' });
const json = (name, value) => writeFileSync(join(directory, name), JSON.stringify(value, null, 2));
const pack = (path) => {
  const output = execFileSync('npm', ['pack', resolve(path), '--json', '--pack-destination', directory], {
    encoding: 'utf8',
  });
  return `file:${join(directory, JSON.parse(output)[0].filename)}`;
};
cpSync('apps/ui-consumer/src', join(directory, 'src'), { recursive: true });
json('package.json', {
  private: true,
  dependencies: {
    ...Object.fromEntries(
      ['core', 'common', 'compiler', 'compiler-cli', 'platform-browser', 'cli', 'build', 'cdk'].map((name) => [
        `@angular/${name}`,
        '^21.0.0',
      ]),
    ),
    typescript: '~5.9.3',
    rxjs: '^7.8.0',
    tslib: '^2.3.0',
    'ngx-vflow': pack('dist/libs/ngx-vflow'),
    '@vflow/ui': pack('dist/libs/ui'),
  },
});
json('tsconfig.json', {
  compilerOptions: {
    target: 'ES2022',
    module: 'ES2022',
    moduleResolution: 'bundler',
    experimentalDecorators: true,
    skipLibCheck: true,
    strict: true,
    lib: ['ES2022', 'dom'],
  },
  angularCompilerOptions: { strictTemplates: true },
  files: ['src/main.ts', 'src/main-core.ts'],
});
json('angular.json', {
  version: 1,
  projects: {
    consumer: {
      projectType: 'application',
      root: '',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: { browser: 'src/main.ts', index: 'src/index.html', tsConfig: 'tsconfig.json', outputPath: 'dist' },
          configurations: {
            compiled: { styles: ['node_modules/@vflow/ui/styles.css'] },
            source: { styles: ['node_modules/@vflow/ui/styles.source.css'] },
            core: { browser: 'src/main-core.ts', styles: [] },
          },
        },
      },
    },
  },
});
console.log(`Isolated Angular 21 consumer: ${directory}`);
run('npm', ['install', '--no-audit', '--no-fund']);
for (const mode of ['compiled', 'source', 'core']) run('npx', ['ng', 'build', '--configuration', mode]);
