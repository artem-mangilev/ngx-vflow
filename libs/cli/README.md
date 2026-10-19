# @vflow/cli

Generators for [ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) that copy the vflow UI parts into your
workspace, in the way of shadcn/ui and spartan-ng: the code becomes yours to edit. They run in Nx and in Angular CLI.

Requires Tailwind CSS v4 in the application.

```bash
npm i -D @vflow/cli
ng g @vflow/cli:ui # or: nx g @vflow/cli:ui
```

`ui` adds what is missing and never overwrites your files:

- `ngx-vflow` and `@angular/cdk` in `package.json`;
- the tokens (`vflow-ui.css`) next to the global stylesheet of an application, imported after Tailwind;
- the parts as `@vflow/ui`: an Nx library or, in Angular CLI, a tsconfig path. The first run asks for the `ui` section
  of `vflow.json`.

Run it again with `--project` to add the tokens to another application, or after an update to add new parts.

Nothing in your application imports `@vflow/cli`: the parts and the tokens are copied, so the package is only needed
while you run the generators.
