import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lastValueFrom } from 'rxjs';
import ui from './ui/compat';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

const root = join(__dirname, '../..');

/** An Angular CLI workspace without Nx: angular.json and one application; no terminal, so nothing is asked. */
function angularCliWorkspace(): UnitTestTree {
  const tree = new UnitTestTree(new HostTree());
  const json = (path: string, value: unknown) => tree.create(path, JSON.stringify(value));
  json('package.json', {
    name: 'app',
    dependencies: { '@angular/core': '~20.3.0' },
    devDependencies: { tailwindcss: '^4.1.0' },
  });
  json('angular.json', {
    version: 1,
    projects: { app: { root: '', sourceRoot: 'src', projectType: 'application', architect: {} } },
  });
  json('tsconfig.json', { compilerOptions: {} });
  json('tsconfig.app.json', { files: ['src/main.ts'] });
  tree.create('src/styles.css', "@import 'tailwindcss';\n");
  return tree;
}

describe('Angular CLI schematics', () => {
  beforeEach(() => vi.stubEnv('NX_INTERACTIVE', 'false'));
  const runner = new SchematicTestRunner('@vflow/cli', join(root, 'generators.json'));

  it('lists every generator as a schematic with the same schema', () => {
    const { generators, schematics } = JSON.parse(readFileSync(join(root, 'generators.json'), 'utf-8'));
    expect(Object.keys(schematics)).toEqual(Object.keys(generators));
    for (const [name, schematic] of Object.entries<{ factory: string; schema: string }>(schematics)) {
      expect(schematic.factory).toBe(`./src/generators/${name}/compat`);
      expect(schematic.schema).toBe(generators[name].schema);
    }
  });

  it('ui adds ngx-vflow and the tokens, and maps the alias in tsconfig instead of creating an Nx library', async () => {
    const tree = angularCliWorkspace();
    await lastValueFrom(runner.callRule(ui({}), tree));

    expect(JSON.parse(tree.readContent('package.json')).dependencies['ngx-vflow']).toMatch(/^\^\d/);
    expect(tree.readContent('src/styles.css')).toContain("@import './vflow-ui.css';");
    expect(tree.readContent('src/vflow-ui.css')).toContain('@theme inline');

    expect(JSON.parse(tree.readContent('tsconfig.json')).compilerOptions.paths['@vflow/ui']).toEqual([
      './libs/vflow-ui/src/index.ts',
    ]);
    expect(tree.exists('libs/vflow-ui/src/lib/node.directive.ts')).toBe(true);
    expect(tree.exists('libs/vflow-ui/project.json')).toBe(false);
  });
});
