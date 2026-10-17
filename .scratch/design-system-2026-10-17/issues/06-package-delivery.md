# 06. Поставка пакета без runtime-экспортов

Status: needs-triage
Type: task
Blocked by: 04

## Что сделать

- Убрать публикацию `styles.css` / `styles.source.css`, `build-styles.mjs`, exports/sideEffects стилей из `package.json`.
- Пакет содержит генераторы и шаблоны; ng-packagr-сборка runtime-кода не публикуется.
- docs и e2e продолжают компилировать части из исходников через tsconfig paths.
- `apps/consumer`: конфигурация `ui` собирается из частей, сгенерированных `init` + `add`, с Tailwind v4, вместо `dist/libs/ui/styles.css`.
