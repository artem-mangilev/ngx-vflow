# 05. Реестр сущностей вместо `contentChildren(KeyboardEntityDirective, { descendants: true })`

Status: needs-triage
Type: task
Blocked by: —

`KeyboardNavigationDirective.entities` — content query с `descendants: true` на корне flow. Angular создаёт объекты запроса в каждом LView под корнем: в куче 83 578 `_LQuery_` и 24 613 `_LQueries_` на 9 799 сущностей, а обновление результата запроса — обход дерева view при каждом изменении структуры. Запрос нужен только для списка Tab-стопов в порядке DOM и починки фокуса.

Предложение: `KeyboardEntityDirective` регистрируется в сервисе flow (как хэндлы в `HandleService`), порядок берётся из `FlowEntitiesService.nodes()`/`validEdges()` (тот же порядок, что в шаблоне). `afterRenderEffect` подписывается на сигнал реестра вместо query-сигнала.

Метрика: `_LQuery_` в `heap.mjs` близко к нулю; время создания в `profile.mjs load` (prod) ниже.
