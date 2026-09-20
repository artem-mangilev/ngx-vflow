# Архитектура ngx-vflow (ветка 3.0): внутренние швы для будущей системы плагинов

Источники — файлы репозитория `/Users/artemmangilev/Documents/dev/ngx-vflow` на ветке `3.0` (HEAD `af6b3cef`).
Ссылки даны как `путь:строка`. Всё, что не подтверждено кодом, помечено как пробел (Gap).

Пять целевых сценариев плагинов в задании не перечислены явно; по ключевым вопросам они реконструируются как:
**(1) layout-движок (dagre/ELK)**, **(2) parent auto-grow (авторазмер родительской ноды)**,
**(3) роутинг рёбер с обходом препятствий (libavoid)**, **(4) proximity-connect**, **(5) поворот ноды (rotation)**.
Сквозной «шестой» сюжет — drag-конвейер (snap/constrain/reparent), который обслуживает (1), (2) и (4).

---

## 1. Точки расширения сегодня

### Takeaway

Публичных «плагинных» швов нет: ни `provideX()`-функций, ни DI-токенов стратегий, ни реестра команд.
Расширение сегодня возможно ровно тремя способами: (а) входы/выходы `<vflow>` и декларативные директивы внутри
презентаций, (б) функции-фабрики в данных (`Edge.curve: CurveFactory`, `ConnectionSettings.validator`),
(в) импорт внутренних сервисов через `ɵ`-экспорты. Ни один сервис флоу не `providedIn: 'root'` — все
предоставляются на уровне компонента `<vflow>`, что архитектурно удобно для плагинов (несколько флоу на страницу),
но означает, что плагин обязан внедряться в дерево инжекторов `<vflow>`.

### Подтверждённые факты

- **Все сервисы — component-level.** `libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts:118-140`
  перечисляет 20 провайдеров в `providers: [...]` компонента `<vflow>`: `DraggableService`, `ViewportService`,
  `FlowStatusService`, `FlowEntitiesService`, `NodesChangeService`, `EdgeChangesService`, `NodeRenderingService`,
  `EdgeRenderingService`, `SelectionService`, `FlowSettingsService`, `ComponentEventBusService`, `KeyboardService`,
  `KeyboardEntityCommandsService`, `KeyboardLabelsService`, `KeyboardViewportCommandsService`, `AnnouncerService`,
  `OverlaysService`, `FlowRenderingService`, `ResizeObserverService`, `RequestAnimationFrameBatchingService`,
  плюс `AriaDescriber` из CDK. Ни в одном сервисе библиотеки нет `providedIn: 'root'`
  (проверено: все `@Injectable()` без аргументов, напр. `services/flow-settings.service.ts:9`,
  `services/draggable.service.ts:24`, `services/handle.service.ts:5`).
- **Ещё два уровня инжектора ниже:** узел (`components/node/node.component.ts:44-49` — `HandleService`,
  `NodeAccessorService`, `NODE_REF`) и ребро (`components/edge/edge.component.ts:43-46` — `EDGE_REF`).
- **DI-токенов всего два**, и оба — контекст сущности, а не расширение:
  `NODE_REF` (`utils/inject-node.ts:19`) и `EDGE_REF` (`utils/inject-edge.ts:19`).
  `grep "export function provide"` по `libs/ngx-vflow/src` и `libs/ui/src` не даёт ни одного совпадения —
  `provideX()`-конвенции в библиотеке нет вообще.
- **`ɵ`-экспорты как фактический «внутренний API»:** `libs/ngx-vflow/src/public-api.ts:72-88` экспортирует
  `ɵConnectionModel`, `ɵHandleModel`, `ɵNodeModel`, `ɵComponentEventBusService`, `ɵHandleService`,
  `ɵFlowSettingsService`, `ɵFlowStatusService`, `ɵFlowEntitiesService`, `ɵNodeAccessorService`, `ɵViewportService`,
  `ɵSelectionService`, `ɵNodeRenderingService`, `ɵRootPointerDirective`, `ɵSpacePointContextDirective`.
  Это готовый (хоть и негарантированный) набор швов для first-party extension, живущего вне основного пакета.
- **Явный запрет на `ɵ` в публичном контракте:** `.scratch/core-platform-parity/spec.md:22` —
  «Public APIs must not require consumers to import `ɵ` services or adopt an internal graph store».
  То есть текущее использование `ɵ` в `libs/ngx-vflow/testing` — исключение для тестов, а не образец.
- **Публичные директивы-расширения внутри презентации:** `libs/ngx-vflow/src/lib/vflow/vflow.ts:25-44` —
  массив `Vflow` (`VflowHandleDirective`, `ResizableComponent`, `SelectableDirective`, `EdgeInteractionDirective`,
  `MiniMapComponent`, `NodeToolbarComponent`, `DragHandleDirective`, `ConnectionControllerDirective`,
  шаблонные `ng-template[node] | [edge] | [edgeLabel] | [connection]`, и «gesture exclusions»
  `vflowNoDrag / vflowNoPan / vflowNoWheel / vflowNoKeyboard`).
- **Gesture exclusions — единственный декларативный «veto» сегодня:**
  `directives/gesture-exclusions.directive.ts:4,8,12,16` ставят `data-vflow-no-drag|no-pan|no-wheel|no-keyboard`,
  а потребители читают их через `closest()` (напр. `services/draggable.service.ts:188`,
  `services/keyboard.service.ts:196`). Это атрибутный протокол, а не DI.
- **Регистрация «изнутри наружу»** (образец для будущих плагинов-UI): директива/компонент, отрисованный внутри
  презентации, регистрирует себя в сервисе флоу: handle — `directives/handle.directive.ts:111-112`
  (`handleService.createHandle(model)` + `DestroyRef.onDestroy`); toolbar —
  `public-components/node-toolbar/node-toolbar.component.ts:61,65`; resizer — `resizerTemplate` ноды в
  `public-components/resizable/resizable.component.ts:114-124`; minimap —
  `public-components/minimap/minimap.component.ts:35-39` (`entitiesService.minimap.set(model)`);
  drag-handle — счётчик на модели, `directives/drag-handle.directive.ts:18-24`;
  label ребра — `directives/template.directive.ts:59-85` (`model.labelTemplates.update(...)` + `onCleanup`).
- **Event bus есть, но узкий.** `services/component-event-bus.service.ts:7-21` — два `Subject`:
  `nodeEvent$` / `edgeEvent$`, заполняемые из `NodeComponent.pushComponentEvent`
  (`components/node/node.component.ts:164-166`) и `EdgeComponent.pushComponentEvent`
  (`components/edge/edge.component.ts:100-102`). Событие — `{nodeId|edgeId, eventName, eventPayload}`, и туда
  попадают только `@Output`/`output()` компонента-презентации, найденные через `reflectComponentType`
  (директива `directives/entity-component-outlet.directive.ts`). Наружу выходит как
  `componentNodeEvent` / `componentEdgeEvent` (`components/vflow/vflow.component.ts:464,469`).
  **Это не шина событий движка** — внутренних событий (drag, connection, resize) там нет.
- **Реальная «шина» движка — `FlowStatusService`.** `services/flow-status.service.ts:105-120` —
  дискриминированный union из 15 состояний (`idle`, `connection-start|validation|release|release-validated|dropped`,
  те же для `reconnection-*`, `node-drag-start|node-drag|node-drag-end`, `selection-box-end`);
  `status` — сигнал (`:124`), `status$` — `shareReplay(1)` (`:125`). Это единственное место, где наблюдаемы все
  библиотечные жесты. Весь публичный drag-вывод построен поверх него
  (`directives/node-drag-controller.directive.ts:24-43`), и alignment-helper тоже
  (`components/alignment-helper/alignment-helper.component.ts:57-59,150-173`).
- **Strategy-абстракция ровно одна.** `libs/ngx-vflow/src/lib/vflow/strategies/` содержит
  `default-selection.strategy.ts` и `manual-selection.strategy.ts`, интерфейс —
  `interfaces/selection-strategy.interface.ts:16-19` (`select`, `handleViewportChange`). Выбор стратегии —
  **жёстко зашитая карта**, а не DI:
  ```ts
  // services/selection.service.ts:30-35
  private strategies: Record<SelectionMode, SelectionStrategy> = {
    default: new DefaultSelectionStrategy(),
    manual: new ManualSelectionStrategy(),
  };
  private currentStrategy = computed(() => this.strategies[this.flowSettingsService.selectionMode()]);
  ```
  Подменить стратегию снаружи нельзя; можно только выбрать `selectionMode: 'manual'`
  (`components/vflow/vflow.component.ts:339-342`) и делать всё самому.
