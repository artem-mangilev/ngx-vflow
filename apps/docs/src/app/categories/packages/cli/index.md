`@vflow/cli` copies the [@vflow/ui](/packages/ui/overview) parts and their tokens into your workspace, in the way of
shadcn/ui: the code becomes yours to edit, and points coding agents at the docs of the installed `ngx-vflow`. It runs
with `npx`, so nothing is installed in the workspace.

## The `ui` command

The application needs Tailwind CSS v4
([setup for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)). In the root of an Angular
CLI or Nx workspace:

```bash
npx @vflow/cli ui
```

`ui` adds what is missing:

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
| `--diff`             | Print what an update would change in the copied files, and write nothing                            |
| `--overwrite`        | Replace copied files that have your changes with the files of this version                          |

```bash
npx @vflow/cli ui --directory libs/flow-ui --importAlias @acme/flow-ui
```

## Update the parts

Run the same command with a newer `@vflow/cli`. It adds the parts that are new and updates the files you have not
changed. A file you changed is kept, and the command names it:

```bash
npx @vflow/cli@latest ui --diff       # what an update would change, nothing is written
npx @vflow/cli@latest ui --overwrite  # replace your changed files too; review the result with git
```

`index.ts` of the parts lists your exports, so a changed one is never replaced. Run the command with `--project` to
add the tokens to another application.

The same command is a generator too: with `@vflow/cli` installed, `ng g @vflow/cli:ui` and `nx g @vflow/cli:ui` take
the same options.

## The `agents` command

`ngx-vflow` ships its docs as an agent skill in `node_modules/ngx-vflow/skills/ngx-vflow`: the guides, the examples
and the code of every demo, for the installed version. In the root of the project:

```bash
npx @vflow/cli agents
```

`agents` writes:

- a short block in `AGENTS.md` that tells the agent to read the skill before writing code with `ngx-vflow`;
- the same block in `CLAUDE.md` when the project has one, since Claude Code then reads `CLAUDE.md` instead of
  `AGENTS.md`. A `CLAUDE.md` that imports `@AGENTS.md` is left as it is;
- `ngx-vflow/SKILL.md` in `.claude/skills` and `.agents/skills`, a skill that only points at the one in
  `node_modules`. Claude Code reads the first folder, Codex the second, Cursor and Copilot both.

The files name a path and hold no docs, so they stay correct when `ngx-vflow` is updated. Commit them. A second run
replaces the block between its `vflow:start` and `vflow:end` comments and keeps the rest of the file.
