# @vflow/cli

Generators for [ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) that copy the vflow UI parts into your
workspace, in the way of shadcn/ui and spartan-ng: the code becomes yours to edit. They run in Nx and in Angular CLI.

Requires Tailwind CSS v4 in the application.

```bash
npm i -D @vflow/cli
ng g @vflow/cli:init # or: nx g @vflow/cli:init
ng g @vflow/cli:ui   # or: nx g @vflow/cli:ui
```

| Generator | Does                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init`    | Adds `ngx-vflow` and `@angular/cdk` when missing, copies the tokens (`vflow-ui.css`) next to the global stylesheet and imports them after Tailwind |
| `ui`      | Asks for the `ui` section of `vflow.json` on the first run and copies the parts as `@vflow/ui`                                                     |

A later `ui` run, for example after an update, adds only the files that are missing.

Nothing in your application imports `@vflow/cli`: the parts and the tokens are copied, so the package is only needed
while you run the generators.
