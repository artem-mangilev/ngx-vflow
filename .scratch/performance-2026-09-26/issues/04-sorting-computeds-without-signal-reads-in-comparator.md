# 04. Сортировки в computed без чтения сигналов в компараторе

Status: needs-triage
Type: task
Blocked by: —

`NodeRenderingService.nodes` и `groups` сортируют `renderOrder()` прямо в компараторе, `EdgeRenderingService.maxOrder` читает `renderOrder()` всех рёбер. Порядок чтения сигналов в компараторе зависит от данных, поэтому при перезапуске такой computed попадает в ту же ловушку `isValidLink`, что и шаблон до фикса (см. spec.md, причина 1): каждое повторное непоследовательное чтение — O(числа продюсеров). Сейчас `nodes` читается только из API (`getNodesAtPoint`, `getIntersectingNodes`) и `groups` — только при `detachedGroupsLayer`, поэтому в демо это не проявилось; приложение, вызывающее `getIntersectingNodes` на каждом `nodeDrag`, получит O(n²) на 5000 узлов.

Предложение: снять ключи один раз (`nodes.map(n => [n, n.renderOrder()])`), сортировать массив пар, вернуть модели; `culled()` тоже читать один раз на узел. Добавить unit-тест, который считает количество чтений `renderOrder` при перезапуске.
