import { convertNxGenerator } from '@nx/devkit';
import { initGenerator } from './generator';

/** `ng g @vflow/cli:init` in a workspace without Nx. */
export default convertNxGenerator(initGenerator);
