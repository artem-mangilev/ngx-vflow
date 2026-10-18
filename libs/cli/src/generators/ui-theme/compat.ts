import { convertNxGenerator } from '@nx/devkit';
import { uiThemeGenerator } from './generator';

/** `ng g @vflow/cli:ui-theme` in a workspace without Nx. */
export default convertNxGenerator(uiThemeGenerator);