- **Функции как точки расширения в данных (фактически «плагин на одну сущность»):**
  - `Edge.curve?: WritableSignal<Curve>`, где `Curve = 'straight'|'bezier'|'smooth-step'|'step'|CurveFactory`
    (`interfaces/edge.interface.ts:19,25`), `CurveFactory = (params: CurveFactoryParams) => CurveLayout`
    (`interfaces/curve-factory.interface.ts:92`).
  - `ConnectionSettings.validator?: ConnectionValidatorFn` (`interfaces/connection-settings.interface.ts:11,16`).
  - `ResizableComponent.shouldResize` (`public-components/resizable/resizable.component.ts:76`) — veto ресайза.
- **Capability policies — это сигнальные `computed`, а не объект политики.** Резолюция «на сущность или глобально»:
  `models/node.model.ts:110-111` (`selectable`/`focusable` = `rawNode.X?.() ?? settings.nodesX()`),
  `models/edge.model.ts:81-82`. Глобальные дефолты живут в `services/flow-settings.service.ts:12-15`.
  Handle-политики отдельные и локальные: `canStart` / `canAccept` — входы директивы
  (`directives/handle.directive.ts:74-75`), читаются в `connection-controller.directive.ts:132,159,245`.
- **`libs/ui` — модель «вторичного пакета».** `libs/ui/package.json` — отдельный пакет `@vflow/ui` с
  `peerDependencies: { ngx-vflow: "^2.7.0 || ^3.0.0" }`. Он **не использует `ɵ`-внутренности**: весь импорт из
  core — это `import { HandleState, VflowHandleDirective } from 'ngx-vflow'` (`libs/ui/src/lib/port.directive.ts:2`)
  и `import { VflowComponent } from 'ngx-vflow'` (`libs/ui/src/lib/controls.component.ts:2`). Механизм композиции —
  `hostDirectives` с проброшенными входами:
  ```ts
  // libs/ui/src/lib/port.directive.ts:10-27
  @Directive({
    selector: '[vflowPort]',
    hostDirectives: [{ directive: VflowHandleDirective,
      inputs: ['handleType','position','handleId','layout','offsetX','offsetY','canStart','canAccept','domAttributes'] }],
    host: { '[attr.data-state]': 'state()', '[attr.data-connected]': 'vflowPortConnected()' },
  })
  ```
  Плюс CSS-контракт: `ADR-0005` (`docs/adr/0005-independent-core-theme-contract.md`) — core владеет своими
  токенами, `@vflow/ui` только маппит на них.
- **Вторичная точка входа `ngx-vflow/testing`** существует (`libs/ngx-vflow/testing/src/public-api.ts`),
  но `libs/ngx-vflow/ng-package.json` объявляет только основной `entryFile: src/public-api.ts` — т.е. вторичные
  entry point'ы ng-packagr обнаруживает по вложенному `ng-package.json` (у `testing` его в листинге нет, см. Gap).

### Выводы (Inferences)

- Структурно библиотека уже «плагинопригодна»: component-scoped DI + `FlowStatusService` как общий канал событий +
  модели-сигналы (`NodeModel`, `EdgeModel`, `HandleModel`) как общая изменяемая поверхность. Не хватает не
  архитектуры, а **публичного контракта**: токена(ов) регистрации, типизированных хуков и гарантии стабильности.
- Самая естественная форма плагина в текущем коде — **директива на `<vflow>`** (как `ChangesControllerDirective` и
  `NodeDragControllerDirective`, применённые через `hostDirectives`, `vflow.component.ts:141`) или
  **провайдер в `providers` хост-компонента приложения**, инжектящий `ɵ`-сервисы. Оба варианта сегодня работают,
  но ни один не документирован.

### Gaps

- Нет ни одного файла со словом `plugin` в `libs/` — система плагинов не начата.
  `.scratch/plugin-architecture-2026-09-20/` создана, но пуста (`reports/`, `research_notes/` без файлов).
- `.scratch/flow-design-system/research.md:157` прямо говорит: «Не нужны сразу NodeFactory, registry DSL,
  универсальный renderer форм или **архитектура плагинов**» — то есть на момент того исследования плагины
  сознательно отложены. Актуальность этого суждения на 2026-09-20 не проверена.
- Наличие/отсутствие `libs/ngx-vflow/testing/ng-package.json` я не проверял; как пакет `ngx-vflow/testing`
  собирается — не подтверждено.

---

## 2. Drag-конвейер: от pointer down до записи позиции

### Takeaway

Весь drag — внутри `DraggableService.getDragBehavior()`, на `d3-drag`, без единого расширяемого шага.
Кандидатная позиция вычисляется и записывается в одном цикле `dragNodes.forEach` без промежуточного
«pipeline»-объекта; единственная трансформация — `alignToGrid` + `extent: 'parent'` clamp. rAF-батчинга в
drag-пути нет вообще (он применяется только к измерению handle и к overlays). Плагину сегодня доступны только
**наблюдение** (`FlowStatusService.status$`) и **пост-коррекция после отпускания** — ровно то, что делает
встроенный alignment-helper.

### Трассировка

1. **Включение поведения.** `components/node/node.component.ts:146-155` — эффект: `draggable()` →
   `draggableService.enable(hostElement, model)` / `disable`. `services/draggable.service.ts:40-42`:
   `select(element).call(this.getDragBehavior(model, element))`.
2. **Фильтр (единственный veto-шов).** `services/draggable.service.ts:176-205`:
   ```ts
   const filterCondition = (event: Event) => {
     if (isGroupNode(model) && this.keyboardService.isActiveModifier('selection')) return false;
     if (event instanceof MouseEvent && (event.ctrlKey || event.button !== 0)) return false;
     if (event.target instanceof Element && event.target.closest('[data-vflow-no-drag]')) return false;
     const nearest = event.target instanceof Element ? event.target.closest('.vflow-handle, .vflow-drag-handle') : null;
     if (nearest?.classList.contains('vflow-handle')) return false;
     if (model.dragHandlesCount()) return nearest !== null;
     return true;
   };
   ```
3. **Порог и активация.** `:228-236` — `drag().filter(filterCondition).on('start', ...)`, порог
   `settingsService.nodeDragThreshold()`; `:238-245` — активация после превышения порога.
   `activate()` (`:207-226`): выбирает `dragNodes`, ставит `dragging(true)` на каждую,
   вызывает `flowStatusService.setNodeDragStartStatus(model)` (`:213`), запоминает `initialPositions` как
   **смещение узла относительно точки указателя во flow-space** (`:219-222`).
4. **Каждый move (горячий путь):**
   ```ts
   // services/draggable.service.ts:246-258
   const flow = this.getFlowPoint(event.sourceEvent, getPaneRect());
   dragNodes.forEach((model, index) => {
     const point = { x: round(flow.x + initialPositions[index].x), y: round(flow.y + initialPositions[index].y) };
     this.alignToGrid(point);
     this.moveNode(model, point);
   });
   if (!starting) this.flowStatusService.setNodeDragStatus(model);
   ```
5. **Единственная запись позиции.** `:316-329`:
   ```ts
   private moveNode(model: NodeModel, point: Point) {
     const parent = model.parent();
     if (model.extent() === 'parent' && parent) {
       point.x = Math.min(parent.width() - model.width(), point.x); point.x = Math.max(0, point.x);
       point.y = Math.min(parent.height() - model.height(), point.y); point.y = Math.max(0, point.y);
     }
     model.setPoint(point);
   }
   ```
   `NodeModel.setPoint` → `this.point.set(point)` (`models/node.model.ts:265-267`), а `point` — **тот самый
   `WritableSignal` приложения**, подставленный в конструкторе (`models/node.model.ts:217-219`:
   `if (rawNode.point) this.point = rawNode.point;`). Запись идёт напрямую в состояние приложения.
6. **Конец.** `:261-269` — отписка от auto-pan, `dragging(false)`, `setNodeDragEndStatus(model)`.
7. **Уведомление наружу (после факта).** `services/node-changes.service.ts:16-30` слушает `node.point$` и
   формирует `[{type:'position', id, point}]`; `:75-85` — merge всех потоков с
   `observeOn(asyncScheduler, 25)` (`DELAY_FOR_SCHEDULER`, `:10`). Далее
   `directives/changes-controller.directive.ts:33-53` превращает это в выходы `nodesChanges`,
   `nodesChanges.position` и т. д. Тип `NodePositionChange` документирован как _post-factum_:
   «Reports a position that has already been written to the node's `point` signal»
   (`types/node-change.type.ts:5-9`).

### Где именно плагин мог бы вклиниться

- **(a) Трансформация кандидатной позиции (snap / constrain / layout).** Единственное место —
  между `:249-253` (вычисление `point`) и `moveNode` (`:255`). Сейчас там захардкожены `alignToGrid`
  (`:334-346`, читает `settings.snapGrid()`) и parent-clamp (`:320-326`). Хука нет.
  Вторая, «слабая» точка — сам `moveNode`, т.к. он же используется при auto-pan (`:373`) и
  `moveSelected` с клавиатуры (`:54-68`). **Один хук в `moveNode` покроет все три источника движения.**
