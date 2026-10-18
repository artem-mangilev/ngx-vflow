# @vflow/cli

Generators for [ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) that copy the vflow UI parts into your
workspace, in the way of shadcn/ui and spartan-ng: the code becomes yours to edit. They run in Nx and in Angular CLI.

Requires Tailwind CSS v4 in the application.

```bash
npm i -D @vflow/cli
ng g @vflow/cli:init # or: nx g @vflow/cli:init
ng g @vflow/cli:ui   # or: nx g @vflow/cli:ui
```

| Generator  | Does                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `init`     | Adds `ngx-vflow` when missing and runs `ui-theme`                                              |
| `ui-theme` | Imports `@vflow/cli/ui-preset.css` after Tailwind and adds the light and dark theme values     |
| `ui`       | Asks for the `ui` section of `vflow.json` on the first run and copies the parts as `@vflow/ui` |

A later `ui` run, for example after an update, adds only the files that are missing.
