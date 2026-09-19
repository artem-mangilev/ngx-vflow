# Спецификация: единая нода, компонентные ноды и рёбра, handle-директива, декларативные лейблы

Status: in-progress (01–07 resolved)
Ветка: `3.0`. Обсуждение и сравнение с React Flow, ng-diagram и Foblex зафиксированы в `report.md`.

## Цель

Свести публичный API рендера к одной модели: любая сущность графа (нода, ребро) рисуется либо
компонентом, указанным в данных, либо единственным шаблоном-фолбэком, а всё, что живёт «внутри»
сущности (handle, лейбл ребра, ресайзер), объявляется декларативно в её презентации. Библиотека
владеет геометрией, слоями и взаимодействием; приложение владеет DOM и внешним видом.

## Термины

- **Презентация сущности**: компонент из поля `component` или шаблон `ng-template[node]` /
  `ng-template[edge]`. Один и тот же контекст доступен в шаблоне через `let-ctx` и в компоненте
  через DI (`injectNode()` / `injectEdge()`).
- **Контекст ноды** (`NodeRef<T>`): `id`, `node`, `data`, `selected`, `preselected`, `width`,
  `height`, `shouldLoad`. Ширина и высота всегда есть: в `auto` это измеренный размер, в `explicit`
  размер из данных или ресайзера (см. `resizer-size-model-2026-09-13/spec.md`).
- **Контекст ребра** (`EdgeRef<T>`): `id`, `edge`, `data`, `path`, `markerStart`, `markerEnd`,
  `selected`, `preselected`, `shouldLoad`.
- **Handle**: элемент презентации ноды с директивой `[vflowHandle]`. Точка соединения это центр
  этого элемента. В `CONTEXT.md` термин «Handle» нужно добавить при реализации.
- **Лейбл ребра**: элемент с `*edgeLabel` (или `ng-template[edgeLabel]`), объявленный внутри
  презентации ребра рядом с её `svg:g` и отрендеренный библиотекой в HTML-слое лейблов в точке
  `start | center | end` пути.

## Решения

### D1. Одна нода. `template-group`, `html-template` и `groupNode` удаляются

```ts
export interface Node<T = any> {
  id: string;
  point: WritableSignal<Point>;
  component?: NodeComponentType; // D2
  data?: WritableSignal<T>;
  width?: WritableSignal<number>; // оба заданы => sizeMode 'explicit'
  height?: WritableSignal<number>;
  draggable?;
  parentId?;
  extent?;
  selected?;
  selectable?;
  focusable?;
  ariaLabel?;
  ariaDescription?;
  domAttributes?; // как сейчас
}
```

- `HtmlTemplateNode`, `ComponentNode`, `TemplateGroupNode`, `isTemplateNode`,
  `isTemplateGroupNode`, `GroupNodeContext`, `GroupNodeTemplateDirective` удаляются.
  `isComponentNode(node)` означает `node.component !== undefined`.
- `StaticNode`, `NodeWithDefaults`, `createNode`/`createNodes` теряют ветвление по типу. Размер
  по-прежнему не подставляется по умолчанию (D2 прошлой спеки).
- Рендер одной веткой: `.selectable > .wrapper[nodeHandlesController nodeResizeController]`, внутри
  либо компонент (D3), либо шаблон. Нода без компонента и без шаблона рендерит пустую обёртку своего
  размера, а не dev-ошибку (решено при реализации 01). Ветка «группа без wrapper» исчезает; группа это нода с
  `width`/`height` в данных и детьми по `parentId`. `isMeasured` для всех нод выставляется
  `nodeResizeController`, как сейчас для html/component.
- `NodeContext.$implicit` получает `width` и `height` (readonly-сигналы модели) для всех нод.
  Шаблон группы из docs становится веткой одного шаблона по `ctx.data().type`.
- `sizeMode` теряет условие `rawNode.type === 'template-group'`; остаются наличие обоих размеров и
  `resizedExplicitly`.
- `shouldLoad`: класс компонента грузится сразу; ленивая фабрика и шаблон ждут viewport, как
  сейчас. Условие по `type` заменяется на `!isClass(node.component)`.
