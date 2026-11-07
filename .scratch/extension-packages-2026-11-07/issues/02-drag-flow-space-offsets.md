# 02. Drag хранит смещения во flow space

Status: resolved
Type: task
Blocked by: —

Спецификация: [spec.md](../spec.md), раздел «Что нужно от ядра», п. 2.

## Проблема

`DraggableService` (`libs/ngx-vflow/src/lib/vflow/services/draggable.service.ts`, `initialPositions`) запоминает `node.point() − flowPointer`: смещение в node space родителя относительно указателя во flow space. Если во время жеста origin родителя сдвигается (auto-size растёт влево/вверх; ресайзер родителя), следующий `moveTo` пишет точку без учёта сдвига — нода отскакивает.

## Что сделать

- Хранить начальные смещения во flow space: `globalPoint() − flowPointer`.
- На каждом move: цель во flow space = `flowPointer + offset`; перевести в node space текущего родителя (`flowToNodeSpacePosition` или через `parent.globalPoint()`), затем snap, clamp `extent`, `setPoint`.
- Snap к сетке: сейчас выравнивается точка в node space; решить, выравнивать ли во flow space (визуальная сетка — flow space; при вложенности с нецелыми origin родителя поведение меняется). Предложение: выравнивать во flow space — сетка фона тоже во flow space.
- Учесть `moveSelected` с клавиатуры и auto-pan (`moveNodesOnAutoPanSub`): все три источника движения проходят через тот же расчёт.
- Alignment helper (`alignmentService.begin(dragNodes)`) работает во flow space — проверить, что ничего не сломалось.

## Готово, когда

- Spec: во время drag ребёнка сдвиг `parent.point` на (−d) с компенсацией детей на (+d) не меняет положение тянущейся ноды на экране; нода остаётся под указателем.
- `pointer-interactions.spec.ts` и `alignment-helper.spec.ts` (docs-e2e) зелёные; `nodesChanges.position` сообщает те же значения, что и раньше, для плоских графов.

## Comments

2026-11-07, сделано:

- `DraggableService`: `offsets` = `globalPoint − flowPointer` на старте; на move цель во flow space → `alignmentService.snap` (теперь принимает flow-space точки, `parentOrigins` удалён) → `alignToGrid` во flow space → `toNodeSpace(model, point)` (вычитает `parent.globalPoint()`, округляет) → `moveNode` (clamp `extent` по-прежнему в node space).
- `moveSelected` (клавиатура) идёт тем же путём: шаг и snap во flow space.
- Решение по сетке: snap во flow space (как React Flow `snapPosition` над absolute position); документировано на странице Snap to grid.
- Spec в `draggable.service.spec.ts`: сдвиг origin родителя с компенсацией ребёнка во время drag — ребёнок остаётся под указателем; вложенная нода снапится к сетке флоу, клавиатурный шаг тоже.
