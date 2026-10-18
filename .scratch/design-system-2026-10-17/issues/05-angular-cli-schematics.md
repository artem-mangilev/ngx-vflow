# 05. Angular CLI: schematics

Status: needs-triage
Type: task
Blocked by: 04

## Что сделать

- В `generators.json` секция `schematics` рядом с `generators`; на каждый генератор `compat.ts` через `convertNxGenerator`, `ui` передаёт `angularCli: true` (как spartan). `ng-add` нет.
- В `package.json` `@vflow/cli`: `generators` и `schematics` указывают на `generators.json`; зависимости `@nx/devkit`, `@nx/angular`, `enquirer`.
- Проверить `ng g @vflow/cli:init` и `ng g @vflow/cli:ui node` в проекте Angular CLI без Nx.
