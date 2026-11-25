import { getProjects, type ProjectConfiguration, type Tree } from '@nx/devkit';
import { prompt } from 'enquirer';
import { isInteractive } from './install';

/**
 * The application a generator works on: `--project`, the only application of the workspace, or the answer to a
 * question. Libraries are never offered. Reads `project.json` files in Nx and `angular.json` in Angular CLI.
 */
export async function resolveApplication(
  tree: Tree,
  project: string | undefined,
): Promise<ProjectConfiguration & { name: string }> {
  const applications = getApplications(tree);
  const names = [...applications.keys()];

  if (project && !applications.has(project)) {
    throw new Error(`"${project}" is not an application in this workspace. Choose one of: ${names.join(', ')}.`);
  }
  if (names.length === 0) {
    throw new Error('This workspace has no application to add vflow to.');
  }

  let name = project ?? (names.length === 1 ? names[0] : undefined);
  if (!name && !isInteractive()) {
    throw new Error(`This workspace has several applications. Pass --project with one of: ${names.join(', ')}.`);
  }
  if (!name) {
    const answer = await prompt<{ project: string }>({
      type: 'select',
      name: 'project',
      message: 'Which application should vflow be added to?',
      choices: names,
    });
    name = answer.project;
  }

  return { ...applications.get(name)!, name };
}

/** The applications of the workspace by name; libraries are left out. */
export function getApplications(tree: Tree): Map<string, ProjectConfiguration> {
  return new Map([...getProjects(tree)].filter(([, configuration]) => configuration.projectType === 'application'));
}
