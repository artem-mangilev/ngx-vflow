# 10. Пресет, значения тем и синхронизация шаблонов

Status: needs-triage
Type: task
Blocked by: 11

Спецификация: [spec.md](../spec.md), «Источник истины в репозитории». Образец — spartan `libs/tools/src/generators/hlm-to-cli-generator`.

## Что сделать

- `libs/ui` остаётся одним entrypoint `@vflow/ui`; `package.json` с `private: true`.
- Разделить `styles.css` на пресет (`@theme inline`, `@utility`, маппинг `[data-vui-theme]` → `--v-*`) и значения тем (`:root, [data-vui-theme='light']`, `[data-vui-theme='dark']`); docs подключают оба. `check-styles` работает на новой раскладке.
- `tools:ui-to-cli`: пересоздаёт `libs/cli/src/generators/ui/files` из `libs/ui/src` без подстановок, а также пресет и значения тем для `ui-theme`. CI-проверка: повторный запуск без diff.

## Готово, когда

- docs, e2e и `check-styles` зелёные; `tools:ui-to-cli` создаёт шаблоны всего набора.

## Comments

2026-10-18: entrypoint на часть отменён — набор ставится целиком.