- `ariaLabels.groupLabel` остаётся и выбирается по `children().length > 0`, а не по типу.
  Тем же правилом (`isGroupNode`) пользуются слой групп, миникарта и фильтр перетаскивания при выделении.
- Миграция: `type: 'template-group'` → убрать `type`, оставить `width`/`height`;
  `type: 'html-template'` → убрать `type`; `<ng-template groupNode>` → ветка в `ng-template[node]`.

### D2. `type` удаляется, рендер решает `component`

```ts
export type NodeComponentType = Type<unknown> | (() => Promise<Type<unknown>>);
```

- Есть `component` → рендерится компонент. Нет → `ng-template[node]`. Нет ни того, ни другого →
  ошибка в dev-режиме с id ноды.
- Прикладной дискриминатор живёт в `data` (`ctx.data().type`), библиотека его не читает.
- `NodeHtmlTemplateDirective` переименовывается в `NodeTemplateDirective` с селектором
  `ng-template[node]`, по аналогии с `ng-template[edge]`. Внутренний `div[node]` не конфликтует,
  как не конфликтуют `svg[edge]` и `ng-template[edge]`.
- Ограничение на базовый класс снимается: `component` принимает любой компонент.

### D3. Компоненты создаются через `createComponent`, контекст через DI, события через `reflectComponentType`

- Внутренняя директива `[entityComponentOutlet]` (одна для нод и рёбер):
  `createComponent(type, { hostElement?, elementInjector, environmentInjector })`, затем
  `viewContainerRef.insert(ref.hostView)`. Для ноды `hostElement` не передаётся, хост создаётся из
  селектора в HTML. Для ребра передаётся `<svg:g>` (D4). `ngComponentOutlet` больше не используется:
  он не даёт подписаться на output.
- Ленивая фабрика резолвится, как сейчас в `componentInstance$`, по `shouldLoad`.
- Контекст через DI. `NodeComponent` предоставляет токен `NODE_REF` со значением
  `model.context.$implicit`; `injectNode<T>()` это `inject(NODE_REF)`. Тот же объект получает
  шаблон через `let-ctx`, так что контракт один. Аналогично `EDGE_REF` / `injectEdge<T>()` в
  `EdgeComponent`. `data` в контексте readonly; кто хочет писать, берёт `ctx.node.data`.
- `CustomNodeComponent`, `isCustomNodeComponent`, `NodeAccessorService`-зависимость из публичного
  API удаляются. Вход `node` в компонент автоматически не ставится.
- События. После создания: `reflectComponentType(type).outputs` → для каждого `{ propName,
templateName }` подписка `instance[propName].subscribe(...)`. Работает для `EventEmitter`,
  `output()` и `outputFromObservable`. В шину уходит `{ nodeId, eventName: templateName,
eventPayload }`. Подписки снимаются при уничтожении вью. `(componentNodeEvent)` и типы
  `ComponentNodeEvent<[A, B]>` / `AnyComponentNodeEvent` остаются; generic теперь описывает
  объявленные output, а не поля инстанса.
- Симметрично для рёбер: `(componentEdgeEvent)` с `{ edgeId, eventName, eventPayload }` и тип
  `ComponentEdgeEvent<[A, B]>`. Один сервис шины с двумя потоками.
- Отвергнуто: убрать шину и оставить только DI-сервис приложения. Пользователь решил оставить шину.
- Решено при реализации 02: `eventName` это имя свойства output на классе, а не его алиас, чтобы
  совпадать с ключами, которые выводит `ComponentNodeEvent<[...]>`. `NodeRef` не дублирует `id`,
  он доступен как `ctx.node.id`. `NODE_REF` публичный, чтобы `provideCustomNodeMocks` и тесты приложений
  могли подставить контекст. Внутренняя директива названа `EntityComponentOutletDirective`
  (`ng-container[entityComponentOutlet]`) и сама разрешает ленивые фабрики, так что
  `NodeModel.componentInstance$`, `componentTypeInputs` и `isComponentType` удалены.

