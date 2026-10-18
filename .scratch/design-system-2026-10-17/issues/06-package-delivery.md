# 06. Поставка: `@vflow/cli` вместо `@vflow/ui`

Status: resolved
Type: task
Blocked by: 04

## Что сделать

- Публикуется `libs/cli` (`@vflow/cli`): генераторы, шаблоны, `ui-preset.css`. `libs/ui` приватная (`private: true`, без `nx-release-publish` и тега `release`), её ng-packagr-сборка не публикуется.
- Сборка `libs/cli` (tsc в `dist/libs/cli` с `generators.json`, schema-файлами, шаблонами, `ui-preset.css`, `ui-theme.css`) и тег `release`: `init` берёт версию `ngx-vflow` из версии `@vflow/cli`, поэтому пакеты релизятся одной версией.
- Убрать `styles.css` / `styles.source.css` и копии `ui-preset.css` / `ui-theme.css` в dist, `build-styles.mjs`, exports/sideEffects стилей из `libs/ui/package.json`.
- `apps/consumer`: конфигурация `ui` собирается из частей, сгенерированных `init` + `ui`, с Tailwind v4, вместо `dist/libs/ui/styles.css`.

## Answer

2026-10-18: сделано.

- `libs/cli`: target `build` (tsc с `rootDir` проекта и без `importHelpers` в `dist/libs/cli` + `scripts/copy-assets.mjs`: манифесты, `ui-preset.css`, README, LICENSE и все не-TS файлы `src` — schema, шаблоны, `ui-theme.css`), тег `release`, `nx-release-publish`. `release:dry-run` поднимает `@vflow/cli` до той же версии, что `ngx-vflow` (3.0.0).
- `libs/ui`: `private: true`, без `build`, `nx-release-publish` и тега; удалены `ng-package.json`, `tsconfig.lib*.json`, `build-styles.mjs`, exports и sideEffects. `check-styles` сам компилирует `styles.css` во временную папку в `tmp/`; проверка `styles.source.css` убрана, проверка пути потребителя осталась.
- Docs hybrid: `@vflow/ui` и стили — из исходников `libs/ui` (сборки больше нет, а потребитель компилирует части сам).
- `apps/consumer`: target `generate-ui` (после `cli:build`) запускает собранные `init` и `ui` в Angular CLI-воркспейсе `tmp/consumer-ui` (`node_modules/@vflow/cli` — symlink на dist, `@source` на части, потому что `tmp/` в `.gitignore`); `ui` берёт `@vflow/ui` из сгенерированных частей и `tmp/consumer-ui/src/styles.css`. `apps/consumer/.postcssrc.json` включает `@tailwindcss/postcss` (раньше был пустым: потребитель готового CSS обходился без Tailwind). `consumer:check` зелёный.
- Проверено: `nx run-many -t build`, docs `hybrid`, lint всех проектов, `cli:test` (28), `ui:check-styles`, `ui:check-cli`, `release:dry-run`. Тексты docs про `@vflow/ui/styles.css` и README `libs/ui` остаются для 08.