- **(b) Наблюдение движения со всеми позициями (proximity).** `FlowStatusService` даёт только
  `payload.node` — **инициатора** жеста (`services/flow-status.service.ts:87-92`), не весь список
  `dragNodes`. Полный список живёт в замыкании `getDragBehavior` и наружу не выходит. Обойти можно через
  `FlowEntitiesService.nodes().filter(n => n.dragging())` — `dragging` — публичный сигнал модели
  (`models/node.model.ts:54`), выставляемый в `activate()` (`:210`).
- **(c) Конец жеста → структурная операция (connect/reparent).** Точка — `node-drag-end` статус
  (`services/flow-status.service.ts:282-284`) или публичный выход `nodeDragEnd`
  (`directives/node-drag-controller.directive.ts:38-43`, payload — `{ node: Node }`).
  Образец уже есть в дереве:
  ```ts
  // components/alignment-helper/alignment-helper.component.ts:150-173
  toObservable(this.flowStatus.status).pipe(filter(isNodeDragEndStatus), ...
    tap(([node, intersections]) => { const snapped = {...};
      const parent = node.parent();
      if (parent) node.setPoint({ x: snapped.x - parent.globalPoint().x, y: snapped.y - parent.globalPoint().y });
      else node.setPoint(snapped); }), takeUntilDestroyed()).subscribe();
  ```
  Это фактически **эталон плагина «snap on drop»**, написанный внутри core.
- Структурные операции (reparent) при этом **не применяются библиотекой**: есть только чистые хелперы
  `reparentNodes(operations, nodes)` (`utils/graph-operations.ts:136-181`), которые приложение вызывает само.
  `reparentNodes` уже сохраняет визуальную позицию, пересчитывая `point` через flow-space (`:152-176`).

### Координаты, зум, вложенность

- Client → flow: `services/draggable.service.ts:278-285` → `utils/coordinates.ts:28-35`
  (`(client - container - viewport.xy) / zoom`). `paneRect` кешируется и инвалидируется через
  `ResizeObserver` + `IntersectionObserver` + `scroll`/`resize` (`:101-174`) — нетривиальная оптимизация,
  которую плагин переиспользовать не может (всё приватно).
- `point` ноды — **в node space родителя**; абсолют считается рекурсивно:
  `models/node.model.ts:131-144` (`globalPoint`). Drag работает во flow-space, но записывает `point` как есть,
  потому что `initialPositions` взяты как разность `node.point() - flowPointer` (`:219-222`) — смещение
  родителя сокращается, **пока родитель не двигается во время жеста**.
- Публичные преобразования: `VflowComponent.clientToFlowPosition` / `flowToClientPosition`
  (`components/vflow/vflow.component.ts:599-607` → `directives/space-point-context.directive.ts:39-53`) и
  чистые функции `utils/coordinates.ts:14,28,38,48,58` (`getNodePositionInSpace`, `nodeSpaceToFlowPosition`,
  `flowToNodeSpacePosition`).

### Multi-drag

- `getDragNodes` (`services/draggable.service.ts:287-297`): если нода выделена — все выделенные и draggable,
  минус потомки уже перетаскиваемых предков (`hasSelectedDraggableAncestor`, `:299-311`); иначе — только она.
- Все узлы двигаются одним синхронным циклом (`:248-256`), каждый со своим parent-clamp. **`FlowStatus` при этом
  несёт только инициатора** — для плагина это потеря информации.

### rAF-батчинг

- `RequestAnimationFrameBatchingService` (`services/request-animation-frame-batching.service.ts:8-20`) —
  простая очередь колбэков на один rAF. **В drag-пути не используется.** Его потребители:
  `NodeHandlesControllerDirective.scheduleSync` (`directives/node-handles-controller.directive.ts:104`),
  `OverlaysService.addToolbar/removeToolbar` (`services/overlays.service.ts:24,30`),
  `ResizableComponent.ngAfterViewInit` (`public-components/resizable/resizable.component.ts:127`).
- Запись `transform` ноды идёт эффектом напрямую в DOM, минуя Angular-шаблон:
  `components/node/node.component.ts:114-117` (`style.transform = model().pointTransformCss()`), а вьюпорт —
  `components/vflow/vflow.component.ts:188-195`.

### Gaps

- Нет публичного способа узнать **полный набор перетаскиваемых нод** и **исходные позиции** жеста.
- Нет события «drag cancel» (Esc/blur): в `.on('end')` (`:261`) отмена не отличается от завершения.

---

## 3. Размер и родительские ноды

### Takeaway

Есть две независимые записи размера: измерение DOM (`auto`) и жест ресайза (`explicit`), и **нет пути
«запрос на изменение размера»** — всё пишется прямо в сигналы. Плагин parent auto-grow должен сам писать
`parent.width/height` (и, вероятно, `parent.point` + `point` всех детей), а это конфликтует с
`sizeMode` и с `ResizeObserver`-циклом. Рекурсивный риск реален и в коде уже нейтрализован ad hoc флагами
(`resizing`, `resizedExplicitly`).

### Подтверждённые факты

- **`sizeMode` вычисляемый, не устанавливаемый:**
  ```ts
  // models/node.model.ts:125-129
  public sizeMode = computed<NodeSizeMode>(() =>
    (this.rawNode.width !== undefined && this.rawNode.height !== undefined) || this.resizedExplicitly()
      ? 'explicit' : 'auto');
  ```
  `resizedExplicitly` (`:119`) — «set by the resizer on its first accepted change; never reset».
- **Измерение (`auto`-путь).** `directives/node-resize-controller.directive.ts:27-38`:
  ```ts
  private measure(): void {
    const model = this.nodeAccessor.model();
    const target = this.hostElementRef.nativeElement;
    if (!model || model.culled() || model.resizing() || !target.getClientRects().length) return;
    model.width.set(target.offsetWidth);
    model.height.set(target.offsetHeight);
    model.isMeasured.set(true);
  }
  ```
  Вызывается из `afterRenderEffect` (`:19-25`, зависит от `model.resizing()` и `model.culled()`) и из
  `ResizeObserver` (`:40-43`). Директива висит на `.wrapper` (`components/node/node.component.html:2-7`).
- **Жест ресайза (`explicit`-путь).** `public-components/resizable/node-resize-control.component.ts:95-123`:
  ```ts
  onChange: (change, childChanges) => {
    const model = this.model;
    if (!model.resizing()) model.resizing.set(true);
    if (!model.resizedExplicitly()) model.resizedExplicitly.set(true);
    if (change.x !== undefined && change.y !== undefined) model.setPoint({ x: change.x, y: change.y });
    if (change.width !== undefined) model.width.set(change.width);
    if (change.height !== undefined) model.height.set(change.height);
    for (const childChange of childChanges) childChange.model.setPoint(childChange.position);
  };
  ```
  **Это единственный существующий прецедент «изменил размер родителя — подвинул детей»** — ровно та механика,
  которая нужна parent auto-grow, но она закрыта внутри `createResizer`
  (`public-components/resizable/resizer.ts:145`, `ResizerChildChange` — `:36-39`).
- **Куда попадает явный размер в DOM:** на элемент `[resizable]`, если он есть
  (`public-components/resizable/resizable.component.ts:46-51`, `box-sizing: border-box`), иначе на `.wrapper`
  (`components/node/node.component.ts:94-99` + `node.component.html:6-7`). Решение зафиксировано в
  memory-заметке `resizer-size-model-investigation.md` и в `.scratch/resizer-size-model-2026-09-13/spec.md`.
- **Уведомление о размере наружу** — только post-factum: `services/node-changes.service.ts:32-44` формирует
  `{type:'size', id, size, mode}`; `types/node-change.type.ts:17-23` прямо пишет: «Persist the size only when
  `explicit`; an `auto` size is a measurement of content».
- **«Запроса на размер» нет.** Ближайшее — veto-функция ресайза `shouldResize`
  (`public-components/resizable/resizable.component.ts:76`, тип в `resizer-types.ts`), которая работает только
  внутри жеста ресайза.
- **ResizeObserver + сигналы.** `services/resize-observer.service.ts:11-21` — один `ResizeObserver` на флоу,
  колбэки выполняются внутри `zone.run(...)`. Анти-рекурсивные предохранители в коде:
  `measure()` выходит при `model.resizing()` (комментарий `node-resize-controller.directive.ts:30-32`:
  «During a gesture the resizer owns the size: writing a clamped DOM size would make the next move oscillate»)
  и при `!target.getClientRects().length` («display:none notifications must not overwrite cached geometry with zeros»).
- **Геометрия для детей.** `parent` — `computed` по `nodeByIdMap` (`models/node.model.ts:194-201`),
  `children` — по `nodesByParentIdMap` (`:203`, источник `services/flow-entities.service.ts:26-42`).
  Никакого «родитель знает свой bbox детей» в core нет.
