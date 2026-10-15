# 15. `(initialized)` и fit-on-load без boilerplate

Status: resolved
Type: task
Priority: P2 (ломающее — дешевле до 3.0)
Blocked by: —

Отчёт: 3.8, 4.4. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Вписать граф при старте — 8 копий в демо:

```ts
effect(() => {
  if (flow.initialized()) untracked(() => flow.fitView());
});
```

- **`untracked` больше не нужен.** После тикета 01 команды viewport (`setViewport`, `setCenter`, `fitView`, `zoomTo`, `zoomIn`, `zoomOut`) применяют изменение через `ViewportService.request()` внутри `untracked` (`services/viewport.service.ts:122`). Вызов из effect подписывает его только на то, что effect прочитал сам.
- **Готовность — момент, а не состояние.** Приложению нужно не читать `initialized()` снова и снова, а сделать что-то один раз, когда граф разложен. Ради этого оно пишет effect, `viewChild` и проверку.
- **Конец изменения viewport приложению недоступен.** Сохранить viewport удобно в конце жеста или анимации; сигнал `viewport` меняется каждый кадр. Внутри уже есть `viewportChangeEnd$` (`services/viewport.service.ts:38`).
- **Пролистывание колёсиком — жест на каждое событие.** `begin()`/`finish()` вызываются на каждое событие wheel (`directives/viewport-gestures.directive.ts:249-251`), поэтому конец изменения на тачпаде приходит десятки раз в секунду. У зума колёсиком конец уже наступает через `WHEEL_IDLE_MS` после последнего события (`directives/viewport-gestures.directive.ts:17,277`).

Файлы с шаблоном fit-on-load (`apps/docs/src/app/categories/`):

- `introduction/pages/overview/demo/all-features-demo.component.ts`;
- `performance/pages/lazy-loading/demo/lazy-loading-demo.component.ts` — не fit при старте: fit к текущему узлу при каждой его смене, `initialized` здесь гейт;
- `design-system/`: `relationships-map/relationships-demo`, `pipeline/pipeline-demo`, `erd-schema-mapping/entities-demo`, `erd-schema-mapping/scroll-collapse-demo`, `workflow/workflow-demo`, `bpmn/bpmn-demo`.

## Решения

### `initialized` — output вместо сигнала

```ts
public readonly initialized = output<void>();
```

```html
<vflow #flow [nodes]="nodes" (initialized)="flow.fitView()" />
```

- **Один раз, при первой раскладке, даже пустой.** Момент тот же, что у нынешнего сигнала: `FlowRenderingService.flowInitialized` (размер flow > 0 и каждый узел готов или без бокса). Пустой граф — валидный старт (редактор, куда пользователь добавляет узлы). Асинхронную загрузку и её fit приложение обрабатывает само.
- **Тайминг — главное свойство.** Обработчик выполняется в том же проходе change detection, в котором снимается `v-initializing`, и `fitView()` в нём — первый viewport, который видит пользователь (см. `initial-viewport.spec.ts`). Emit — из effect внутри `VflowComponent` по `flowInitialized`; команда viewport применяется синхронно, effect с transform перезапускается в том же цикле. Проверить spec'ом, а не рассуждением.
- **Публичный сигнал `initialized` удалить.** Внутри библиотеки его не читают: `ui`, `bpmn` и директивы берут `flowInitialized` из сервиса, он остаётся.
- **Поздний подписчик событие пропускает.** Привязке в шаблоне это не грозит. Кому нужно знать «готово ли сейчас», заводит свой флаг: `ready = signal(false)` и `(initialized)="ready.set(true)"`. Записать в JSDoc output.
- **Где нет раскладки** (jsdom, happy-dom), событие не приходит — как сейчас сигнал остаётся `false`.
- JSDoc output — переписать текущий JSDoc сигнала (`components/vflow/vflow.component.ts:576-581`) под событие.

### `fitViewOnInit` не вводить

С `(initialized)` fit при старте — одна строка в шаблоне. Второй способ сделать то же самое не нужен.

### Output `(viewportChangeEnd)`

```ts
public readonly viewportChangeEnd = output<ViewportState>();
```

- Payload — viewport в момент конца (`readableViewport()`).
- Приходит в конце каждого изменения viewport, то есть из `finish()` в `directives/viewport-gestures.directive.ts:491`:
  - жесты: перетаскивание, touch, зум колёсиком, зум двойным кликом;
  - программные команды: без `duration` — сразу, с `duration` — при достижении цели или при прерывании (viewport остановился в этом состоянии);
  - цепочка `fitView({ duration }); zoomTo(2)` даёт два события — так и оставить, описать в JSDoc.
- `(viewportChange)` и `(viewportChangeStart)` не вводятся: первое — решение тикета 07, второе — без сценария; симметрию имён с `*Start`/`*End` смотрит тикет 20.

### Пролистывание колёсиком — один жест на серию

- Серия событий wheel-pan — один жест: `begin()` на первом событии, `finish()` через `WHEEL_IDLE_MS` после последнего, как у зума колёсиком. Общий таймер колеса: серия, в которой чередуются пан и зум, заканчивается один раз.
- Побочные эффекты (ожидаемые): culling (`directives/viewport-culling.directive.ts:60`) убирает ушедшие из кадра сущности по концу серии, а не по каждому событию — появление новых не зависит от конца, оно идёт по effect от движения; `--v-zoom` пересчитывается по концу серии.
- `SelectionService.setViewport({ start, end, target })` получает start серии и end серии — проверить, что выбор/сброс по клику на pane не меняется.

### Запросы оставить с подпиской

