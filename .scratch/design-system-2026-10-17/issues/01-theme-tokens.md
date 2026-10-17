# 01. Тема: токены и шкалы в пространстве `vui`

Status: resolved
Type: task
Blocked by: —

Спецификация: [spec.md](../spec.md), разделы «Визуальный язык» и «Tailwind в проекте потребителя».

## Что сделать

- Переписать `libs/ui/src/styles.css` на значения из спецификации: цвета light/dark, типографика, сетка, размеры контролов, радиусы, тени, motion.
- Зарегистрировать токены через `@theme inline` в пространстве `vui` (`--color-vui-*`, `--text-vui-*`, `--radius-vui-*`, `--shadow-vui-*`) вместо `prefix(vui)` и переопределения дефолтных `--color-surface`/`--radius-md`.
- Тоны success/warning/danger/info — обычные токены темы с light/dark значениями; убрать `--vui-color-*` из dark-блока.
- Сохранить маппинг `[data-vui-theme]` → `--v-*` (ADR-0005), добавить `--v-focus: selection`, `--v-selection: selection`, `--v-focus-radius: radius-surface`.

## Готово, когда

- Части без изменений классов собираются (временная несовместимость имён utilities допустима только внутри ветки вместе с 02).
- Docs-страница токенов показывает все шкалы в обеих темах.
