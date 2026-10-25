import { convertNxGenerator, type Tree } from '@nx/devkit';
import { uiGenerator } from './generator';
import type { UiGeneratorSchema } from './schema';

/** `ng g @vflow/cli:ui` in a workspace without Nx: the parts get a tsconfig path instead of an Nx library. */
export default convertNxGenerator((tree: Tree, options: UiGeneratorSchema) =>
  uiGenerator(tree, { ...options, angularCli: true }),
);
