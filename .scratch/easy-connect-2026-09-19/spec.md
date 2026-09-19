# Easy connect: нода без портов как handle, рёбра по периметру

Дата: 2026-09-19. Реализовано в один заход после разбора handles (см. `.scratch/composable-api-2026-09-13/spec.md`, D5).

## Решения

- Handle не глушит события. `mousedown` доходит до ноды и корня; фильтр drag ноды и `allowRootZoomForNodeTarget`
  отклоняют цели внутри `.vflow-handle`, если ближайший из `.vflow-handle, .vflow-drag-handle` не drag handle.
  `startConnection` игнорирует события из drag handle внутри handle. Так корень ноды может быть handle, а заголовок с
  `dragHandle` тянет ноду.
- Элемент handle — зона сброса. `mouseenter`/`mouseleave` (и touch через `touchMovement$`) вызывают
  `validateConnection`/`resetValidateConnection` при активном соединении. Магнит вокруг точки остаётся.
  `resetValidateConnection` действует только на текущего кандидата и никогда на handle-источник.
- `HandleState` получил `connecting`: `FlowStatusService` ставит его handle-источнику на время соединения, если он не
  кандидат. `vflowPort` красит его в accent.
- `EdgeModel` в `loose`-режиме берёт любой handle ноды, если handle нужной роли нет (без явного id).
- `CurveFactoryParams`: `sourceNode`/`targetNode` (`NodeGeometry`: id, x, y, width, height по `NodeModel.geometry()`)
  и `markerInset: { start, end }`. `sourcePoint`/`targetPoint` уже сдвинуты на inset вдоль стороны handle; фабрика,
  считающая свои концы, применяет inset сама. У connection `targetNode` есть только при валидном кандидате.
- `getFloatingEdgeParams(source, target, { inset })` в geometry utilities: пересечение отрезка между центрами с
  границами прямоугольников и стороны для контрольных точек. Прямоугольник без размера — точка (курсор).
- Рецепт `cookbook/easy-connect`: `vflowHandle layout="manual" [id]="node.id"` на корне ноды, `dragHandle` на
  заголовке, `connection: { mode: 'loose', curve, marker }`, рёбра с той же кривой. e2e `easy-connect.spec.ts`.

## Что осталось

- Формы, отличные от прямоугольника (круг, ромб в BPMN): своя функция границы в рецепте.
- Одно ребро на пару нод при одном handle на ноду — ограничение рецепта, задокументировано.
- Вход `id` handle попадает в DOM как `id` при статическом атрибуте; в рецепте используется биндинг `[id]`.