- **Parent clamp при drag** читает `parent.width()/height()` (`services/draggable.service.ts:321-325`) —
  значит auto-grow родителя немедленно расширяет допустимую зону детей в том же кадре.
- **Готового рецепта в open-source нет**: `apps/docs/src/app/categories/cookbook/group-auto-scaling/index.md`
  — платный пример Vflow Studio, исходник в репозитории отсутствует
  (в `demo/` только `group-auto-scaling-paid-demo.component.ts`).

### Выводы

- Плагину parent auto-grow нужно писать `parent.width/height` — но **как только он это сделает через
  `resizedExplicitly`, он навсегда переведёт родителя в `explicit`**; если он просто пишет `width.set()` при
  `sizeMode() === 'auto'`, следующий `ResizeObserver`-тик затрёт значение измеренным `offsetWidth`
  (`node-resize-controller.directive.ts:35-36`). Т.е. **без нового API плагин обязан либо требовать от
  приложения задать `width`/`height` в данных ноды, либо тянуть `resizedExplicitly`.**
- Если auto-grow растит родителя «влево/вверх», он обязан скомпенсировать `point` всех детей — та же
  `childChanges`-механика, что у ресайзера (`node-resize-control.component.ts:120-122`), но её нет наружу.
- Рекурсивный риск: `parent.width.set()` → перерисовка → `ResizeObserver` на `.wrapper` родителя →
  `measure()` → `width.set(offsetWidth)` → снова. Гасится только тем, что при `explicit` DOM-размер равен
  записанному (см. комментарий про `box-sizing: border-box`,
  `public-components/resizable/resizable.component.ts:49-50`).

### Gaps

- Нет ни события, ни хука «дети изменили bbox». Плагину придётся строить свой `effect` поверх
  `children()` + `point/width/height` каждого ребёнка.

---

## 4. Рендер рёбер и вычисление пути

### Takeaway

Путь ребра — синхронный `computed` на модели ребра; кривая подключается **пер-ребро** через
`Edge.curve: CurveFactory`, глобального переопределения нет. Асинхронный роутинг (libavoid) в текущую модель
не ложится: `CurveFactory` обязана вернуть `CurveLayout` синхронно. Препятствия (bbox всех нод) фабрике
**уже передаются** — `allNodes`, но как «сырые» `Node[]`, без размеров в удобном виде.

### Подтверждённые факты

- **Где считается путь:**
  ```ts
  // models/edge.model.ts:110-134
  public path = computed<CurveLayout>(() => {
    const source = this.sourceHandle(); const target = this.targetHandle();
    if (!source || !target) return { path: '' };
    const params = this.getPathFactoryParams(source, target);
    const curve = this.curve();
    switch (curve) {
      case 'straight': return getStraightPath(params);
      case 'bezier': return getBezierPath(params);
      case 'smooth-step': return getSmoothStepPath(params);
      case 'step': return getSmoothStepPath({ ...params, borderRadius: 0 });
      default: return curve(params);   // <- CurveFactory
    }
  });
  ```
- **Что получает фабрика** (`models/edge.model.ts:213-234`): `mode:'edge'`, сам `edge`,
  `sourcePoint`/`targetPoint` (уже сдвинутые на `markerInset`, `:224-225`), `markerInset`,
  `sourceNode`/`targetNode` как `NodeGeometry` (`{id,x,y,width,height}` из `NodeModel.geometry()`,
  `models/node.model.ts:154-158` — **абсолютные flow-координаты**), `sourcePosition`/`targetPosition`,
  `allEdges: Edge[]`, `allNodes: Node[]` (`:231-232`, из `FlowEntitiesService.rawEdges/rawNodes`,
  `services/flow-entities.service.ts:44,51`).
  Типы: `interfaces/curve-factory.interface.ts:9-11` (`NodeGeometry`), `:13-31` (shared params), `:65-74`
  (`EdgeCurveFactoryParams`), `:56-63` (`ConnectionCurveFactoryParams`).
- **Что возвращает фабрика:** `CurveLayout` (`interfaces/curve-factory.interface.ts:79-88`) —
  `path: string`, опционально `bounds: Rect` («Conservative flow-space bounds for virtualization»)
  и `labelPoints: {start,center,end}`.
- **Точки на ноде для `auto`/`center` handle:** `models/handle.model.ts:185-191` (`endpoint(towards)`) →
  `math/node-endpoint.ts:14-33`. Для «floating»-рёбер есть публичная `getFloatingEdgeParams`
  (`math/floating-edge-params.ts:23-39`, экспорт `public-api.ts:10`).
- **Лейблы зависят от пути.** `EdgeLabelTemplateDirective` в dev-режиме предупреждает, если кривая не вернула
  `labelPoints`: «uses a curve without labelPoints, so its labels do not render»
  (`directives/template.directive.ts:86-101`). Позиции лейблов — только `start|center|end`
  (`models/edge.model.ts:25,63-69`); числовой `0..1` сознательно отложен
  (`docs/adr/0007-composable-entity-presentation.md`, раздел «Considered and rejected»).
- **Маркеры** влияют на путь через inset: `models/edge.model.ts:214-225` (`markerInset` + `insetPoint`,
  `utils/marker-inset.ts:23`), а сами `<marker>` собираются глобально в
  `services/flow-entities.service.ts:61-84` (хеш по JSON) и рендерятся в `<defs>`
  (`components/vflow/vflow.component.html:21-23`).
- **Bounds для виртуализации:** `models/edge.model.ts:136-139` — `layout.bounds ?? getSvgPathBounds(document, path)`
  (измерение через SVG, `utils/svg-path-bounds.ts`); используется в
  `services/edge-rendering.service.ts:15-25`.
- **Хит-зона ребра** — отдельная директива `edgeInteraction` (`directives/edge-interaction.directive.ts:11-25`),
  без неё у ребра нет области клика (см. также ADR-0007).
- **Preview-соединение считает путь отдельно** (дублирующий switch):
  `components/connection/connection.component.ts:45-84` и `:108-131` — та же `CurveFactoryParams`, но
  `mode: 'connection'` и `targetNode` только при валидном кандидате.

### Выводы

- Для libavoid-подобного плагина нужны две вещи, которых нет: (1) **глобальная/пер-флоу подстановка кривой**
  (сегодня плагину пришлось бы писать `curve` в каждый `Edge`-сигнал приложения — это мутация
  application-owned state), и (2) **асинхронный путь**: `computed` не умеет ждать. Технически возможен обходной
  путь — фабрика, которая читает результат из собственного `signal` (кеша роутинга) и синхронно возвращает
  последний известный путь, пересчитывая асинхронно; `computed` подхватит новое значение реактивно.
  Это работает, но не документировано и не поддержано API.
- Препятствия доступны: `allNodes` + `getNodesBounds` (`utils/graph.ts:65-90`) или напрямую
  `NodeModel.geometry()` через `ɵFlowEntitiesService`. Но `allNodes: Node[]` — это **raw**-ноды, чьи
  `width`/`height` опциональны (`interfaces/node.interface.ts:30-31`) и у `auto`-нод в данных **отсутствуют**;
  измеренный размер живёт только в `NodeModel`. Это реальная дыра для роутинга по препятствиям из публичного API.

### Gaps

- Асинхронные пути не поддержаны и нигде не обсуждаются в найденных спеках.
- `waypoints` (CONTEXT.md, термин «Waypoint») — только термин; API отложен
  (`.scratch/core-platform-parity/spec.md:40` — «The deferred waypoint API design»).

---

## 5. Жизненный цикл соединения

### Takeaway

Соединение — конечный автомат в `FlowStatusService`, управляемый `ConnectionControllerDirective`.
Валидация — одна функция `ConnectionModel.validator`, склеенная из встроенных правил и пользовательского
`validator`. Финальный `connect` — **структурная операция-описание** (`Connection`), которую применяет
приложение. Эфемерный слой для preview есть (`.vflow-connection-svg`), но он рендерит ровно одну линию из
`connectionStatus` — переиспользовать его для «hint edge» без правок нельзя.

### Подтверждённые факты

- **Старт.** `directives/handle.directive.ts:143-152` (`mousedown`/`touchstart`) →
  `connectionController.startConnection(model, event)` →
  `directives/connection-controller.directive.ts:131-139`: veto по `handle.canStart()`, затем порог
  `connectionDragThreshold` (`:93-118`) и `statusService.setConnectionStartStatus(handle.parentNode, handle)`.
