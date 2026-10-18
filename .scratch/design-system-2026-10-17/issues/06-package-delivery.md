# 06. Поставка: `@vflow/cli` вместо `@vflow/ui`

Status: needs-triage
Type: task
Blocked by: 04

## Что сделать

- Публикуется `libs/cli` (`@vflow/cli`): генераторы, шаблоны, `ui-preset.css`. `libs/ui` приватная, её ng-packagr-сборка не публикуется.
- Убрать `styles.css` / `styles.source.css`, `build-styles.mjs`, exports/sideEffects стилей из `libs/ui/package.json`.
- `apps/consumer`: конфигурация `ui` собирается из частей, сгенерированных `init` + `ui`, с Tailwind v4, вместо `dist/libs/ui/styles.css`.
