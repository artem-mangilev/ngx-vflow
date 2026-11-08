# 05. `@vflow/layout`: контракт, хост, аниматор

Status: resolved
Type: task
Blocked by: 03

Спецификация: [spec.md](../spec.md), «Контракты → layout». Источники: `dev/vflow-studio/libs/expand-collapse/.../dagre-layout.directive.ts`, `dev/vflow-studio/libs/node-position-animation/.../animate-node-positions.ts`, `node-animator.directive.ts`.

## Что сделать

- `libs/layout/` по каркасу из 03; основной entry `@vflow/layout` без зависимостей от движков.
- Типы `LayoutNode`, `LayoutEdge`, `LayoutGraph`, `LayoutResult`, `LayoutAlgorithm` (sync | Promise | Observable).
- Хост `VxLayout` (`vflow[vxLayout]`): входы `algorithm` (alias `vxLayout`), `options`, `nodes`, `edges`, `trigger`, `animate`; выход `layoutEnd`; метод `run()`.
  - Готовность: `computed` «все `getNodeRect(id)` определены» (реактивно — см. комментарий у METHODS_API в `vflow.component.ts`); первый запуск после `initialized`.
  - `trigger: 'auto'`: перезапуск при изменении набора id нод/рёбер (не при каждом движении) и при первом измерении новых нод; `'manual'` — только `run()`.
  - Устаревшие результаты: счётчик запусков, применять только последний.
  - Пиннинг: ноды между `nodeDragStart` и `nodeDragEnd` не трогать.
  - Применение: позиции во flow space → node space родителя (`flowToNodeSpacePosition` через `getNodeRect(parentId)` или `parent.point`), запись в `node.point` (application-owned signal). Для `parentId`-нод алгоритм отвечает за согласованность вложенных позиций.
  - `animate`: аниматор из Studio как функция `createNodePositionAnimator(nodes, options)` (экспорт), без `Required<Node>` — только `point`; `queued` сохранить; `cancel` на destroy.
- Observable-результат (continuous): каждое значение применяется мгновенно, `layoutEnd` — по `complete`.
- Решить: нужен ли `createLayout()` (функциональный API без директивы) — предложение: нет в v1, директива достаточна.

## Тесты

- Unit (browser mode): алгоритм получает измеренные размеры `auto`-нод; не запускается до измерения; stale-результат отброшен; тянущаяся нода не перезаписана; позиции вложенной ноды переведены в node space; `animate` доходит до цели и эмитит `layoutEnd`.
- node-dom: в jsdom `initialized` не эмитится (контракт Unit testing) — директива не падает и ничего не пишет.

## Comments

2026-11-07, сделано:

- `libs/layout` по каркасу 03; peer `rxjs` добавлен (хост различает Observable через `isObservable`). `project.json` гоняет и node-dom конфиг.
- Контракт (`layout.types.ts`): `LayoutNode { id, width, height, parentId, x, y }` — к плану добавлены текущие `x`/`y` во flow space, чтобы непрерывные алгоритмы (force) стартовали с имеющихся позиций; `LayoutEdge`, `LayoutGraph`, `LayoutResult { positions: Map<id, Point> }` во flow space; `LayoutAlgorithm = (graph) => result | Promise | Observable`. Входа `options` у хоста нет: адаптер принимает опции при создании (`dagreLayout({ rankdir })`) и возвращает функцию; новая функция = новый запуск, поэтому создавать её в компоненте, а не в шаблоне.
- Хост `VxLayout` (`vflow[vxLayout]`): входы `vxLayout`, `vxLayoutTrigger` (`auto` | `manual`), `vxLayoutAnimate` (boolean | опции аниматора); выход `vxLayoutEnd`; `run(): Promise<LayoutResult | null>`. Ноды и рёбра читаются из входов самого `vflow` (`inject(VflowComponent).nodes()/edges()`), отдельных входов нет.
- Готовность = `initialized` флоу (подписка на output) **и** `getNodeRect` у всех нод: одних `getNodeRect` мало — в jsdom модели получают измерение с нулями, и алгоритм запускался; с `initialized` в jsdom/happy-dom запуска нет (node-dom spec).
- Триггер `auto`: effect по алгоритму, строке id нод и рёбер, готовности; движение/ресайз не перезапускают. Устаревший результат отбрасывается по счётчику поколения и по той же строке структуры. Тянущиеся ноды (между `nodeDragStart`/`nodeDragEnd`) не перезаписываются.
- Применение: flow space → node space через позицию родителя из результата, иначе через `getNodeRect(parent)`. Observable: каждое значение мгновенно, `vxLayoutEnd` по `complete` с последним значением; sync/Promise — с анимацией по `vxLayoutAnimate`.
- Аниматор `createNodePositionAnimator(nodes, options)` экспортируется: длительность от дистанции (`speed`, `minDuration`, `maxDuration`) или фиксированная `duration`, easing in-out cubic, `queued`, `cancel`, `animate()` резолвится `true` по прибытию и `false` при замене.
- Spec (browser, 7): измеренный граф и node-space позиции вложенной ноды, перезапуск по алгоритму и набору нод (не по движению), stale-результат, пиннинг при drag, анимация с `vxLayoutEnd` после, Observable, `manual`. node-dom (jsdom/happy-dom × zoneless/zone): директива рендерится и не запускается.
- Docs-страница и демо — в 06 вместе с адаптерами.

