# 04. `@vflow/auto-size`

Status: ready-for-agent
Type: task
Blocked by: 02, 03

Спецификация: [spec.md](../spec.md), «Контракты → auto-size». Источник: `dev/vflow-studio/libs/group-auto-scaling/.../group-auto-scaler.directive.ts`.

## Что сделать

- `libs/auto-size/` по каркасу из 03. Директива `VxAutoSize`, селектор `vflow[vxAutoSize]`, `inject(VflowComponent)` для `getNodeRect()`; подписка на `nodeDrag`/`nodeDragEnd` через `outputToObservable` или host-listener, как в Studio.
- Алгоритм на `(nodeDrag)`: для каждой тянущейся ноды — цепочка предков снизу вверх; для предка, прошедшего `shouldResize`, bounds детей из `getNodeRect` → node space родителя; `expandLeft/Top/Right/Bottom` с `padding`; `width.set`/`height.set` только на оси с явным signal; при `expandLeft/Top` — `parent.point` −d, все дети +d (в одном обработчике). Без `data.offset` и без коммита на `dragEnd`.
- `shrink` (опция, по умолчанию `false`): на `(nodeDragEnd)` ужать родителя до bounds детей + padding.
- Решить: реагировать ли на `nodesChanges.size` (ресайз ребёнка ресайзером) — предложение да, тем же расчётом.
- Нет `template-group` и `type` — любой родитель; в демо группа отличается по `data.type`, как на странице Subflows.
- README/docs: дети авторастущего родителя — `extent: null`; родитель с явными `width`/`height`; порядок `vflow[vxAutoSize]` относительно `[vResizable]`.

## Тесты

- Unit (browser mode): drag ребёнка за правый край → `width` вырос на нужную величину; за левый край → `point` родителя сместился, дети компенсированы, экранная позиция ребёнка не изменилась (нужен 02); вложенность два уровня — растут оба; `shouldResize` false → не растёт; `auto`-ось не пишется.
- docs-e2e `auto-size.spec.ts`: на демо перетащить ноду за край группы, проверить `getNodeRect` группы через `window`-хук демо или размер DOM-элемента.

## Готово, когда

- Сборка/тесты/lint пакета зелёные, страница `Packages → Auto size` с демо, cookbook `group-auto-scaling` не iframe (замена в 07).
