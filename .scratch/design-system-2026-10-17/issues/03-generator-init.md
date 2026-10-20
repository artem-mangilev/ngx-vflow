# 03. Генераторы `init` и `ui-theme`

Status: resolved
Type: task
Blocked by: 10

Спецификация: [spec.md](../spec.md), «Генераторы» → `ui-theme`. Образец — spartan `libs/cli/src/generators/init` и `theme`.

## Что сделать

- `libs/cli` (`@vflow/cli`) с `generators.json`; генераторы на `@nx/devkit`.
- `init`: добавляет `ngx-vflow` в `dependencies`, если его нет, и вызывает `ui-theme`. Раздел `ui` в `vflow.json` не создаёт.
- `ui-theme`: приложение из `--project`, вопроса или единственного в workspace; stylesheet из `--stylesEntryPoint` или поиска (`styles.css|scss|sass|less` в `sourceRoot`, затем `build.options.styles`), иначе ошибка с подсказкой.
- Импорт `@vflow/cli/ui-preset.css` после ведущих `@charset` / `@import` / `@layer …;`; значения тем light/dark в конец файла.
- Tailwind не ставится и не проверяется.

## Тесты

Unit на `createTreeWithEmptyWorkspace`: Nx-проект, проект Angular CLI, несколько приложений без `--project`, stylesheet в `build.options.styles`, отсутствие stylesheet, `ngx-vflow` уже в зависимостях, импорт пресета после `@import 'tailwindcss'`.

## Comments

2026-10-18: сначала `init` убрали (настройка первым `add`), затем пользователь решил максимально повторить spartan — `init` и `ui-theme` вернулись в форме spartan, конфиг создаёт `ui`.

## Answer

2026-10-18: сделано.

- `libs/cli` — Nx-проект `cli` (`@vflow/cli`, CommonJS): `package.json`, `generators.json` (`init`, `ui-theme`), targets `lint` и `test` (`tsc --noEmit` + vitest в Node). Сборки и публикации нет — это 06.
- `utils/applications.ts`: приложение из `--project`, единственное или вопрос enquirer; библиотеки не предлагаются; `angular.json` читается через `getProjects`.
- `ui-theme`: поиск stylesheet как у spartan (`styles.*` в `sourceRoot`, затем `build.options.styles` своего проекта, `inject: false` пропускается); пресет после ведущих `@charset` / `@import` / `@layer …;` / `@use` / `@forward` с пропуском комментариев; значения из `ui-theme.css` в конец; повторный запуск ничего не дублирует.
- `init`: `ngx-vflow` `^<версия @vflow/cli>` в `dependencies`, если его нет ни там, ни в `devDependencies`; затем `ui-theme`; `vflow.json` не создаёт.
- 14 unit-тестов (Nx, Angular CLI, несколько приложений, build options, `--stylesEntryPoint`, нет stylesheet, Sass с комментариями, пустой файл, повторный запуск, `ngx-vflow` в обеих секциях). Проверено: `cli:test`, `cli:lint`, prettier, `ui:check-cli`, `release:dry-run`.

2026-10-18: `ui-theme` перестал быть публичным генератором — функция `addUiTheme` в `generators/init/theme.ts`, её вызывает `init` (и вызовет будущий генератор другого набора частей).
