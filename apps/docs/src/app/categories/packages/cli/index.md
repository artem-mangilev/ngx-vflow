`@vflow/cli` holds the generators that copy the [@vflow/ui](/packages/ui/overview) parts into your workspace, in the
way of shadcn/ui and spartan-ng: the code becomes yours to edit. They run in Angular CLI and in Nx.

## Installation

```bash
npm i -D @vflow/cli
```

The application needs Tailwind CSS v4
([setup for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)). Nothing in your
application imports `@vflow/cli`: the parts and the tokens are copied, so the package is only needed while you run
the generators.

## The `ui` generator

```bash
ng g @vflow/cli:ui
```

```bash
nx g @vflow/cli:ui
```

`ui` adds what is missing and never overwrites your files:

- `ngx-vflow` in `package.json`;
- the tokens, `vflow-ui.css`, next to the global stylesheet of an application, imported after
  `@import 'tailwindcss'`;
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
| `--buildable`        | Nx only: whether the library of the parts gets a build target on the first run                      |

## Run it again

- With `--project`, to add the tokens to another application.
- After an update of `@vflow/cli`, to add parts that are new. Files you already have stay as they are.