### D4. Компонентные рёбра

```ts
export interface Edge<T = unknown> extends Connection {
  id: string;
  component?: NodeComponentType;   // общий алиас, переименовать в EntityComponentType
  curve?, data?, markers?, reconnectable?, floating?, selected?, ...
  // edgeLabels удалено, см. D6
}
```

- `EdgeComponent` при наличии `component` создаёт `<svg:g class="vflow-edge-host">` внутри своего
  `<svg>` и передаёт его как `hostElement`. Селектор компонента при этом не используется, поэтому
  `g[myEdge]` и `my-edge` оба работают; в документации рекомендуем `g[myEdge]` для читаемости.
  Host-биндинги компонента применяются к `<g>`.
- Иначе, как сейчас, рендерится `ng-template[edge]`. Focus-индикатор, reconnect-хэндлы и
  `visibility`/`zIndex` остаются в библиотечном `<svg edge>`.
- Интерактивный штрих и выделение (решено 2026-09-13). `EdgeComponent` выделяет ребро по клику и поднимает его на
  `mousedown`/`touchstart`, `selectable` к рёбрам не относится, `CustomTemplateEdgeComponent` удалён. Прозрачный путь
  шириной `Edge.interactionWidth` (по умолчанию 20, `0` скрывает) лежит внутри презентации, чтобы клики, наведение и
  `:hover` доходили до неё: директива `g[edgeInteraction]` вставляет его первым элементом своей группы в шаблоне, а
  компонентное ребро подключает `EdgeInteractionDirective` через `hostDirectives`, и путь попадает в хост. Запасного пути в корне SVG нет (решение
  пользователя): без директивы у ребра нет зоны клика, выделяет только клик по своему элементу с `pointer-events="stroke"`. Референсы: React Flow (`BaseEdge`, `interactionWidth` 20, выделение в обёртке ребра),
  ng-diagram (путь в базовом компоненте ребра), Foblex (`.f-connection-selection` внутри `f-connection`).
- Решено при реализации 03: `EDGE_REF` провайдится в `EdgeComponent` через `inject(EdgeComponent)`, отдельный
  `EdgeAccessorService` не понадобился. Алиас типа компонента назван `EntityComponentType` без
  `NodeComponentType`. Шина разделена на `pushNodeEvent`/`nodeEvent$` и `pushEdgeEvent`/`edgeEvent$`; общий
  вывод событий из output вынесен в публичный `ComponentOutputEvent<T>`. Outlet получил вход
  `entityComponentOutletSvgHost` и в этом режиме создаёт компонент через `createComponent` с `hostElement`
  `<svg:g>`, вставляя его представление в контейнер. На странице custom-edges добавлено демо
  `ComponentEdgesDemoComponent`.
- Отвергнуто: HTML-хост с `<svg>` внутри, который рисует консьюмер или библиотечный `<svg
vflowBaseEdge>` (модель ng-diagram/Foblex). Требует переделки reconnect и селекции и сужает
  свободу рисовать произвольный SVG. Подробности в `report.md`.

### D5. Handle это директива в core; визуал целиком у консьюмера

Пересмотрено 2026-09-15. Ядро делает только регистрацию, измерение и позиционирование элемента; размер,
цвет, рамка и `pointer-events` принадлежат приложению. Состояние отдаётся двумя каналами: атрибутами
host-элемента для CSS и сигналами самой директивы для кода.

- `VflowHandleDirective`, селектор `[vflowHandle]`, `exportAs: 'vflowHandle'`. Ставится на любой элемент
  презентации ноды или подключается компонентом через `hostDirectives`.
- Входы: `type: 'source' | 'target'`, `position`, `id`, `layout: 'auto' | 'manual'`,
  `offsetX`, `offsetY`, `canStart`, `canAccept`, `ariaLabel`, `ariaDescription`, `domAttributes`.
