# 03. Генератор `init`

Status: needs-triage
Type: task
Blocked by: —

## Что сделать

- Добавить в `libs/ui` `generators.json` и генератор `init` на `@nx/devkit`.
- Проверить наличие Tailwind v4 в зависимостях проекта; без него — ошибка с инструкцией установки.
- Скопировать `vflow-theme.css` (из того же исходника, что и 01) и добавить импорт в глобальный stylesheet проекта после `@import 'tailwindcss'`.
- Записать `vflow-ui.json`: версия пакета, `componentsDir`, Tailwind prefix, alias импорта.
- Unit-тесты на `createTreeWithEmptyWorkspace`: Nx-проект, проект Angular CLI (angular.json), отсутствие Tailwind, повторный запуск.
