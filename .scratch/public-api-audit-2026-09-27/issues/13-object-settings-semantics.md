# 13. Объектные настройки `<vflow>`: одна семантика обновления

Status: needs-triage
Type: task
Priority: P2 (ломающее — дешевле до 3.0)
Blocked by: —

Отчёт: 2.5 (`view`, `autoPan`, геттер `connection`), 3.7, 4.5. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Объектные inputs обновляются четырьмя способами (`components/vflow/vflow.component.ts`):

- `[optimization]` (:322-328), `[selectionBox]` (:370-376) и `[keyboardShortcuts]` (`services/keyboard.service.ts:244-255`) сливаются с предыдущим значением, поэтому убранный ключ не сбрасывается. Проба: `{virtualization:true}`, затем `{lazyLoadTrigger:'viewport'}` → `virtualization` остаётся `true`.
- `[ariaLabelConfig]` (:224-230) сливается с дефолтами.
- `[alignmentHelper]` (:457) заменяется целиком. Это единственный signal `input()` среди `@Input` setter'ов.
- `[autoPan]` читается один раз (`directives/auto-pan.directive.ts:41`).

Рядом:

- **Обязательные поля среди опциональных:** `AlignmentHelperSettings.tolerance`, `IntersectingNodesOptions.partially`.
- **Геттеры** есть только у `minZoom`, `maxZoom` и `connection`. Геттер `connection` возвращает внутренний `ConnectionModel`, а не `ConnectionSettings` (:388-397).
- **Дефолт `view` — `[400, 400]`** (`services/flow-settings.service.ts:25`). 61 из ~78 `<vflow>` в демо его переопределяют, почти все — на `'auto'`.
- **`optimization.detachedGroupsLayer`** — не оптимизация, а z-order родительских узлов (`components/node/node.component.ts:114`). Слово «group» противоречит глоссарию, как и `AriaLabelConfig.groupRole`.

## Решить

- **Семантика:** одна — каждое значение = дефолты + переданные ключи. Рекомендую: так предсказуема шаблонная привязка.
- **`autoPan`:** сделать реактивным.
- **Поля настроек:** все опциональные.
- **Геттеры:** убрать или сделать у всех. Рекомендую убрать: состояние читается через сигналы.
- **Дефолт `view`:** `'auto'`.
- **`detachedGroupsLayer`:** вынести из `optimization` и переименовать (например, `[parentNodesBelowEdges]`); `groupRole` → `parentRole`.
- **Signal `input()`:** переводить inputs здесь или отдельным тикетом.
