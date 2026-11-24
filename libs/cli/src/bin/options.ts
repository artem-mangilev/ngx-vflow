import type { UiGeneratorSchema } from '../generators/ui/schema';

export const USAGE = `Usage: npx @vflow/cli ui [options]

Run it in the root of an Angular CLI or Nx workspace.

  --project <name>             The application that gets the tokens
  --stylesEntryPoint <path>    The global stylesheet, relative to the workspace root
  --directory <path>           A directory for the parts on the first run
  --importAlias <alias>        The import alias of the parts on the first run, e.g. @acme/flow-ui
  --buildable, --no-buildable  Nx only: whether the library of the parts gets a build target`;

/** The options of `npx @vflow/cli ui`, named as the generator names them. */
export function parseOptions(args: string[]): UiGeneratorSchema {
  const options: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const [flag, inline] = args[i].split(/=(.*)/s);
    if (!flag.startsWith('--')) throw new Error(`Unexpected argument ${args[i]}.\n\n${USAGE}`);

    const name = flag.slice(2);
    if (name === 'buildable') options['buildable'] = inline === undefined ? true : inline !== 'false';
    else if (name === 'no-buildable') options['buildable'] = false;
    else if (['project', 'stylesEntryPoint', 'directory', 'importAlias'].includes(name)) {
      const value = inline ?? args[++i];
      if (value === undefined || value.startsWith('--')) throw new Error(`--${name} needs a value.`);
      options[name] = value;
    } else throw new Error(`Unknown option --${name}.\n\n${USAGE}`);
  }
  return options as UiGeneratorSchema;
}
