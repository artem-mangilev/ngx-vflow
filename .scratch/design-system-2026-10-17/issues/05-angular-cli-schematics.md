# 05. Angular CLI: schematics

Status: resolved
Type: task
Blocked by: 04

## Что сделать

- В `generators.json` секция `schematics` рядом с `generators`; на каждый генератор `compat.ts` через `convertNxGenerator`, `ui` передаёт `angularCli: true` (как spartan; без флага `ui` создаёт Nx-библиотеку). `ng-add` нет.
- В `package.json` `@vflow/cli`: `generators` и `schematics` указывают на `generators.json`; зависимости `@nx/devkit`, `@nx/angular`, `enquirer`.
- Проверить `ng g @vflow/cli:init` и `ng g @vflow/cli:ui` в проекте Angular CLI без Nx.

## Answer

2026-10-18: сделано.

- `compat.ts` у `init`, `ui-theme`, `ui` через `convertNxGenerator`; `ui` добавляет `angularCli: true`. Секция `schematics` в `generators.json` с теми же schema, `package.json` указывает `generators` и `schematics` на один файл.
- `ui-theme` не пишет stylesheet без изменений: Angular CLI показывал `UPDATE` на повторном запуске.
- 4 теста `SchematicTestRunner` + `UnitTestTree` (всего 28): секции совпадают, `init`/`ui-theme`/`ui` в дереве Angular CLI, `ui` даёт tsconfig path без Nx-библиотеки.
- Вне тестов: CLI, транспилированный esbuild, подключён symlink'ом как `node_modules/@vflow/cli` в scratch-приложение Angular CLI 20.3 без Nx. `ng g @vflow/cli:init` и `ng g @vflow/cli:ui` пишут тему, части, path и include; повторные `init`/`ui-theme`/`ui` — `Nothing to be done`; `ng build` с `.postcssrc.json` собирает приложение с `vuiNode`, а CSS содержит utilities частей, маппинг и значения темы.