- **Кандидат и валидация.** Наведение на handle (`handle.directive.ts:159-165`) или на «магнит»
  (`components/node/node.component.html:29-43`, радиус `NodeModel.magnetRadius = 20`,
  `models/node.model.ts:168` — «disabled for configuration for now») →
  `ConnectionControllerDirective.validateConnection` (`:147-206`):
  ```ts
  if (handle.canAccept()) {
    const adjusted = adjustDirection({ source, sourceHandle, target: handle.parentNode, targetHandle: handle });
    valid = this.flowEntitiesService.connection().validator({
      source: adjusted.source.rawNode.id,
      target: adjusted.target.rawNode.id,
      sourceHandle: adjusted.sourceHandle.id(),
      targetHandle: adjusted.targetHandle.id(),
      sourceHandleType: adjusted.sourceHandle.type(),
      targetHandleType: adjusted.targetHandle.type(),
    });
  }
  handle.state.set(valid ? 'valid' : 'invalid');
  ```
- **Композиция валидаторов** (единственный существующий «policy chain» в библиотеке):
  ```ts
  // models/connection.model.ts:13-23
  const validators: ConnectionValidatorFn[] = [notSameTypedHandlesValidator];
  if (!this.allowSelfConnections) validators.push(notSelfValidator);
  if (settings.validator) validators.push(settings.validator);
  this.validator = (connection) => validators.every((v) => v(connection));
  ```
  Модель создаётся из входа `[connection]` (`components/vflow/vflow.component.ts:368-373`) и хранится в
  `FlowEntitiesService.connection` (`services/flow-entities.service.ts:59`) — **`WritableSignal`, доступный
  через `ɵFlowEntitiesService`**, т.е. плагин теоретически может подменить весь `ConnectionModel`.
- **Финал.** `endConnection` (`connection-controller.directive.ts:234-263`) → `connection-release` →
  подписка в конструкторе (`:50-57`) считает `valid` и **эмитит `connect` с `Connection`**:
  ```ts
  case 'connection-release': {
    const connection = statusToConnection(status);
    const valid = this.flowEntitiesService.connection().validator(connection);
    this.statusService.setConnectionReleaseValidatedStatus(source, target, sourceHandle, targetHandle, valid);
    if (valid) this.connect.emit(connection);
    break;
  }
  ```
  Документация выхода: «Emits an application-owned structural connection request after validation»
  (`:124-125`). Форма структурной операции — `Connection` (`interfaces/connection.interface.ts`),
  применяется хелпером `addEdges` (`utils/graph-operations.ts:184-206`), а reconnect — `reconnectEdges` (`:226`).
- **Слой preview.** `components/vflow/vflow.component.html:39-41`:
  ```html
  <svg class="vflow-connection-svg">
    <svg:g connection [model]="connection" [template]="connectionTemplateDirective()?.templateRef" />
  </svg>
  ```
  Компонент рисует путь из `flowStatusService.connectionStatus()` (`components/connection/connection.component.ts:45-84`)
  и умеет рендерить пользовательский шаблон `ng-template[connection]`. **Один экземпляр, привязан к статусу.**
- **`adjustDirection`** (`utils/adjust-direction.ts`, вызовы `:161,269`) — нормализация ролей handle.
- **`easy-connect` уже решает «нода как handle»** (`.scratch/easy-connect-2026-09-19/spec.md`): handle не глушит
  события, элемент handle — зона сброса, `HandleState` получил `connecting`, `EdgeModel` в loose-режиме берёт
  любой handle. Это прямой фундамент для proximity-connect.

### Что нужно proximity-connect плагину

- **Наблюдение drag'а с позициями** — есть частично (см. §2b).
- **Поиск ближайшего handle** — публичного API нет. Нужны `NodeModel.handles()` (`models/node.model.ts:160`) и
  `HandleModel.pointAbsolute()` (`models/handle.model.ts:108-111`) — оба доступны только через `ɵ`.
  Публичные `getIntersectingNodes` / `getNodesAtPoint` (`components/vflow/vflow.component.ts:610-633`)
  работают с нодами, не с handle.
- **Эфемерное ребро-подсказка** — нет слота. Варианты: (а) добавить временное ребро в состояние приложения
  (нарушает «structural change = application decides», но формально приложение и применяет),
  (б) новый слой/слот в core.
- **Применение на drop** — `nodeDragEnd` + `addEdges`, всё публично.

### Gaps

- «Magnet radius» захардкожен в 20 (`models/node.model.ts:168`) — прямая надпись «disabled for configuration for now».
- Нет события «connection moved» с текущей точкой указателя наружу (есть только внутри
  `SpacePointContextDirective.svgCurrentSpacePoint`, `directives/space-point-context.directive.ts:20-35`,
  экспортирован как `ɵSpacePointContextDirective`).

---

## 6. Поворот ноды (rotation)

### Takeaway

Поворота нет нигде: трансформ ноды — только `translate`, измерение handle делит client-rect на зум и
предполагает отсутствие вращения, вся геометрия (edges, selection box, minimap, resize, virtualization)
построена на axis-aligned прямоугольниках. Добавление rotation ломает минимум пять подсистем.

### Подтверждённые факты

- **Трансформ ноды — только перенос.** `models/node.model.ts:146` (`pointTransform` → `translate(x, y)`),
  `:151` (`pointTransformCss` → `translate(Xpx, Ypx)`), запись —
  `components/node/node.component.ts:114-117`. Вьюпорт — `translate(...) scale(zoom)`
  (`components/vflow/vflow.component.ts:192`).
- **Измерение handle предполагает только translate+scale:**
  ```ts
  // models/handle.model.ts:152-158
  const { nodeRect, zoom } = context;
  const toLocal = (rect: DOMRect): Box => ({
    left: (rect.left - nodeRect.left) / zoom,
    top: (rect.top - nodeRect.top) / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom,
  });
  ```
  `nodeRect` — `getBoundingClientRect()` ноды (`:53-58`), `zoom` читается из матрицы вьюпорта
  (`:55`: `new DOMMatrixReadOnly(viewport.style.transform).a`). При повороте `getBoundingClientRect()` вернёт
  **обрамляющий прямоугольник повёрнутого элемента**, и `toLocal` даст неверные локальные координаты.
- **Локальная точка handle → абсолютная — простое сложение без матрицы:**
  `models/handle.model.ts:108-111` (`pointAbsolute = node.globalPoint + local`).
  Для повёрнутой ноды потребовался бы поворот вектора вокруг центра/origin.
- **`auto`/`center` endpoint работает по axis-aligned прямоугольнику:** `math/node-endpoint.ts:14-33`
  (выбор стороны по знакам `dx`/`dy`), так же `math/floating-edge-params.ts:46-67`.
- **Позиционирование handle в `auto`-layout — в CSS `top/left/right/bottom` + `translate(±50%, ±50%)`**
  (`models/handle.model.ts:273-322`, `directives/handle.directive.ts:96-108`), т.е. в системе координат
  **невращённой** ноды. При повороте самого элемента-ноды CSS отработает корректно (дети наследуют трансформ),
  но **измеренные значения** (п. выше) — нет.
- **Selection box** использует `nodeToRect` (`directives/selection-box-context.directive.ts:16`, применение
  `:87-93` и далее) — axis-aligned.
- **Виртуализация** — `isRectInViewport` по `globalPoint + width/height`
  (`services/node-rendering.service.ts:30-43`, `services/edge-rendering.service.ts:15-25`).
- **Minimap** рисует ноды на canvas (`public-components/minimap/minimap-canvas.directive.ts`) — по тем же rect'ам.
- **Ресайзер** переводит указатель во flow-space и считает дельты по осям
  (`public-components/resizable/resizer.ts:93-114`, `resizer-utils.ts`) — без учёта локальной системы координат.
- **`rotation` упомянут только в ADR-0002** как пример интерактивного свойства, которое core _может_ писать
  в сигнал приложения (`docs/adr/0002-application-owned-graph-state.md`), но такого поля в
  `Node` (`interfaces/node.interface.ts:24-41`) нет.
- В `.scratch/core-platform-parity/spec.md:38` rotation отнесён к «valuable-parity» non-goals текущей программы.

### Выводы

Rotation — не «плагин на существующих швах», а изменение геометрической модели: нужен либо
трансформ-стек на `NodeModel` (матрица вместо `globalPoint`), либо явный контракт «handle сообщает свою точку сам»
(`layout: 'manual'` уже близок: `models/handle.model.ts:162-164` возвращает `sidePoint` без anchor-логики).

---

## 7. Layout-движки (dagre / ELK)

### Takeaway

Перехватить запись позиции нельзя — точки перехвата нет (см. §2). Layout-плагин обязан писать
`node.point` приложения сам; библиотека даёт для этого только «сырое» `WritableSignal` и `fitView()`.
Ровно так и написан существующий официальный рецепт с vizdom.

### Подтверждённые факты

- **Официальный рецепт — приложение пересобирает массив нод и зовёт `fitView`:**
  `apps/docs/src/app/categories/cookbook/vizdom-layout/demo/vizdom-layout-demo.component.ts:16-18` —
  `nodes: WritableSignal<Node[]>`, `:82-120` — `private layout(nodesToLayout, edgesToLayout)` строит граф
  vizdom и раскладывает; `:72-77` — `this.vflow().fitView({ duration: 750 })`.
  Ноды помечены `draggable: false` (`:36,51`), т.к. layout владеет позициями.
  Страница: `apps/docs/src/app/categories/cookbook/vizdom-layout/index.md`.
  Есть также `cookbook/force` (d3-force) и `cookbook/node-position-animation`.
  **Dagre/ELK-рецептов в репозитории нет.**