- Дефолты зашиты в директиву: `source`, `top`, `auto`, как у React Flow. `position` и `layout`
  обычные входы. Роль компонента на `hostDirectives` задаётся там, где он используется, через проброшенные входы
  (`inputs: ['type', 'position', …]`); компонент с неизменной ролью ставит `vflowHandle` на элемент
  своего шаблона. Решено 2026-09-15: провайдер дефолтов удалён, он требовал публичных полей-двойников входов
  (`positionInput`/`layoutInput`) и давал второй способ задать роль.
- Состояние для CSS: класс `vflow-handle` и `data-vflow-handle-type`, `data-vflow-handle-position`,
  `data-vflow-handle-state`, `data-vflow-handle-can-start`, `data-vflow-handle-can-accept`. Префикс
  `data-vflow-` как у `data-vflow-no-drag`, чтобы не спорить с `data-type`/`data-state` приложения и
  `vflowPort` на том же элементе.
- Состояние для кода: сигналы директивы `state`, `type`, `position`, `id`, `canStart`, `canAccept`, `layout`.
  В шаблоне `#h="vflowHandle"`, в коде `inject(VflowHandleDirective)`: на хосте с `hostDirectives` и в любом
  элементе внутри handle. Отдельного токена нет, в отличие от `NODE_REF`/`EDGE_REF`: у ноды и ребра на элементе
  консьюмера нет директивы, а у handle есть. Контекста шаблона нет.
- Модель. `HandleModel` получает сигналы, а не снимок входов, поэтому смена `position`, `type`, `id`,
  `offset*` и `layout` на лету работает. `hostReference` и `handleElement` схлопываются в `element`;
  `rawHandle` удалён, читать `handle.type()`, `handle.position()`, `handle.id()`. Регистрация в
  `HandleService` в конструкторе директивы, снятие в `DestroyRef`.
- Точка соединения это середина стороны `position` у прямоугольника host-элемента (внешний край, как у
  React Flow и как было у `<handle>`), в единицах потока после деления на фактический zoom.
- Пересмотрено 2026-09-19: вход типа называется `handleType`, а не `type`, чтобы статический атрибут не попадал в
  нативный `type` у `button`/`input` и не спорил с входами компонентов на `hostDirectives`. Знак `offsetX`/`offsetY`
  исправлен: положительное значение сдвигает элемент и точку вправо и вниз (раньше наоборот, наследие `<handle>`).
  Путь ребра с маркером заканчивается на 2 единицы маркера раньше точки соединения (`markerInset`), кончик
  стрелки касается handle, а квадратный торец линии скрыт под наконечником.
- `layout: 'auto'`: директива пишет `position: absolute`, `top/left/right/bottom` и `transform`
  (`translate` по стороне плюс `offsetX/offsetY`). Якорь это родитель host: handle встаёт на сторону ноды на
  уровне центра родителя. Координаты считаются от фактического containing block host-элемента
  (`offsetParent`, его padding box и scroll). Если это сама нода, стили как раньше (`left: 0` / `right: 0`),
  иначе `left/top` от этого блока, поэтому `position: relative` у строки поля или карточки не сдвигает handle.
  В `auto` директива владеет `transform`; для эффектов наведения использовать CSS-свойства `scale`/`translate`
  или вложенный элемент.
- `layout: 'manual'`: стили не пишутся, консьюмер размещает элемент сам, точка берётся из измеренного
  прямоугольника; `offsetX/offsetY` не применяются. Перемер по resize host, его родителя и ноды.
- Пустой handle: элемент обязан оставаться в layout. `visibility: hidden`, `opacity: 0` и нулевой размер
  измеряются. `display: none` нет: модель помечается `hasBox = false`, рёбра к ней не показываются, но нода
  не ждёт такой handle для показа. Первое такое измерение даёт dev-warning. Чтобы из невидимого handle
  можно было тянуть, ему дают размер и `opacity: 0`.
- Pointer: `mousedown`/`touchstart` и `mouseup`/`touchend` через host-listeners директивы;
  `RootPointerDirective` инжектится опционально, чтобы директива работала в юнит-тестах консьюмера с
  `provideCustomNodeMocks()`. `PointerDirective` в `hostDirectives` не используется: его output
  защищены, и он требует корневой директивы.
