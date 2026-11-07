# 01. Геометрия всех нод в параметрах `CurveFactory`

Status: resolved
Type: task
Blocked by: —

Спецификация: [spec.md](../spec.md), раздел «Что нужно от ядра», п. 1.

## Что сделать

- В `CurveFactorySharedParams` (`libs/ngx-vflow/src/lib/vflow/interfaces/curve-factory.interface.ts`) добавить `nodeGeometries: readonly NodeGeometry[]` — абсолютная позиция и измеренный размер каждой ноды, в том же порядке, что `allNodes`.
- `NodeGeometry` дополнить `parentId: string | null` (из `NodeModel.parent()`), чтобы фабрика могла исключить предков ребра из препятствий без поиска по `allNodes`.
- Источник — один `computed` в `FlowEntitiesService` (`nodes().map((m) => m.geometry())`), который `EdgeModel.getPathFactoryParams` и `ConnectionComponent` передают в параметры. Оба места строят параметры отдельно — передать через общий хелпер, чтобы не разъехались.
- `allNodes`/`allEdges` остаются (приложенческие данные нужны фабрикам, читающим `data`).
- Docs: страница `Edges → Curves` (custom curve) — параграф про `nodeGeometries` и про то, что `allNodes` у `auto`-нод не несёт размера.

## Готово, когда

- Spec в `edge.model`/`curve-factory` проверяет, что фабрика получает измеренный размер `auto`-ноды (browser mode) и `parentId`.
- Существующие кривые и `getFloatingEdgeParams` не изменились.
- Нет новых чтений сигналов в host-биндингах (память: pan/zoom smoothness).

## Comments

2026-11-07, сделано:

- `NodeGeometry.parentId: string | null`; `NodeModel.geometry` отдаёт его из `parent()`. `geometry` и `parent` получили явные аннотации `Signal<…>` — иначе TS7022 (циклический вывод типа через `nodeByIdMap`).
- `FlowEntitiesService.nodeGeometries = computed(nodes().map(geometry))`.
- `CurveFactorySharedParams.nodeGeometries` — **getter** на объекте параметров в `EdgeModel.getPathFactoryParams` и `ConnectionComponent`: сигнал читается только фабрикой, которая обращается к полю, поэтому путь bezier/step-ребра не пересчитывается при движении посторонней ноды. Spread `{ ...params, borderRadius: 0 }` для `'step'` убран (он бы вычислил getter): оба switch заменены общим `resolveCurve(curve, params)` в `math/edge-path/resolve-curve.ts`.
- Spec `components/vflow/curve-factory-params.spec.ts`: измеренный размер auto-ноды и `parentId` в порядке `allNodes`; ленивость (счётчик вызовов фабрики при движении посторонней ноды).
- Docs: абзац на странице Curves.