- **Хелпера «записать позиции» нет.** В `utils/graph-operations.ts` есть `addNodes`, `removeNodes`,
  `reparentNodes`, `addEdges`, `removeEdges`, `reconnectEdges` (`:25,64,136,184,209,226`) — структурные операции,
  но ни одной «setNodePositions». `reparentNodes` — единственная, что пишет `point` (`:174`), и то ради
  сохранения визуальной позиции.
- **`fitView`.** `components/vflow/vflow.component.ts:579-581` → `services/viewport.service.ts:47-67`:
  требует `computedFlowWidth/Height > 0` и непустой список нод, считает bounds через `getNodesFlowBounds`
  и ставит `writableViewport` с `changeType:'absolute'`.
- **Взаимодействие с виртуализацией.** `NodeModel.shouldLoad` (`models/node.model.ts:173-192`): при
  `optimization.virtualization` **все ноды грузятся сразу** — «Culling needs initial node and handle geometry,
  including offscreen nodes». При `lazyLoadTrigger: 'viewport'` и шаблонной/ленивой презентации нода ждёт
  попадания в вьюпорт (`:186-189`). `culled()` (`:59-75`) прячет ноду через CSS, **сохраняя последнюю измеренную
  геометрию**, и отключается при `dragging`/`resizing`/`focused`/`connectionActive`. Значит:
  - `auto`-ноды, никогда не попавшие в вьюпорт при `lazyLoadTrigger: 'viewport'` **без** виртуализации,
    не измерены → `width/height` = дефолты `100×50` (`models/node.model.ts:99,102`, `NODE_DEFAULTS`
    `interfaces/node.interface.ts:9-10`). Layout по таким размерам будет неверным.
  - `fitView` сразу после записи позиций корректен: он читает `globalPoint`/`width`/`height` модели,
    а не DOM.
- **Порядок инициализации.** `FlowRenderingService` (`services/flow-rendering.service.ts:6-12`) ставит
  `flowInitialized = true` через 2 rAF вне зоны; наружу — `initialized` / `initialized$`
  (`components/vflow/vflow.component.ts:512,531`). Это единственный «lifecycle-хук» флоу.

### Выводы

- Sync-layout (dagre) встраивается сегодня «как есть»: подписка на `nodesChanges.add/remove`
  (`directives/changes-controller.directive.ts:43-49`) или на `edgesChanges`, пересчёт, запись в `point`.
  Риск — петля: запись `point` порождает `NodePositionChange` (§2.7) с задержкой 25 мс
  (`services/node-changes.service.ts:84`), и плагин должен сам гасить рекурсию.
- Async-layout (ELK) дополнительно требует идентификации «устаревшего» результата — библиотека не даёт версий
  графа. Ближайший маркер — ссылочная идентичность моделей (`ReferenceIdentityChecker`,
  `components/vflow/vflow.component.ts:424,447`).

---

## 8. Слои рендеринга и слоты

### Takeaway

Слоёв девять, все зашиты в шаблон `<vflow>`; расширяемых слотов два с половиной — `node-toolbar`
(через `OverlaysService`), `mini-map` (через `FlowEntitiesService.minimap`) и `ng-template[connection]`.
Portal/slot-механизма для «своего слоя» нет.

### Слои (`components/vflow/vflow.component.html`)

| Слой                    | Строка     | DOM                                                                                                                | Кто наполняет                                   |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| root + a11y live region | `:1-10`    | `div.vflow-root` (`vflowKeyboard rootSvgRef rootSvgContext rootPointer flowSizeController`), `div.vflow-a11y-live` | core                                            |
| background              | `:12-14`   | `svg.vflow-background-svg > g[background]`                                                                         | `BackgroundComponent`                           |
| pane (цель d3-zoom)     | `:17`      | `div.vflow-pane` (`mapContext spacePointContext autoPan selectionBoxContext`)                                      | core                                            |
| viewport (transform)    | `:19`      | `div.vflow-viewport`                                                                                               | эффект `vflow.component.ts:188-195`             |
| defs (маркеры)          | `:21-23`   | `svg.vflow-defs-svg > defs`                                                                                        | `FlowEntitiesService.markers`                   |
| overlays                | `:26-36`   | `svg.vflow-overlay-svg` → `g[alignmentHelper]`, `g[selectionBox]`                                                  | core                                            |
| connection preview      | `:39-41`   | `svg.vflow-connection-svg > g[connection]`                                                                         | `FlowStatusService` + `ng-template[connection]` |
| nodes                   | `:44-54`   | `div.vflow-nodes-layer` → `div[node]`                                                                              | `orderedNodes()` = `FlowEntitiesService.nodes`  |
| edges                   | `:57-67`   | `div.vflow-edges-layer` → `svg[edge]` (по SVG-корню на ребро)                                                      | `validEdges()`                                  |
| edge labels             | `:70-81`   | `div.vflow-edge-labels-layer` → `div[edgeLabelHost]`                                                               | `model.labelEntries()`                          |
| node toolbars           | `:84-96`   | `div.vflow-toolbars-layer`                                                                                         | `OverlaysService.nodeToolbarsMap`               |
| minimap                 | `:101-107` | `div.vflow-minimap`                                                                                                | `FlowEntitiesService.minimap`                   |

- **z-index — единственный способ смешивать ноды и рёбра**: ADR-0001
  (`docs/adr/0001-native-html-node-rendering.md`) — каждое ребро остаётся отдельным SVG-корнем
  «so edges and nodes can interleave through CSS z-index». Запись:
  `components/node/node.component.ts:104-113` и `components/edge/edge.component.ts:69-71`.
  Опция `detachedGroupsLayer` (`interfaces/optimization.interface.ts:14`) уводит группы за слой рёбер
  (применение — `node.component.ts:106-111`).
- **Контракт слоёв формально нестабилен:** `apps/docs/src/app/categories/introduction/pages/architecture/index.md`
  — «The exact private DOM structure and nesting of these layers are implementation details and can change
  between releases». Для плагина это значит: селекторы по `.vflow-*` — неподдерживаемый способ.
- **Единственный обобщаемый слот-механизм — `OverlaysService`:**
  ```ts
  // services/overlays.service.ts:10-33
  private readonly toolbars = signal<ToolbarModel[]>([]);
  public nodeToolbarsMap = computed(() => { /* group by toolbar.node */ });
  public addToolbar(t) { this.afService.batchAnimationFrame(() => this.toolbars.update(ts => [...ts, t])); }
  ```
  Он привязан к ноде (`ToolbarModel.node`) и к одному слою `vflow-toolbars-layer`; универсального
  «зарегистрируй шаблон в слой X» нет.
- Позиционирование toolbar'а делает директива-обёртка, пишущая `transform` в **родительский** элемент
  (`public-components/node-toolbar/node-toolbar.component.ts:80-88`) — хрупкая, но рабочая схема для
  «свободного» оверлея.

### Gaps

- Ни `ng-content`, ни CDK-portal в `<vflow>` нет: приложение не может вставить произвольный DOM в вьюпорт
  (только через презентацию ноды/ребра или через toolbar).

---

## 9. Сквозные вопросы

### Capability policy

- Резолюция — двухуровневая и вычисляемая на модели: entity-override `?? ` глобальный дефолт
  (`models/node.model.ts:110-111`, `models/edge.model.ts:81-82`), дефолты —
  `services/flow-settings.service.ts:12-15`, входы — `vflow.component.ts:310-332`.
  **Композиции политик (цепочки) нет ни в одном месте, кроме валидаторов соединения** (`connection.model.ts:13-23`).
- Handle-политики локальны и не участвуют в общей резолюции: `canStart`/`canAccept`
  (`directives/handle.directive.ts:74-75`; `models/handle.model.ts:126-127` дефолт `true`).
- Политики влияют на a11y-описание: `models/node.model.ts:35-51` вшивает
  `selectionUnavailable` / `movementUnavailable` в description. Значит, **плагин, который запрещает
  взаимодействие, обязан проходить через ту же политику, иначе a11y-описание соврёт** (ADR-0004,
  `docs/adr/0004-library-owned-accessibility-wrappers.md`).

### Клавиатура

- Конфигурация — вход `keyboardShortcuts` (`vflow.component.ts:358-361`) →
  `KeyboardService.setShortcuts` (`services/keyboard.service.ts:244-256`).
  Набор команд — **закрытый union**: `types/keyboard-shortcuts.type.ts:5-19` (15 команд) и 4 модификатора (`:2`).
  Дефолты — `services/keyboard.service.ts:46-71`.