- A11y: логика `EntityAccessibilityDirective` вынесена в функцию `bindEntityAccessibility(source)`,
  директива `[vflowA11y]` и handle вызывают её; `hostDirectives` с обязательным входом не нужен.
- Магнит (зона прилипания при активном соединении) рендерит `NodeComponent` в слое ноды по
  `localPoint` каждого измеренного handle, как контролы ресайзера. `validateConnection`,
  `resetValidateConnection` и `endConnection` на магните живут в `NodeComponent`.
- Удаляются в этой же задаче, без переходной обёртки: `HandleComponent` (`<handle>`),
  `HandleTemplateDirective`, `HandleContext`, вход `template`, стили `.handle--*`. Docs, `apps/consumer`,
  моки `ngx-vflow/testing` и e2e-селекторы переводятся сразу.
- `@vflow/ui`: `VflowPort` сам является handle: `hostDirectives: [VflowHandleDirective]` с пробросом
  `type`, `position`, `id`, `layout`, `offsetX/Y`, `canStart`, `canAccept`, `aria*`, `domAttributes`
  (`<span vflowPort type="target" position="left">`). `state` берётся из директивы на том же
  элементе; `vflowPortState` остаётся явным override. `vflowHandle` и `vflowPort` на одном элементе не ставятся
  (директива применилась бы дважды); порт вне ноды не работает (решено 2026-09-15, других использований нет).
- Тестовые моки: `HandleMockDirective` с селектором `[vflowHandle]` и теми же входами, провайдит себя
  как `VflowHandleDirective` (`useExisting`), поэтому `inject(VflowHandleDirective)` работает и с моками. Компонент консьюмера с `hostDirectives: [VflowHandleDirective]` (и `vflowPort`) в
  юнит-тесте получает настоящую директиву, её зависимости покрывает `provideCustomNodeMocks()`.

```html
<span vflowHandle type="source" position="right" id="out" class="port"></span> <span vflowPort type="target" position="left" [vflowPortConnected]="hasEdge()"></span>
```

```ts
@Component({
  selector: 'app-output-port',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['type', 'position', 'id', 'canStart'] }],
  template: `<svg:svg viewBox="0 0 12 12">…</svg:svg>`,
})
export class OutputPortComponent {
  protected readonly handle = inject(VflowHandleDirective);
}
```

```html
<app-output-port type="source" position="right" id="out" />
```

- Тип handle это вход `type` (решено 2026-09-15), как у React Flow и старого `<handle>`. Вариант
  `vflowHandle="source"` отвергнут: компонент на `hostDirectives` мог пробросить вход только под другим именем,
  иначе атрибут `vflowHandle` в шаблоне с импортом `Vflow` совпадал с селектором и директива применялась второй
  раз (NG0309). Цена: статический `type` доходит и до нативного атрибута, поэтому handle не ставится на
  `button` и `input`; это описано в документации и в JSDoc входа.
- TODO: придумать префикс для входов handle (например `vflowType` или `vwType`), чтобы они не конфликтовали с
  нативными атрибутами и входами компонентов, применяющих директиву через `hostDirectives`. Пометка оставлена
  в `handle.directive.ts`.
- Отвергнуто: `PointerDirective` и `EntityAccessibilityDirective` через `hostDirectives` (см. выше);
  переходная обёртка `<handle>` с `@deprecated` (решение пользователя, удалить сразу);
  `provideHandleDefaults()` (был реализован и удалён 2026-09-15, см. выше); `injectHandle()`, `HANDLE_REF` и
  `HandleRef` (реализованы и удалены 2026-09-15: директива сама доступна через DI и `exportAs`, а мок подменяет её
  класс); `vflowPort` как отдельный визуал,
  читающий состояние handle-предка через токен; `data-type`/`data-state`
  без префикса (конфликт с атрибутами приложения и `vflowPort`).

### D6. Лейблы рёбер объявляются внутри презентации ребра

