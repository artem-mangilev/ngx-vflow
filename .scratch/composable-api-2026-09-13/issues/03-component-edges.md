# 03. Компонентные рёбра

Status: ready-for-agent
Type: task
Blocked by: 02

Реализовать D4 из `spec.md`.

- `interfaces/edge.interface.ts`: `component?: NodeComponentType` (переименовать алиас в
  `EntityComponentType`, оставить `NodeComponentType` как алиас); `createEdge` прокидывает поле.
- `EdgeComponent`: `providers: [EdgeAccessorService]` (новый, по образцу `NodeAccessorService`),
  токен `EDGE_REF` = `model().context.$implicit`, `injectEdge<T>()`. При `component` создать
  `<svg:g class="vflow-edge-host">` и передать его как `hostElement` в `[entityComponentOutlet]`;
  иначе шаблон `ng-template[edge]`, как сейчас.
- Шина: `pushEdgeEvent`, `event$` для рёбер; `VflowComponent.componentEdgeEvent` через
  `outputFromObservable`; тип `ComponentEdgeEvent<T>` / `AnyComponentEdgeEvent`.
- `CustomTemplateEdgeComponent` → `CustomEdgeComponent`, селектор `g[customEdge]`; файл и мок в
  `testing` переименовать.
- Спеки: host компонента это `SVGGElement`; host-биндинги применяются к `<g>`; `injectEdge()`;
  событие уходит с `edgeId`; ленивая фабрика для ребра.

Файлы: `libs/ngx-vflow/src/lib/vflow/interfaces/edge.interface.ts`, `components/edge/edge.component.*`,
`services/edge-accessor.service.ts`, `public-components/custom-template-edge/` →
`public-components/custom-edge/`, `components/vflow/vflow.component.ts`, `public-api.ts`, `vflow.ts`.
