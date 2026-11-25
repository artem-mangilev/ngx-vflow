import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { USAGE } from './options';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

/** The bin runs on import and reports through the console and `process.exitCode`; this loads it for one argv. */
async function load(argv: string[], cwd = process.cwd()) {
  vi.resetModules();
  vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'vflow', ...argv]);
  vi.spyOn(process, 'cwd').mockReturnValue(cwd);
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  process.exitCode = undefined;

  await import('./vflow');
  return { log, error };
}

describe('vflow bin', () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  it.each([[[]], [['--help']], [['-h']]])('prints the usage and succeeds for %j', async (argv) => {
    const { log } = await load(argv);

    await vi.waitFor(() => expect(log).toHaveBeenCalledWith(USAGE));
    expect(process.exitCode).toBe(0);
  });

  it('prints the usage and fails for an unknown command', async () => {
    const { log } = await load(['init']);

    await vi.waitFor(() => expect(log).toHaveBeenCalledWith(USAGE));
    expect(process.exitCode).toBe(1);
  });

  describe('ui', () => {
    let dir: string;

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'vflow-cli-'));
    });

    it('fails outside a workspace and says so', async () => {
      const { error } = await load(['ui'], dir);

      await vi.waitFor(() =>
        expect(error).toHaveBeenCalledWith(expect.stringContaining('No angular.json or nx.json here')),
      );
      expect(process.exitCode).toBe(1);
    });

    it('fails on an unknown option', async () => {
      writeFileSync(join(dir, 'angular.json'), '{}');

      const { error } = await load(['ui', '--color'], dir);

      await vi.waitFor(() => expect(error).toHaveBeenCalledWith(expect.stringContaining('Unknown option --color')));
      expect(process.exitCode).toBe(1);
    });

    it('sets up an Angular CLI workspace on disk', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'false');
      const version = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8')).version;
      const json = (path: string, value: unknown) => writeFileSync(join(dir, path), JSON.stringify(value));
      json('package.json', {
        name: 'app',
        // ngx-vflow is already there, so no package manager runs.
        dependencies: { '@angular/core': '~20.3.0', 'ngx-vflow': `^${version}` },
        devDependencies: { tailwindcss: '^4.1.0' },
      });
      json('angular.json', {
        version: 1,
        projects: { app: { root: '', sourceRoot: 'src', projectType: 'application', architect: {} } },
      });
      json('tsconfig.json', { compilerOptions: {} });
      json('tsconfig.app.json', { files: ['src/main.ts'] });
      mkdirSync(join(dir, 'src'));
      writeFileSync(join(dir, 'src/styles.css'), "@import 'tailwindcss';\n");

      const { error } = await load(['ui'], dir);

      await vi.waitFor(() =>
        expect(readFileSync(join(dir, 'libs/vflow-ui/src/lib/node.directive.ts'), 'utf-8')).toContain('VuiNode'),
      );
      expect(error).not.toHaveBeenCalled();
      expect(JSON.parse(readFileSync(join(dir, 'tsconfig.json'), 'utf-8')).compilerOptions.paths['@vflow/ui']).toEqual([
        './libs/vflow-ui/src/index.ts',
      ]);
    });
  });
});
