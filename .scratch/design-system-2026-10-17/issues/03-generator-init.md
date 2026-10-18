# 03. Генераторы `init` и `ui-theme`

Status: needs-triage
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
