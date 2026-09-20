# Handle API 3.0: одна директива для порта, ноды и кнопки

Дата: 2026-09-20. Итог обсуждения handles после `.scratch/composable-api-2026-09-13` (D5) и
`.scratch/easy-connect-2026-09-19`. Ориентиры: Foblex `fConnector` (одна директива, сторона `auto`,
тип `source-target`), ng-diagram (плавающий конец на уровне ребра), React Flow (типы `source`/`target`).

## Принципы

- Одно понятие handle: порт, нода целиком, кнопка внутри ноды — одна директива, разные значения входов.
- `position` описывает точку соединения относительно ноды. Элемент — поверхность взаимодействия.
- Направленность живёт на handle, не в глобальном режиме потока.
- Один способ на задачу: значение входа, покрывающее старый флаг, удаляет флаг. 3.0 — мажор.

## Решения

### D1. `handleType: 'source' | 'target' | 'any'`

Дефолт `source`. `any` тянет и принимает в обе стороны; направление ребра — как тянули. Встроенная проверка
«разные типы» применяется только к паре типизированных handle; `adjustDirection` меняет направление только
для пары `target` → `source`. В `ConnectionForValidation` и событиях `type` получает значение `any`.

Удаляется `ConnectionSettings.mode`. Требование id в loose-режиме уходит вместе с ним.

### D2. `position: Position | 'auto' | 'center'`

Тип входа `HandlePosition`. Стороны как сейчас. `auto`: сторона по направлению от центра ноды ко второму
концу ребра (доминирующая ось), точка — середина этой стороны ноды. `center`: центр ноды, сторона — по той же
оси. Для `auto` и `center`: `layout` не читается и стили не пишутся, магнит не рисуется, элемент — зона
сброса, `localPoint`/`pointAbsolute` — центр ноды (для selection box и опорной точки второго конца).

Разрешение концов делает ядро: `EdgeModel.getPathFactoryParams` и `ConnectionComponent` вызывают
`handle.endpoint(towards)`. `Position` в `CurveFactoryParams` остаётся четырьмя сторонами. Inset маркера —
вдоль разрешённой стороны. `getFloatingEdgeParams` остаётся публичной утилитой (пересечение границы) для
кастомных кривых. `data-vflow-handle-position` отдаёт значение как есть.

Dev-предупреждение, если `layout="auto"` задан явно вместе с `auto`/`center`: нет, `layout` просто не
читается; предупреждение шумит в компонентах, которые пробрасывают вход всегда.

### D3. Удаляется `ConnectionSettings.type`

Превью рендерит `ng-template connection`, если он объявлен, иначе линию по умолчанию. `ConnectionModel.type`
и `ConnectionType` удаляются.

### D4. Удаляется `Edge.floating`

Ближайшая пара фиксированных handle — частный случай `position="auto"`. `closestHandles` удаляется.
Страница floating-edges переписывается на `position="auto"`.

### D5. `id` → `handleId`

Статический атрибут `id` попадает в DOM. Вход переименовывается; `Edge.sourceHandle`/`targetHandle`
ссылаются на `handleId`. `vflowPort`, мок, документация, демо и e2e переводятся.

### D6. Рецепт easy connect

`<div vflowHandle handleType="any" position="auto">` + `dragHandle` на заголовке, без кривой и настроек.
Страница cookbook переписывается, e2e обновляется, в custom-handles появляется раздел про `auto` и `center`.

## Не меняется

Зона сброса на элементе, фильтры drag/pan, `connecting`, `sourceNode`/`targetNode`/`markerInset` в параметрах
кривой, `layout` и `offsetX/Y` для сторон, `canStart`/`canAccept`, a11y-входы, `allowSelfConnections`.

## Миграция (дополнение к странице migration)

| Было                                 | Стало                                                         |
| ------------------------------------ | ------------------------------------------------------------- |
| `connection.mode: 'loose'`           | `handleType="any"` на нужных handle                           |
| `connection.type`                    | убрать; шаблон определяется наличием `ng-template connection` |
| `edge.floating`                      | `position="auto"` на handle ноды                              |
| `id` у handle                        | `handleId`                                                    |
| кастомная кривая для ноды как handle | не нужна                                                      |