```html
<ng-template let-ctx edge>
  <svg:g edgeInteraction>
    <svg:path vflowEdge [attr.d]="ctx.path()" />
  </svg:g>

  <span *edgeLabel vflowEdgeLabel>{{ ctx.data().label }}</span>
  <button *edgeLabel="'end'" vflowEdgeLabel (click)="remove(ctx.edge)">×</button>
</ng-template>
```

- `EdgeLabelTemplateDirective`, селектор `ng-template[edgeLabel]`. Единственный вход `edgeLabel:
EdgeLabelPosition` (`'start' | 'center' | 'end'`) с дефолтом `center` и `transform`, который
  превращает пустую строку в `center`: и `*edgeLabel`, и `<ng-template edgeLabel>` ставят статический
  атрибут со значением `''`. Отдельного входа `position` нет, потому что у микросинтаксиса одно главное
  поле с именем селектора.
- Две формы записи, одна механика (решено 2026-09-14). Структурная `*edgeLabel` / `*edgeLabel="'end'"`
  для одного корневого элемента, это основной вид в документации. Длинная
  `<ng-template edgeLabel="end">…</ng-template>` для нескольких корневых элементов. Обе
  разворачиваются в `ng-template` с `TemplateRef`; содержимое не проецируется на месте, а рендерится в
  слое лейблов. Значение в `*edgeLabel="'end'"` это выражение, кавычки обязательны; `*edgeLabel="end"`
  со `strictTemplates` не компилируется, молчаливого `undefined` нет.
- Директива инжектит `EdgeComponent` (`EDGE_REF` провайдится там же, см. D4) и в эффекте по
  `edgeLabel()` регистрирует `TemplateRef` в `EdgeModel.labelTemplates: signal<Partial<Record<EdgeLabelPosition,
TemplateRef>>>`, снимая регистрацию через `onCleanup` при смене позиции и на destroy. Две регистрации
  на одну позицию: побеждает последняя, dev-warning.
- Namespace (проверено 2026-09-14 одноразовым Karma-тестом, zoneless TestBed). Angular наследует
  namespace родителя для детей `ng-template`: `<span>` внутри `ng-template` внутри `<svg:g>` компилируется
  как SVG-элемент (`namespaceURI` svg, не `HTMLElement`) и в HTML-слое не рисуется; тот же `span`
  рядом с `<svg:g>` внутри `ng-template[edge]` или `ng-container` получает HTML namespace. Библиотека
  это на этапе компиляции не чинит. Правило для обеих форм: лейбл стоит рядом с `svg:g`, не внутри;
  для компонентного ребра в корне шаблона компонента. Пример выше и все демо следуют правилу.
  `div[edgeLabelHost]` после рендера проверяет `namespaceURI` первого элемента обёртки и в dev-режиме
  предупреждает с подсказкой вынести `*edgeLabel` из svg-элемента.
- Кривая без `labelPoints` (кастомная `CurveFactory`): лейбл не рендерится; директива при регистрации
  даёт dev-warning.
- Проверено 2026-09-13 одноразовым Karma-тестом: директива с селектором `ng-template[...]` получает
  вход и из статического атрибута, и из биндинга, `inject(TemplateRef)` работает.
- Внутренний `div[edgeLabel]` переименовывается в `div[edgeLabelHost]`, чтобы не конфликтовать.
  Входы: `edgeModel`, `position`, `template`, `injector`; outlet с пустым контекстом и инжектором
  ребра. Позиционирование по `path().labelPoints[position]`, `visibility` по `isReady`/`reconnecting`,
  `zIndex = renderOrder`, `pointer-events: all` на обёртке не меняются.
- Слой лейблов в `vflow.component.html` итерирует записи `model.labelTemplates()` вместо трёх
  захардкоженных блоков по `labelModels()`.
- Удаляются: `Edge.edgeLabels`, `EDGE_DEFAULTS.edgeLabels`, `EdgeLabel`, `HtmlTemplateEdgeLabel`,
  `EdgeLabelModel`, `EdgeLabelHtmlTemplateDirective` (`ng-template[edgeLabelHtml]`),
  `HtmlEdgeLabelContext`, `contentChild(EdgeLabelHtmlTemplateDirective)`. `EdgeLabelPosition`
  остаётся публичным типом. Данные лейбла берутся из `ctx.data()`.
