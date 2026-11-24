# @vflow/cli

Copies the [ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) UI parts and their tokens into your workspace,
in the way of shadcn/ui: the code becomes yours to edit. Runs in Angular CLI and Nx workspaces.

Requires Tailwind CSS v4 in the application. In the root of the workspace:

```bash
npx @vflow/cli ui
```

`ui` adds what is missing and never overwrites your files:

- `ngx-vflow` in `package.json`;
- the tokens (`vflow-ui.css`) next to the global stylesheet of an application, imported after Tailwind;
- the parts as `@vflow/ui`: an Nx library or, in Angular CLI, a tsconfig path. The first run asks for the folder and
  the import alias; a later run finds the parts through that tsconfig path, so nothing else is stored.

Run it again with `--project` to add the tokens to another application, or after an update to add new parts.

Nothing in your application imports `@vflow/cli`: the parts and the tokens are copied. Installed in the workspace,
the same command is a generator: `ng g @vflow/cli:ui` or `nx g @vflow/cli:ui`.
