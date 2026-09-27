# 05. Реестр сущностей вместо `contentChildren(KeyboardEntityDirective, { descendants: true })`

Status: wontfix
Type: task
Blocked by: —

`KeyboardNavigationDirective.entities` — content query с `descendants: true` на корне flow. Angular создаёт объекты запроса в каждом LView под корнем: в куче 83 578 `_LQuery_` и 24 613 `_LQueries_` на 9 799 сущностей, а обновление результата запроса — обход дерева view при каждом изменении структуры. Запрос нужен только для списка Tab-стопов в порядке DOM и починки фокуса.

Предложение: `KeyboardEntityDirective` регистрируется в сервисе flow (как хэндлы в `HandleService`), порядок берётся из `FlowEntitiesService.nodes()`/`validEdges()` (тот же порядок, что в шаблоне). `afterRenderEffect` подписывается на сигнал реестра вместо query-сигнала.

Метрика: `_LQuery_` в `heap.mjs` близко к нулю; время создания в `profile.mjs load` (prod) ниже.

## Answer

Не делаем: даже полное удаление content query в пределах шума.

Замеры `tools/bench.mjs`, prod, 7 прогонов, медиана [min..max]; база после тикета 01: load.readyMs 2320 [2241..3195], куча 305.4 MB. Порог «ощутимо»: ~8% по медиане при непересекающихся диапазонах.

Верхняя граница — `entities` заменён пустым сигналом (запрос не создаётся вообще): load.readyMs 2249 [2233..2286], куча 303.7 MB (−1.7 MB). Реестр стоил бы не меньше, чем отсутствие запроса, поэтому усложнять код ради этого нет смысла.