- Диспетчеризация — `isCommand(name, event)` (`:270-277`) в директивах
  `keyboard-entity.directive.ts` / `keyboard-navigation.directive.ts`; действия —
  `KeyboardEntityCommandsService` (`services/keyboard-entity-commands.service.ts:25,39,46,64`)
  и `KeyboardViewportCommandsService`. Каждая команда возвращает `boolean` («took the press»,
  комментарий `:12-15`) — уже готовая семантика цепочки обработчиков, но **регистра команд нет**:
  добавить свою команду снаружи невозможно.
- Исключение зон: `data-vflow-no-keyboard` + `input/textarea/select/[contenteditable]`
  (`services/keyboard.service.ts:194-197`).
- Объявления для screen reader: `AnnouncerService` (`services/announcer.service.ts`),
  `ariaLabelConfig` (`vflow.component.ts:204-210`), `deleteRequest` как выход (`:475`).

### Lifecycle

- Инициализация: `FlowRenderingService` (2 rAF, `services/flow-rendering.service.ts:6-12`), наружу —
  `initialized` / `initialized$`.
- Уничтожение: у моделей есть собственный инжектор и `destroy()` (`utils/model-injector.ts`,
  `models/node.model.ts:22,261-263`, `models/edge.model.ts:28,209-211`). Директивы используют
  `DestroyRef.onDestroy` (`handle.directive.ts:112`, `drag-handle.directive.ts:21`,
  `connection-controller.directive.ts:41`) и `takeUntilDestroyed`.
- Глобальных хуков «flow created / flow destroyed» для внешнего кода нет.

### Тест-инфраструктура

- `libs/ngx-vflow/testing/src/provide-custom-node-mocks.ts:22-84` — эталон того, как сервисы подставляются
  в spec'ах: часть мокается объектами (`ComponentEventBusService`, `HandleService`, `RootPointerDirective`,
  `SpacePointContextDirective`, `SelectionService`), часть предоставляется настоящими классами
  (`FlowEntitiesService`, `FlowSettingsService`, `FlowStatusService`, `ViewportService`, `NodeRenderingService`).
  Импорт идёт через `ɵ`-алиасы (`:3-17`).
- Остальные моки — `vflow-mocks.ts`, компонент- и директив-моки (`testing/src/component-mocks/*`,
  `directive-mocks/*`), реэкспорт в `testing/src/public-api.ts`.
- Плагин, живущий на component-level DI, тестируется тем же способом: `TestBed` + провайдеры-моки;
  отдельной инфраструктуры не потребуется.

---

## 10. Принципы и ограничения, которые обязана уважать система плагинов

Из `CONTEXT.md` и ADR (цитаты укорочены):

1. **Application-owned state.** «ngx-vflow may update the application's writable signals for interactive
   properties, but it does not maintain a separate authoritative graph store» (`CONTEXT.md`, «Application-owned
   state»; ADR-0002 `docs/adr/0002-application-owned-graph-state.md`). Плагин не может завести свой стор нод.
2. **Structural graph operation ≠ change notification.** Структурные изменения (add/remove/reparent) —
   **описываются**, применяет приложение (`CONTEXT.md`, «Structural graph change» / «Structural graph operation»);
   `NodeChange` — строго post-mutation отчёт (`types/node-change.type.ts:5,17,25,30,36`) и «must not be replayed
   as a structural graph operation» (`CONTEXT.md`, «Change notification»). Значит, layout- и auto-grow-плагины
   пишут _интерактивные_ свойства (position/size) напрямую, а reparent/connect — только предлагают.
3. **Нет типа «группа».** ADR-0003 (`docs/adr/0003-allow-any-node-to-be-a-parent.md`), ADR-0007:
   группа — это нода с детьми по `parentId`; признак — `children().length > 0`
   (`utils/is-group-node.ts`, использования: `models/node.model.ts:32`, `services/node-rendering.service.ts:25`,
   `services/draggable.service.ts:178`). Плагин auto-grow не должен вводить свой тип узла.
4. **Headless presentation.** ADR-0006 (`docs/adr/0006-ui-presentations-core-interaction-feedback.md`):
   core владеет геометрией, слоями, hit-зонами, a11y и минимальным визуальным фидбеком; готовые презентации
   ушли в `@vflow/ui`. UI-плагин должен приносить _presentation_, а не механику.
5. **Композиция презентации.** ADR-0007 (`docs/adr/0007-composable-entity-presentation.md`): одна модель ноды,
   `component` или один fallback-шаблон, всё внутреннее (`vflowHandle`, `*edgeLabel`, `[resizable]`) —
   декларативно внутри презентации, компоненты — без базового класса, через `injectNode()`/`injectEdge()`.
   Event bus сохранён сознательно. **Это готовый шаблон формы для плагина-«части сущности».**
6. **Независимый CSS-контракт core.** ADR-0005: core владеет своими токенами; `@vflow/ui` только маппит.
   Плагин не должен требовать импорта темы UI.
7. **A11y — за библиотекой.** ADR-0004: роли, состояния, связи и фокус — core; приложение даёт имена и
   ограниченный набор DOM-метаданных. Плагин не может переопределять роли обёрток.
8. **`ɵ` — не публичный контракт.** `.scratch/core-platform-parity/spec.md:22`.
9. **First-party extension** по определению (`CONTEXT.md`) — «optional capability maintained by the package
   authors but distributed **outside the main package contract**». `@vflow/ui` — живой пример такой
   дистрибуции (отдельный `package.json`, peer-dep на `ngx-vflow`, zero-`ɵ`).
10. **Official recipe** — «documented composition of package primitives that **application code must implement
    and own**». Сегодня layout (vizdom, force), easy-connect, delete-selected, expand-collapse, drag-and-drop,
    group-auto-scaling (платно) — именно рецепты, а не фичи. Система плагинов должна ясно указать, что из
    пяти сценариев переходит из «рецепта» в «first-party extension».

---

## Candidate hook points

Формат: **имя | file:line | текущая форма | что нужно плагину**.

### Drag и позиция

1. **`DraggableService.moveNode`** | `libs/ngx-vflow/src/lib/vflow/services/draggable.service.ts:316` |
   приватный метод: parent-clamp + `model.setPoint(point)`; общая точка для drag, auto-pan (`:373`) и
   клавиатурного `moveSelected` (`:65`) | **transform + veto**: цепочка `(node, candidate, context) => Point | null`
   (snap-to-grid, snap-to-object, constrain-to-bounds, magnetic layout).
2. **`DraggableService.alignToGrid`** | `:334` | читает только `settings.snapGrid()` | **strategy override**:
   заменяемая «snap policy» вместо жёсткого grid.
3. **`DraggableService.getDragBehavior().filter`** | `:176-205` | 5 захардкоженных правил + атрибут
   `data-vflow-no-drag` | **veto**: предикат «можно ли начать drag этой ноды этим событием».
4. **`activate()` / список `dragNodes`** | `:207-226` (`dragNodes`, `initialPositions`) | живёт в замыкании | **observe**:
   публичный «drag session» объект `{ initiator, nodes, initialPositions, pointerFlow }`.
5. **`FlowStatusService` node-drag статусы** | `libs/ngx-vflow/src/lib/vflow/services/flow-status.service.ts:80-99,274-284` |
   `payload: { node: NodeModel }` — только инициатор | **observe** (расширить payload до всей сессии).
6. **`NodeDragControllerDirective` выходы** | `libs/ngx-vflow/src/lib/vflow/directives/node-drag-controller.directive.ts:24,31,38` |
   `nodeDragStart/nodeDrag/nodeDragEnd`, payload `{ node: Node }` | **observe** (публичный, стабильный, но бедный).
7. **`NodesChangeService.changes$` / `ChangesControllerDirective`** |
   `services/node-changes.service.ts:75` (+`observeOn(async, 25)` на `:84`), `directives/changes-controller.directive.ts:33-53` |
   post-factum уведомления | **observe** — годится для sync-layout, но 25 мс задержки и риск петли.
8. **`AlignmentHelperComponent` (образец, не хук)** | `components/alignment-helper/alignment-helper.component.ts:61,150-173` |
   `extendedComputed` кандидатов + `setPoint` на `node-drag-end` | эталон «snap-on-drop plugin» внутри core.

### Размер и родитель

9. **`NodeResizeControllerDirective.measure`** | `directives/node-resize-controller.directive.ts:27-38` |
   пишет `offsetWidth/offsetHeight` в модель, гардится `resizing()`, `culled()`, `getClientRects()` |
   **transform/veto**: «size request» — возможность отклонить/скорректировать измеренный размер (auto-grow,
   min-size по детям).
10. **`NodeModel.sizeMode` / `resizedExplicitly`** | `models/node.model.ts:119,125` | `computed`, набор источников
    зашит | **state**: явный способ для плагина объявить «этот размер задан мной», не притворяясь ресайзером.
