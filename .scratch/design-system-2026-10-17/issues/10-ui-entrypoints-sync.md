# 10. Пресет, значения тем и синхронизация шаблонов

Status: resolved
Type: task
Blocked by: 11

Спецификация: [spec.md](../spec.md), «Источник истины в репозитории». Образец — spartan `libs/tools/src/generators/hlm-to-cli-generator`.

## Что сделать

- `libs/ui` остаётся одним entrypoint `@vflow/ui`.
- Разделить `styles.css` на пресет (`@theme inline`, `@utility`, маппинг `[data-vui-theme]` → `--v-*`) и значения тем (`:root, [data-vui-theme='light']`, `[data-vui-theme='dark']`); docs подключают оба. `check-styles` работает на новой раскладке.
- `tools:ui-to-cli`: пересоздаёт `libs/cli/src/generators/ui/files` из `libs/ui/src` без подстановок, а также пресет и значения тем для `ui-theme`. CI-проверка: повторный запуск без diff.

## Готово, когда

- docs, e2e и `check-styles` зелёные; `tools:ui-to-cli` создаёт шаблоны всего набора.

## Comments

2026-10-18: entrypoint на часть отменён — набор ставится целиком.
2026-10-18: `private: true` для `libs/ui` перенесён в 06 — сейчас `ui` ещё публикуется через `nx-release-publish`, и пометка сломала бы `release:dry-run` до смены поставки.

## Answer

2026-10-18: сделано.

- `styles.css` → `ui-preset.css` (`@theme inline`, `@utility`, маппинг в `@layer base`) + `ui-theme.css` (значения); `styles.css` импортирует оба, слой `vui` переименован в `base`. Скомпилированный CSS совпадает с прежним, кроме порядка двух независимых блоков внутри слоя.
- `build-styles` кладёт оба файла рядом с `styles.source.css`; `check-styles` проверяет ещё и путь потребителя (без пресета — 91 ошибка).
- `libs/ui/scripts/sync-cli.mjs`: targets `ui:sync-cli` и `ui:check-cli` (добавлен в CI); 13 шаблонов в `libs/cli`. Проверены расхождение и лишний файл.
- Проверено: lint ui/docs, `ui:check-styles`, сборки consumer/docs, 31 e2e (design-system, acceptance, accessibility, markers, pointer-interactions, viewport-gestures).
