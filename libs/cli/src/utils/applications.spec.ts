import { addProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { prompt } from 'enquirer';
import { getApplications, resolveApplication } from './applications';

vi.mock('enquirer', () => ({ prompt: vi.fn() }));

function add(tree: Tree, name: string, projectType: 'application' | 'library') {
  addProjectConfiguration(tree, name, { root: `${projectType}s/${name}`, projectType });
}

describe('applications', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('getApplications', () => {
    it('lists applications and leaves libraries out', () => {
      add(tree, 'shop', 'application');
      add(tree, 'shared', 'library');

      expect([...getApplications(tree).keys()]).toEqual(['shop']);
    });
  });

  describe('resolveApplication', () => {
    it('takes the only application without asking', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'true');
      add(tree, 'shop', 'application');

      const project = await resolveApplication(tree, undefined);

      expect(project).toMatchObject({ name: 'shop', root: 'applications/shop' });
      expect(prompt).not.toHaveBeenCalled();
    });

    it('takes the application named by --project among several', async () => {
      add(tree, 'shop', 'application');
      add(tree, 'admin', 'application');

      expect((await resolveApplication(tree, 'admin')).name).toBe('admin');
    });

    it('refuses a project that is a library and lists the applications', async () => {
      add(tree, 'shop', 'application');
      add(tree, 'shared', 'library');

      await expect(resolveApplication(tree, 'shared')).rejects.toThrow(
        '"shared" is not an application in this workspace. Choose one of: shop.',
      );
    });

    it('refuses a workspace without applications', async () => {
      add(tree, 'shared', 'library');

      await expect(resolveApplication(tree, undefined)).rejects.toThrow('no application');
    });

    it('asks which application when there are several and a terminal', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'true');
      add(tree, 'shop', 'application');
      add(tree, 'admin', 'application');
      vi.mocked(prompt).mockResolvedValue({ project: 'admin' });

      expect((await resolveApplication(tree, undefined)).name).toBe('admin');
      expect(prompt).toHaveBeenCalledWith(expect.objectContaining({ choices: ['shop', 'admin'] }));
    });

    it('names the choices instead of asking without a terminal', async () => {
      vi.stubEnv('NX_INTERACTIVE', 'false');
      add(tree, 'shop', 'application');
      add(tree, 'admin', 'application');

      await expect(resolveApplication(tree, undefined)).rejects.toThrow('Pass --project with one of: shop, admin');
      expect(prompt).not.toHaveBeenCalled();
    });
  });
});