11. **`createResizer.onChange` + `ResizerChildChange`** |
    `public-components/resizable/node-resize-control.component.ts:95-123`, `public-components/resizable/resizer.ts:36-39,145` |
    единственная существующая механика «размер родителя ↔ позиции детей», закрыта внутри ресайзера |
    **API**: публичный `resizeNodeWithChildren(node, rect)`.
12. **`ResizableComponent.shouldResize`** | `public-components/resizable/resizable.component.ts:76` |
    veto-функция на один узел | **veto** (уже существует, но только для жеста).
13. **`ResizeObserverService`** | `services/resize-observer.service.ts:23,33` | общий RO, `zone.run` в колбэке |
    **state/инфраструктура**: плагину нужен доступ, чтобы не заводить второй RO (риск лишних layout-проходов).

### Рёбра

14. **`EdgeModel.path` (switch по `curve`)** | `models/edge.model.ts:110-134` | `computed`, `default: curve(params)` |
    **strategy override (глобальный)**: сейчас кривая задаётся только пер-ребро через данные приложения.
15. **`EdgeModel.getPathFactoryParams`** | `models/edge.model.ts:213-234` | формирует `CurveFactoryParams`,
    включая `allNodes: Node[]` / `allEdges: Edge[]` | **transform**: препятствия для роутинга есть, но raw-ноды
    не несут измеренные размеры → нужен `NodeGeometry[]` вместо/в дополнение к `allNodes`.
16. **`CurveFactory` / `CurveLayout`** | `interfaces/curve-factory.interface.ts:79-92` | синхронный контракт |
    **API**: асинхронный/инкрементальный путь (libavoid, ELK edge routing) не выражается.
17. **`EdgeModel.bounds`** | `models/edge.model.ts:136-139` | `layout.bounds ?? getSvgPathBounds(...)` |
    **observe**: bbox рёбер для виртуализации и для роутинга.
18. **`ConnectionComponent.path`** | `components/connection/connection.component.ts:45-84` | дублирует switch
    кривых для preview | **strategy override** (должен разделять реализацию с `EdgeModel.path`).
19. **`ng-template[connection]`** | `directives/template.directive.ts:19-29`, использование
    `components/vflow/vflow.component.html:40` | пользовательский шаблон линии соединения | **UI slot** (есть).
20. **`EdgeLabelTemplateDirective` + `labelPoints`** | `directives/template.directive.ts:46-101`,
    `models/edge.model.ts:63-69` | лейблы зависят от `CurveLayout.labelPoints`; их отсутствие = лейблы не рисуются |
    ограничение для любого кастомного роутинга.

### Соединения

21. **`ConnectionModel.validator` (цепочка)** | `models/connection.model.ts:13-23` | массив валидаторов,
    `every`; пользовательский добавляется последним | **veto** — единственная готовая композиция политик;
    кандидат на обобщение в «capability policy chain».
22. **`FlowEntitiesService.connection`** | `services/flow-entities.service.ts:59` | `WritableSignal<ConnectionModel>`,
    доступен как `ɵ` | **state**: плагин может подменить модель целиком (хрупко).
23. **`ConnectionControllerDirective.startConnection / validateConnection / endConnection`** |
    `directives/connection-controller.directive.ts:131,147,234` | публичные методы директивы |
    **API**: программный запуск соединения (нужен proximity-connect и клавиатурному соединению).
24. **`HandleModel.canStart / canAccept`** | `models/handle.model.ts:83-84,126-127`,
    входы `directives/handle.directive.ts:74-75` | per-handle булевы сигналы | **veto** (есть, но не
    интегрирован в общую policy-резолюцию с глобальными дефолтами).
25. **`HandleModel.pointAbsolute` / `NodeModel.handles`** | `models/handle.model.ts:108`,
    `models/node.model.ts:160` | доступ только через `ɵ` | **observe**: публичный «ближайший handle к точке».
26. **Магниты + `magnetRadius`** | `components/node/node.component.html:29-43`, `models/node.model.ts:168` |
    радиус 20 захардкожен | **state/настройка**.
27. **`connect` / `reconnect` выходы** | `directives/connection-controller.directive.ts:125,128` |
    структурная операция `Connection` после валидации | **observe** (публичный, стабильный).
28. **Слой `.vflow-connection-svg`** | `components/vflow/vflow.component.html:39-41` | один preview,
    жёстко связан с `connectionStatus` | **UI slot**: нужен «ephemeral edge layer» для hint-ребра proximity-connect.

### Слои и UI

29. **`OverlaysService.addToolbar/removeToolbar`** | `services/overlays.service.ts:23,29` | единственный
    реестр шаблонов оверлеев, привязан к ноде | **UI slot** — прототип обобщённого «layer registry».
30. **`FlowEntitiesService.minimap`** | `services/flow-entities.service.ts:88`,
    регистрация `public-components/minimap/minimap.component.ts:35-39` | один слот на флоу |
    **UI slot** (образец «одиночного» слота).
31. **`NodeModel.resizerTemplate`** | `models/node.model.ts:212`, регистрация
    `public-components/resizable/resizable.component.ts:114-124`, рендер `components/node/node.component.html:24-26` |
    шаблон, поднимаемый из презентации в слой ноды | **UI slot** (образец «поднять шаблон наверх»).
32. **`EdgeModel.labelTemplates`** | `models/edge.model.ts:62`, регистрация `directives/template.directive.ts:59-85` |
    то же для рёбер | **UI slot**.

### Сквозные

33. **`FlowSettingsService`** | `services/flow-settings.service.ts:10-61` | 25+ `WritableSignal`, заполняемых
    сеттерами `<vflow>` | **state**: естественное место для «настроек плагина», но типобезопасного
    пространства имён нет.
34. **`SelectionService.strategies`** | `services/selection.service.ts:30-35` | жёсткая карта из двух стратегий |
    **strategy override**: очевидный кандидат на DI-мультипровайдер.
35. **`ComponentEventBusService`** | `services/component-event-bus.service.ts:7-21` | только события
    презентаций (`nodeEvent$`/`edgeEvent$`) | **observe/emit**: кандидат стать общей шиной, но сегодня
    типы `AnyComponentNodeEvent`/`AnyComponentEdgeEvent` жёстко «node/edge-центричные».
36. **`KeyboardService.isCommand` + closed union команд** | `services/keyboard.service.ts:270`,
    `types/keyboard-shortcuts.type.ts:5-19` | 15 встроенных команд | **API**: регистрация команды плагином
    (имя, дефолтные клавиши, scope `entity|container|both` — тип уже есть: `utils/keyboard-commands.ts:5`,
    и конвенция «команда возвращает, взяла ли она нажатие»: `services/keyboard-entity-commands.service.ts:12-15`).
37. **`FlowRenderingService.flowInitialized`** | `services/flow-rendering.service.ts:4-12`, наружу
    `components/vflow/vflow.component.ts:512,531` | 2 rAF после старта | **observe** — единственный lifecycle-сигнал.
38. **`ɵ`-экспорты** | `libs/ngx-vflow/src/public-api.ts:72-88` | 12 сервисов/моделей + 2 директивы |
    фактический «plugin SDK» сегодня; требует замены публичным контрактом
    (`.scratch/core-platform-parity/spec.md:22`).
39. **`utils/graph-operations.ts`** | `:25,64,136,184,209,226` | чистые функции структурных операций |
    **API**: то, чем плагин _описывает_ изменение; нет аналога для позиций/размеров (нужен для layout).
40. **`utils/coordinates.ts` + `SpacePointContextDirective`** | `utils/coordinates.ts:14,28,38,48,58`;
    `directives/space-point-context.directive.ts:20,39,47` | client ↔ flow ↔ node space |
    **API** (есть публично на `<vflow>`: `vflow.component.ts:599-607`).

---

## Сводка пробелов (Gaps)

- Система плагинов не начата: ни кода, ни спецификации (`.scratch/plugin-architecture-2026-09-20/` пуста).
- Нет хука трансформации позиции при drag; нет хука «size request»; нет асинхронного пути ребра;
  нет реестра команд клавиатуры; нет слота произвольного слоя.
- Rotation отсутствует как концепция (кроме упоминания в ADR-0002) и потребует смены геометрической модели.
- Пять целевых сценариев в задании не перечислены явно — их состав реконструирован из ключевых вопросов и
  может отличаться от намерения заказчика.
- Не проверено: сборка вторичной точки входа `ngx-vflow/testing`; содержимое
  `.scratch/core-platform-parity/issues/01-implement-entity-capability-policies.md` (открывал только `spec.md`);
  реализация `keyboard-viewport-commands.service.ts`, `announcer.service.ts`, `map-context.directive.ts`
  (d3-zoom), `auto-pan.directive.ts`, `root-pointer.directive.ts` — прочитаны только по ссылкам из других
  файлов, не построчно.