2026-11-08, разбор ответственностей `VxLayout` (обсуждение с Артёмом):

- Анимация вынесена из хоста: `VxLayoutAnimate` (`vflow[vxLayout][vxLayoutAnimate]`) предоставляет себя как
  `VX_LAYOUT_POSITION_WRITER` (`LayoutPositionWriter { write(targets), cancel() }`), хост берёт писателя через
  `inject(..., { optional: true, self: true })` и иначе ставит позиции сразу. Правила «первый лейаут без анимации» и
  «непрерывный лейаут пишет сразу» остались в хосте. Тот же приём, что ворота инициализации в core.
- `vxLayoutTrigger` удалён: `vxLayout` стал необязательным (`<vflow vxLayout>` без значения = только
  `run(algorithm)`); пустой атрибут превращается в `null` через `transform`. `run()` без алгоритма бросает ошибку.
- Ядро: промис и observable сведены в один поток (`from(Promise.resolve(x))`), одна подписка, `finalize` отпускает
  ворота и резолвит промис `run()`; `generation` и проверка структуры внутри прогона не нужны — отписка нового прогона
  гарантирует, что старый результат не придёт. Три сигнала ворот заменены полем `release`: пока оно не `null`,
  первый paint ещё впереди и лейаут ставится сразу. Ошибка лейаута в авто-режиме уходит в `ErrorHandler`.
- Аниматор принимает `Map<Node, Point>` в `animate()` и создаётся без списка нод.

2026-11-08, второй проход (строгость типов):

- `vxLayout` снова `input.required`; ручного режима нет, `run(): void` перезапускает привязанный алгоритм
  (кнопка «разложить заново»), момент окончания — `vxLayoutEnd`.
- `LayoutAlgorithm` возвращает только `Observable<LayoutResult>`: dagre — `of(...)`, ELK — `defer(async ...)`,
  force как был. В хосте один путь: `concatMap(apply)`, `finalize(paint)`, без `isObservable`/`from`/промиса вокруг.
- `VxLayoutAnimate`: вход только опции аниматора (`{}` по умолчанию, пустой атрибут → `{}`), без `boolean`;
  правило «непрерывный лейаут пишет сразу» убрано — директива для одношаговых лейаутов, что сказано в доке.
- `LayoutPositionWriter.write` и `animate()` резолвятся `void` (замена/отмена тоже резолвит), булев результат никто
  не использовал.
- `run()` удалён: новая функция алгоритма и есть «разложить заново», императивный вход дублировал её.
- Триггер переписан на rx: `combineLatest(toObservable(vxLayout), toObservable(structure))` →
  `switchMap(ждать ready)` → `switchMap(прогон)`; `switchMap` даёт «новый прогон заменяет старый», `finalize`
  открывает ворота и отменяет писателя, `catchError` → `ErrorHandler`. Эффекта-триггера и полей `running`/`stop()`
  нет. Драги — `merge(outputToObservable(...))` с `share()`, без Subject.
- Писатель по умолчанию — фабрика токена `VX_LAYOUT_POSITION_WRITER` (`providedIn: 'root'`), хост делает простой
  `inject(VX_LAYOUT_POSITION_WRITER)`: директива на элементе перекрывает, иначе корневой. Перенос правила «до
  первого paint ставить сразу» в `VxLayoutAnimate` Артём откатил: `release: (() => void) | null` остаётся в хосте.
- Контракт ворот: `onMeasured(): Promise<void>` вместо колбэка `ready`; core открывает ворота, когда промис
  settled (resolve или reject). В хосте вместо `release: (() => void) | null` один сигнал `placed` («первые позиции
  на месте»): по нему `apply` ставит сразу или через писателя, `onMeasured` возвращает
  `firstValueFrom(placed$.pipe(filter(Boolean)))`, `finalize` ставит `placed` на случай пустого или упавшего прогона.
- Хост всегда пишет через писателя и не зовёт `placeNodes` сам; «до первого paint ставить сразу» — правило
  `VxLayoutAnimate` (флаг `painted` по `initialized` флоу).
