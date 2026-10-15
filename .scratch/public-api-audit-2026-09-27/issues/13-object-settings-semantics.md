# 13. Объектные настройки `<vflow>`: одна семантика обновления

Status: resolved
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

## Answer

Решения (2026-10-10, все четыре — по рекомендации тикета):

- **Семантика:** одна — значение = дефолты + переданные ключи (`utils/with-defaults.ts`). `[optimization]`, `[selectionBox]`, `[ariaLabelConfig]` идут через `withDefaults`; `KeyboardService.setShortcuts` сливает с `defaultShortcuts()`, а не с предыдущим `raw`. Убранный ключ возвращается к дефолту. Спеки, собиравшие `keyboardShortcuts` по частям, переписаны на целые объекты.
- **`autoPan`:** реактивный — директива делает `toObservable(autoPan)` + `switchMap`, смена привязки действует и во время drag.
- **Поля настроек:** `AlignmentHelperSettings.tolerance?` (fallback 10), `IntersectingNodesOptions.partially?`.
- **Геттеры:** `minZoom`, `maxZoom`, `connection` удалены. Шаблон читает модель соединения через `protected connectionModel`.
- **Дефолт `view`:** `'auto'`. `FlowSizeControllerDirective` в dev-режиме один раз предупреждает, если `view === 'auto'` и измерен ноль ровно по одной оси (полностью нерендеренный элемент ResizeObserver не сообщает, так что display:none не шумит).
- **`detachedGroupsLayer`:** убран из `Optimization`; новый boolean input `[parentsBelowEdges]` (сигнал `FlowSettingsService.parentsBelowEdges`). `AriaLabelConfig.groupRole` → `parentRole`, английское значение по умолчанию осталось `'group'` (это произносимое описание, не термин API).
- **Signal `input()`:** отдельный тикет — [22](22-signal-inputs.md). Сеттеры пишут в сигналы `FlowSettingsService`; переход на `input()` — это либо effect на каждый input, либо переворот зависимости сервиса на компонент.

Документация: раздел «Settings inputs» и три строки в «Removed APIs» на странице migration; страница view-size; таблица ключей accessibility. Тесты: `components/vflow/settings-inputs.spec.ts` (новый), `auto-pan.spec.ts` (тест «captures at creation» заменён на реактивность), `keyboard-navigation.spec.ts`, `accessibility.spec.ts`.

Поправка (2026-10-15): геттеры `minZoom` и `maxZoom` возвращены (только чтение, читают сигналы `FlowSettingsService`, поэтому реактивны в `computed`). Их читает `vui-controls` (`libs/ui/src/lib/controls.component.ts`), чтобы выключать кнопки zoom на пределах; после удаления чтение давало `undefined`, и обе кнопки оставались выключенными (падали e2e `design-system.spec.ts` и `design-system-acceptance.spec.ts`). Геттер `connection` остаётся удалённым. Тикет [22](22-signal-inputs.md) потом сделает их signal `input()`.