- Решено при реализации 04 (2026-09-14). Отдельного входа `injector` у `div[edgeLabelHost]` нет: поиск DI идёт по
  цепочке объявления и на каждой границе view проверяет встроенный инжектор, поэтому контент лейбла из
  `ng-template[edge]` доходит до `EdgeComponent` через view шаблона ребра, а из компонентного ребра через хост
  компонента. `EdgeModel.labelEntries` отдаёт зарегистрированные шаблоны в порядке `start`, `center`, `end` для слоя.
  Мок `ngx-vflow/testing` рендерит лейбл на месте. ng-doc падает на любом слове со `*` в инлайн-коде markdown и
  JSDoc, если для него нет страницы; структурная форма пишется только в fenced-блоках.
- Отвергнуто (2026-09-14): `labelPoints` в `EdgeRef` для SVG-подписей через `<svg:text>`. Это второй
  способ рендера лейблов, который пришлось бы поддерживать и документировать наравне с первым.
- Отложено: числовая позиция `0..1` вдоль пути (ng-diagram, Foblex). Требует сэмплирования пути
  для `CurveFactory`; не входит в эту работу.

## Что ломается

- `Node`: union → один интерфейс; поля `type` нет; `component` вместо `type` для компонентов.
  `createNodes` больше не принимает `type`.
- `Edge`: поле `edgeLabels` удалено; добавлено `component`.
- Шаблоны `<vflow>`: `nodeHtml` → `node`; `groupNode` удалён; `edgeLabelHtml` удалён.
- `CustomNodeComponent` удалён; контекст через `injectNode()`; вход `node` не ставится.
- `<handle>` → `[vflowHandle]`; `HandleComponent`, `HandleTemplateDirective`, `HandleContext`, `[template]`
  удалены; дефолтной точки в core нет, визуал у приложения или `vflowPort` из `@vflow/ui`. Новое:
  `layout`; вход типа `type`; `vflowPort` сам является handle.
- `g[customTemplateEdge]` → `g[customEdge]`.
- Новые output: `(componentEdgeEvent)`.
- Внутренние (`ɵ`): `HandleModel.hostReference`/`handleElement` → `element`, `rawHandle` → сигналы
  `type`/`position`/`id`; `NodeModel.context`
  для всех нод с `width`/`height`; `EdgeModel.labelModels` → `labelTemplates`.
- Тестовые моки `ngx-vflow/testing`: `handle-mock`, `template-mock` (`nodeHtml`, `groupNode`,
  `edgeLabelHtml`), `vflow-mock` (ветки по `type`, слой лейблов), `provide-custom-node-mocks`.

## Проверка

- Юнит (Karma): `createNodes` без `type`; `sizeMode` без ветки группы; `NodeModel.context.width`
  для `auto` и `explicit`; рендер компонента ноды без базового класса и получение `injectNode()`;
  события через `reflectComponentType` для `@Output`, `output()`, `outputFromObservable` и отписка
  при уничтожении; компонентное ребро рендерится в SVG-namespace (`instanceof SVGGElement` у host);
  `injectEdge()`; регистрация/снятие `edgeLabel` и рендер в слое лейблов; `[vflowHandle]` в `auto`
  и `manual`, точка на стороне `position`, `display: none` не измеряется и не блокирует ноду; `vflowPort` берёт `state` из
  `VflowHandle`; `initial-handles.spec.ts` остаётся зелёным.
- E2E (`apps/docs-e2e`): `resizer.spec.ts`, `custom-edge-interactions.spec.ts`,
  `accessibility.spec.ts`, `keyboard-navigation.spec.ts`, stress-rendering (первые кадры: 0 линий до
  готовности, затем все) остаются зелёными; новая проверка страницы Edge labels и Custom handles.
- Typecheck и lint библиотеки, `@vflow/ui`, docs и testing; сборка библиотеки.

## Порядок

01 → 02 → 03 → 04; 05 после 01; 06 после 05; 07 после 04 и 06; 08 после 07. Тикеты в `issues/`.