`getNode`, `getNodeRect`, `getNodesBounds`, `getNodesAtPoint`, `getIntersectingNodes`, `clientToFlowPosition`, `flowToClientPosition`, `getDetachedEdges` читают сигналы с подпиской: `computed(() => flow.getNodesBounds())` реактивен. Правило: команда пишет и не подписывает, запрос читает и подписывает.

- Записать правило в комментарий региона `METHODS_API` (`components/vflow/vflow.component.ts`) и в JSDoc запросов, с примером ловушки: effect, который читает `getNodesBounds()` и вызывает `setCenter()`, перезапускается при каждом сдвиге узла — оберните чтение в `untracked`.

### Демо

- 7 копий fit при старте → `(initialized)="flow.fitView()"` в шаблоне (или вызов метода компонента-демо); effect, `untracked` и `viewChild`, ставшие лишними, удалить.
- `lazy-loading`: флаг `ready` из `(initialized)`; effect читает `ready()` и `currentNode()`, вызывает `fitView({ nodes, duration })` без `untracked`.
- Force-layout (`apps/docs/src/app/categories/cookbook/force/demo/force-layout-demo.component.ts:130`) не трогать: `setTimeout` — после ползунка, ждёт, пока d3 раздвинет узлы, к загрузке отношения не имеет.

### Docs

- `apps/docs/src/app/categories/introduction/pages/migration/index.md`:
  - строка 522: `initialized` теперь output, а не сигнал; `viewportChange$` удалён — для сохранения viewport `(viewportChangeEnd)`;
  - таблица «Removed APIs»: `initialized$` и сигнал `initialized()` → `(initialized)`; строка `viewportChange$` — добавить `(viewportChangeEnd)` для конца изменения;
  - строка 368: «`(initialized)` не приходит» вместо «`initialized()` stays `false`».
- `apps/docs/src/app/categories/testing/pages/unit-testing/index.md:55,58` — то же.
- `apps/docs/src/app/categories/interactions/pages/viewport-gestures/index.md` (отдельной страницы программного viewport нет; программные вызовы упомянуты в строке 107): раздел про fit при старте через `(initialized)` и сохранение viewport через `(viewportChangeEnd)`; описать, что серия wheel-pan — один жест.

## Проверки

- `initial-viewport.spec.ts`: перевести host на `(initialized)="flow.fitView()"`; инвариант MutationObserver (первый показанный кадр — viewport после fit) остаётся зелёным. Мутация: emit через `afterNextRender`/`setTimeout` вместо effect должен ронять spec, иначе spec не ловит вспышку.
- Spec: `(initialized)` приходит один раз — при первой раскладке; не приходит повторно после добавления узлов или изменения размера; приходит на пустом графе.
- `node-dom/flow.spec.ts:159`: в jsdom `(initialized)` не приходит.
- `viewport-gestures.spec.ts`:
  - `(viewportChangeEnd)` с `ViewportState` после drag, после `setViewport` без `duration`, после `fitView({ duration })` при достижении цели и при прерывании;
  - серия из N событий wheel-pan → одно событие через `WHEEL_IDLE_MS`; серия pan + zoom → одно событие.
- Spec: `effect(() => { if (ready()) flow.fitView(); })` без `untracked` не перезапускается при сдвиге узла (по образцу spec'а тикета 01 для `zoomTo`).
- `nx test ngx-vflow --skip-nx-cache`, `nx build ngx-vflow`, typecheck docs, ui, bpmn; e2e virtualization и minimap (culling) — они нестабильны в dev mode, падения сравнивать с прогоном на базе.

## Answer

Сделано 2026-10-15.

- **`(initialized)`** — `output<void>()` на `VflowComponent`. Emit из effect по `flowInitialized`: сигнал защёлкивается, поэтому emit один; `emit` сам вызывает слушателей вне контекста подписки. Публичный сигнал `initialized` удалён, `flowInitialized` в сервисе не менялся.
- **Тайминг проверен мутацией:** emit через `setTimeout` роняет `initial-viewport.spec.ts` («painted before fitView»); с effect spec зелёный.
- **`(viewportChangeEnd)`** — `outputFromObservable(viewportChangeEnd$)`; `Subject` теперь несёт `ViewportState`. `triggerViewportChangeEvent('end')` заменён на `ViewportService.endChange()`. `settledZoom` берёт zoom из payload.
- **Колесо:** `continueWheel(target)` начинает жест на первом событии серии и продлевает таймер `WHEEL_IDLE_MS`; пан и зум колесом — один жест. Пан не задаёт target жеста, поэтому серия пана не читается как клик по pane.
- **Запросы с подпиской:** правило записано в комментарий региона `METHODS_API` и на странице Viewport gestures. Отдельный JSDoc на каждый запрос не дописан: правило одно для всех и живёт в одном месте.
- **Демо:** 6 демо design-system и all-features — `(initialized)="…fitView()"`, effect и лишние импорты удалены; lazy-loading — флаг `ready`.
- **Docs:** migration guide (раздел «Initialization and viewport events», строки удалённых API, заметка о тестах), Unit testing, Viewport gestures (раздел «Fit on load and the end of a change»), ADR 0009 — формулировка про `(initialized)`.
- **Specs:** `initial-viewport.spec.ts` — host на output, «один раз, в том числе для пустого графа», effect с `fitView()` без `untracked` не перезапускается при сдвиге узла; `viewport-gestures.spec.ts` — payload и конец после wheel, `zoomTo`, drag, серия wheel-pan и смешанная серия, конец анимации при достижении и при прерывании; `node-dom/flow.spec.ts` — в jsdom `(initialized)` не приходит.

Прогон: `nx test ngx-vflow --skip-nx-cache` — 439 spec в браузере и 44 в node-dom, все зелёные; `nx build ngx-vflow`, `nx build ui`, `tsc` docs и eslint по изменённым файлам чистые. Docs dev server и e2e не запускались.
