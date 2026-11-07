# 04. `@vflow/auto-size`

Status: resolved
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

## Comments

2026-11-07, сделано:

- `libs/auto-size` по каркасу 03 (конфиги скопированы, сборка против `dist/libs/ngx-vflow`). Директива `VxAutoSize`, селектор `vflow[vxAutoSize]`, входы `vxAutoSizePadding` (число или по сторонам), `vxAutoSizeShouldResize`, `vxAutoSizeShrink`. Имена входов без alias — правило `@angular-eslint/no-input-rename` в репозитории.
- Подписки через `OutputRef.subscribe` на `nodeDrag` (рост), `nodeDragEnd` (рост, и сжатие при `shrink`) и `nodesChanges.size` (ресайз ребёнка ресайзером; при первом измерении тоже — родитель сразу подгоняется под переполняющих детей). Отписка в `DestroyRef`.
- Алгоритм `fit`: bounds детей через `getNodeRect` в node space родителя (`getNodeRect(parent)` как origin), с padding; без `shrink` объединяется с текущим прямоугольником родителя. Сдвиг origin на `(left, top)` с компенсацией всех детей в том же обработчике, `width.set`/`height.set` только при наличии signal; ось без signal не трогается ни по сдвигу, ни по размеру. Предки обрабатываются от самого глубокого (`Map<Node, depth>` по всем тянущимся нодам, сортировка), поэтому выросший родитель учитывается своим родителем в том же тике.
- Хак `data.offset` и коммит на `dragEnd` из Studio не нужны: ядро после тикета 02 держит тянущуюся ноду под курсором при сдвиге origin предка (проверено spec «grows to the left and top…»: экранное смещение ребёнка относительно родителя остаётся 10 px).
- Spec (browser, 6 тестов): рост вправо/вниз, влево/вверх со сдвигом origin, два уровня вложенности, `shouldResize` и auto-ось, `shrink` на dragEnd, padding по сторонам. Drag симулируется `dispatchMouse` из `pointer-events.testing` ядра (относительный импорт в spec; файл не в публичном API).
- Docs `Packages → Auto size` (`/packages/auto-size`) с демо «Team / Squad / Dev»; e2e `auto-size.spec.ts` сравнивает позиции относительно верхнего родителя, потому что auto-pan во время drag у края панели сдвигает весь viewport.
- Release dry-run: группа из четырёх пакетов, все 3.0.0.
- Ограничения в docs: `extent: null` у детей, явные `width`/`height` у родителя на растущих осях. Cookbook `group-auto-scaling` остаётся iframe до 07.
