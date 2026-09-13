# 03. Компонентные рёбра

Status: resolved
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

## Answer

Сделано 2026-09-13.

- `Edge.component?: EntityComponentType` (общий тип с нодами, бывший `NodeComponentType`), `createEdge` передаёт
  поле как есть.
- `EntityComponentOutletDirective` получил вход `entityComponentOutletSvgHost`: компонент создаётся через
  `createComponent` с `hostElement`, равным `<svg:g>` в SVG namespace, и его представление вставляется в
  контейнер внутри `<svg edge>`. Селектор компонента не используется, host-биндинги применяются к группе.
- `EdgeComponent` рендерит компонент ребра через outlet, иначе `ng-template[edge]`; фокус-индикатор,
  reconnect-хэндлы, `visibility` и `zIndex` остались в библиотечном SVG. Провайдит `EDGE_REF` через
  `inject(EdgeComponent)`; `injectEdge<T>()` и `EdgeRef<T>` публичные, `EdgeContext` теперь
  `{ $implicit: EdgeRef }`.
- Шина: `pushNodeEvent`/`nodeEvent$` и `pushEdgeEvent`/`edgeEvent$`. У `vflow` новый output
  `(componentEdgeEvent)`; типы `ComponentEdgeEvent<T>`, `AnyComponentEdgeEvent`, общий `ComponentOutputEvent<T>`.
- `CustomTemplateEdgeComponent` переименован в `CustomEdgeComponent` (`g[customEdge]`) вместе с моком.
  Переименование прошло по docs, consumer, `@vflow/ui` и e2e (20 файлов).
- Docs: на странице custom-edges добавлены раздел и демо `ComponentEdgesDemoComponent` (ребро-компонент с
  output `picked` и `(componentEdgeEvent)`).

Проверки: typecheck библиотеки, спек и docs; eslint и prettier; `nx build ngx-vflow`; `nx build docs` без
предупреждений; `consumer:check`; юнит-тесты библиотеки 239/239 (новые: хост компонента и ленивой фабрики
это SVG-группа внутри `svg[edge]` с путём, контекст ребра в компоненте и в компоненте внутри шаблона ребра,
события ребра приходят в `componentEdgeEvent` и не попадают в `componentNodeEvent`), docs 1/1; e2e docs
32/32. В браузере на custom-edges оба компонентных ребра видимы, клик по ребру показывает его id через
событие компонента и выделяет ребро, шаблонное демо не изменилось; в чистом Playwright ошибок консоли нет.
