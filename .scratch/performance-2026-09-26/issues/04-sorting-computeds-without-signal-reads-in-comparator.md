# 04. Сортировки в computed без чтения сигналов в компараторе

Status: resolved
Type: task
Blocked by: —

`NodeRenderingService.nodes` и `groups` сортируют `renderOrder()` прямо в компараторе, `EdgeRenderingService.maxOrder` читает `renderOrder()` всех рёбер. Порядок чтения сигналов в компараторе зависит от данных, поэтому при перезапуске такой computed попадает в ту же ловушку `isValidLink`, что и шаблон до фикса (см. spec.md, причина 1): каждое повторное непоследовательное чтение — O(числа продюсеров). Сейчас `nodes` читается только из API (`getNodesAtPoint`, `getIntersectingNodes`) и `groups` — только при `detachedGroupsLayer`, поэтому в демо это не проявилось; приложение, вызывающее `getIntersectingNodes` на каждом `nodeDrag`, получит O(n²) на 5000 узлов.

Предложение: снять ключи один раз (`nodes.map(n => [n, n.renderOrder()])`), сортировать массив пар, вернуть модели; `culled()` тоже читать один раз на узел. Добавить unit-тест, который считает количество чтений `renderOrder` при перезапуске.

## Answer

Сделано: `NodeRenderingService.nodes` и `groups` сортируют через `byRenderOrder`, который читает `renderOrder()` каждого узла один раз до `sort`. `EdgeRenderingService.maxOrder` читает порядки последовательно по одному разу, ловушки в нём нет.

Замер: временный Karma-бенчмарк (dev mode), 5 000 узлов со случайным `renderOrder`, пересчёт `nodes()` после смены `renderOrder` одного узла, медиана из 7:

| Потребитель                                   | До      | После  |
| --------------------------------------------- | ------- | ------ |
| Неживой (вызов API вне реактивного контекста) | 11.0 мс | 3.2 мс |
| Живой (внутри `effect`)                       | 1351 мс | 2.5 мс |

Живой случай — эффект `z-index` узла при `detachedGroupsLayer` (читает `groups()`) или приложение, вызывающее `getNodesAtPoint`/`getIntersectingNodes` из `effect`/`computed`. Демо Virtualization этот путь не нагружает, поэтому `bench.mjs` здесь не показателен.
