`@vflow/cli` copies the [@vflow/ui](/packages/ui/overview) parts and their tokens into your workspace, in the way of
shadcn/ui: the code becomes yours to edit. It runs with `npx`, so nothing is installed in the workspace.

## The `ui` command

The application needs Tailwind CSS v4
([setup for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)). In the root of an Angular
CLI or Nx workspace:

```bash
npx @vflow/cli ui
```

`ui` adds what is missing and never overwrites your files:

- `ngx-vflow` in `package.json`;
- `vflow-ui.css`, the tokens, next to the global stylesheet of an application, imported after `@import 'tailwindcss'`;
- the parts under the `@vflow/ui` import alias: an Nx library in Nx, a tsconfig path in Angular CLI.

The first run asks for the folder of the parts and their import alias. A later run finds the parts through that
tsconfig path, so nothing else is stored.

## Options

| Option               | Meaning                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `--project`          | The application that gets the tokens. Asked for when the workspace has several applications         |
| `--stylesEntryPoint` | Path to the global stylesheet relative to the workspace root. Found in the application when omitted |
| `--directory`        | A directory for the parts on the first run, or the installed set to update when there are several   |
| `--importAlias`      | The import alias of the parts on the first run, for example `@acme/flow-ui`. Asked for when omitted |

```bash
npx @vflow/cli ui --directory libs/flow-ui --importAlias @acme/flow-ui
```

## Run it again

- With `--project`, to add the tokens to another application.
- With a newer `@vflow/cli`, to add parts that are new. Files you already have stay as they are.

The same command is a generator too: with `@vflow/cli` installed, `ng g @vflow/cli:ui` and `nx g @vflow/cli:ui` take
the same options.
