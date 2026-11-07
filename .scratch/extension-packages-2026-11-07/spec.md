# Пакеты-расширения @vflow/*: умные кривые, авторазмер родителей, авто-лейауты

Статус: план, 2026-11-07. Подтверждено пользователем 2026-11-07: отдельные пакеты, префикс `vx`, имя `@vflow/routing`.
Основание: исходники `dev/vflow-studio/libs/*`, [отчёт о плагинной архитектуре](../plugin-architecture-2026-09-20/reports), ADR-0002, ADR-0008, `docs/releasing.md` («Add a package»), CONTEXT.md («First-party extension»).

## Цель

Перенести наработки Vflow Studio в этот репозиторий как публикуемые пакеты в fixed release group вместе с `ngx-vflow` и `@vflow/cli`, под скоупом `@vflow/*`, на API 3.0:

| Пакет              | Источник в studio                                                                                                     | Что это                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vflow/routing`   | `libs/smart-curves` (`smartEdgeFactory`, ~1000 строк A*)                                                              | `CurveFactory`, обходящая ноды-препятствия ортогональным путём со скруглениями                                                                              |
| `@vflow/auto-size` | `libs/group-auto-scaling` (`GroupAutoScalerDirective`)                                                                | Директива на `vflow`: родитель растёт под детей во время drag                                                                                               |
| `@vflow/layout`    | `libs/expand-collapse` (`DagreLayoutDirective`), `libs/node-position-animation` (аниматор), cookbook `force`/`vizdom` | Общий контракт лейаута + хост, применяющий позиции; адаптеры во вторичных entry points `@vflow/layout/dagre`, `@vflow/layout/elk`, `@vflow/layout/d3-force` |

Не пакеты (остаются рецептами или вне репозитория):

- **Expand/collapse** — `getVisibleNodes()` это 20 строк обхода дерева; становится страницей-рецептом поверх `@vflow/layout/dagre`.
- **Node position animation** — не отдельный пакет: аниматор становится «applier» в `@vflow/layout` (`animate: { duration }`) и экспортируется из него же как `createNodePositionAnimator` для ручного использования.
- **Mermaid clone** — приложение (парсер + редактор), а не библиотека; остаётся витриной Studio. В план не входит.

## Предпосылка: Studio-контент становится MIT

Сейчас страницы Cookbook `smart-curves`, `group-auto-scaling`, `expand-collapse`, `node-position-animation` помечены `@status:primary STUDIO` и показывают платный iframe с `vflow-studio.com/embed/*`. После публикации пакетов эти страницы заменяются живыми демо из пакетов, пометка STUDIO снимается. Это решение пользователя (2026-11-07); mermaid-clone остаётся платным.

## Решения (предложение)

### Форма поставки

- **Отдельные npm-пакеты, не secondary entry points `ngx-vflow`.** Отчёт о плагинах предлагал `ngx-vflow/routing-avoid`; но у расширений свои optional peer-зависимости (`@dagrejs/dagre`, `elkjs`, `d3-force`) и свой ритм изменений API. Пакеты остаются в одной fixed group: одна версия, один тег `v{version}` (как `@vflow/cli`).
- **Один пакет `@vflow/layout` с вторичными entry points** вместо `@vflow/layout-dagre` и т.д.: как `@angular/material/button`. Движки — `peerDependencies` с `peerDependenciesMeta.optional: true`; импорт `@vflow/layout/elk` тянет `elkjs` только у тех, кто его использует. ng-packagr собирает secondary entries из `libs/layout/{dagre,elk,d3-force}/ng-package.json`.
- **Сборка — ng-packagr** по образцу `libs/ngx-vflow/project.json` (`partial` compilation, `sideEffects: false`), тег `release`, `nx-release-publish` с `packageRoot: dist/{projectRoot}`.
- **Зависимости**: `peerDependencies`: `ngx-vflow: ^3.0.0`, `@angular/core` `^20 || ^21 || ^22` (как у `ngx-vflow`); `dependencies`: `tslib`. Пакеты импортируют только публичный API `ngx-vflow` — никаких `ɵ` (`.scratch/core-platform-parity/spec.md`).
- **Версия в исходниках** — текущая общая (`2.7.0`), Nx поднимает всем до `3.0.0` при релизе. Первый релиз группы публикует четыре пакета: `ngx-vflow`, `@vflow/cli`, `@vflow/routing`, `@vflow/auto-size`, `@vflow/layout` (пять, если считать по именам).

### Префикс и имена (подтверждено 2026-11-07)

ADR-0008 закрепляет `v` за core и `vui` за UI. Для пакетов-расширений предлагается общий префикс **`vx`** («vflow extension»): селекторы `vflow[vxAutoSize]`, `vflow[vxLayout]`, классы `VxAutoSize`, `VxLayout`; функции без префикса в camelCase (`createAvoidNodesCurve`, `avoidNodesCurve`, `dagreLayout`). Альтернатива — префикс на пакет (`vlayout`, `vsize`) — отклонена: три префикса на три маленьких пакета хуже одного. ADR-0008 дополняется одним абзацем (тикет 07).

Имена пакетов: `@vflow/routing` — термин экосистемы (JointJS routers и `@joint/router-avoid`, GoJS `Link.routing`, yFiles `EdgeRouter`); «smart» есть только в React Flow-комьюнити и не описывает поведение. Экспорт назван по эффекту, как GoJS `AvoidsNodes`: `avoidNodesCurve` / `createAvoidNodesCurve`; позже в тот же пакет войдёт push-роутер `@vflow/routing/avoid` (libavoid). `@vflow/auto-size` (CONTEXT.md избегает «group»: растёт «родительская нода»), `@vflow/layout`.

### Инфраструктура в репозитории (на пакет)

1. `libs/<name>/`: `package.json`, `ng-package.json`, `project.json` (build/test/lint/nx-release-publish, tag `release`), `tsconfig.lib.json`, `tsconfig.lib.prod.json`, `tsconfig.spec.json`, `vitest.config.mts` через `defineAngularTestConfig`, `README.md`, `LICENSE`, `src/public-api.ts`.
2. Алиасы: корневой `tsconfig.json` `paths` → `libs/<name>/src/public-api`; `apps/docs/tsconfig.hybrid.json` → `dist/libs/<name>` (гибридная сборка docs проверяет собранный пакет, как для `ngx-vflow`). `vitest.shared.mts` читает `paths` сам.
3. Lint: `@angular-eslint/builder:lint` по `libs/<name>/**/*.ts`.
4. Docs: новая категория **Packages** (`apps/docs/src/app/categories/packages`, order 9 — между Cookbook и Design system), страница на пакет: установка, API, живое демо, ограничения. Страницы Cookbook со STUDIO-iframe заменяются ссылками/перемещаются.
5. e2e: `apps/docs-e2e/<name>.spec.ts` на demo-страницах (Playwright, как `resizer.spec.ts`).
6. `docs/releasing.md`: список пакетов группы, абзац про optional peers у `@vflow/layout`.

### Что нужно от ядра (блокирует пакеты)

1. **Геометрия всех нод в `CurveFactory`** (тикет 01, блокирует routing). Сейчас `allNodes` — raw `Node[]`; у `auto`-нод нет `width`/`height`, а измеренный размер есть только в `NodeModel.geometry()`. Studio обходил это дефолтом 150×60. Добавить `nodeGeometries: readonly NodeGeometry[]` в `CurveFactorySharedParams` (из `flowEntitiesService.nodes().map(m => m.geometry())`, одним `computed`), `allNodes` оставить. `NodeGeometry` получает `parentId: string | null`, чтобы фабрика исключала предков ребра из препятствий (правило JointJS/react-flow-smart-edge, при «любая нода — родитель» критично).
2. **Drag переживает сдвиг origin родителя** (тикет 02, блокирует auto-size). `DraggableService` хранит `initialPositions` как `node.point() − flowPointer`, то есть в node space родителя. Если пакет во время drag сдвигает `parent.point` на −d (рост влево/вверх) и компенсирует детей на +d, следующий `onMove` перезапишет точку тянущейся ноды без +d — нода «отскочит», авторазмер сработает снова: осцилляция. Studio обходил это хаком `data.offset` (визуальный сдвиг в шаблоне группы до конца drag) — для библиотеки это требует кооперации шаблона потребителя, отклонено. Решение в ядре: хранить начальные смещения во flow space (`globalPoint − flowPointer`) и на каждом move переводить в node space текущего родителя (`flowToNodeSpacePosition`). Тогда тянущаяся нода остаётся под курсором при любом сдвиге предков, а пакет пишет позиции синхронно в обработчике `(nodeDrag)` — один тик, без дрожания. Это же чинит кейс «ресайзер двигает origin родителя во время drag ребёнка».

Не требуется: transform-хук с батчем из отчёта о плагинах. Signal-записи в одном обработчике и так применяются атомарно до рендера; батч нужен только для veto, которого у auto-size нет.

Известные ограничения, которые пакеты документируют, а не обходят:

- `extent: 'parent'` зажимает ребёнка внутри родителя **до** того, как auto-size успеет вырасти, поэтому детям авторастущего родителя нужен `extent: null` (как в Studio). Вариант `extent: 'grow'` в ядре — возможное развитие, в план не входит.
- Родитель растёт только по оси с явным размером (`width`/`height` signal). `auto`-ось перетирается измерением (`linkedSignal` + ResizeObserver); писать туда бессмысленно.
- Лейаут считается по измеренным размерам: хост ждёт, пока `getNodeRect(id)` определён для всех нод (запрос реактивный — `computed` над ним перезапускается при измерении). Для нод, не попавших во вьюпорт при `lazyLoadTrigger: 'viewport'` без виртуализации, размер — дефолт 100×50; документируем.

### Контракты пакетов

**`@vflow/routing`**

```ts
export interface AvoidNodesCurveOptions {
  nodePadding?: number; // 14 — зазор вокруг препятствий
  approachDistance?: number; // 24 — прямой выход из handle до первого поворота
  cornerRadius?: number; // 8
  gridSpacing?: number; // 20
  bendPenalty?: number; // 50
  obstacleMargin?: number; // 280 — радиус поиска препятствий вокруг пары точек
  /** Ноды, которые не считаются препятствиями, помимо предков ребра. */
  isObstacle?: (node: NodeGeometry) => boolean;
}
export const avoidNodesCurve: CurveFactory; // с дефолтами
export function createAvoidNodesCurve(options: AvoidNodesCurveOptions): CurveFactory;
```

Использование: `curve: avoidNodesCurve` на ребре или `createEdges([...])` с общей фабрикой; в режиме `connection` фабрика тоже работает (превью соединения обходит ноды). Возвращает `path`, `labelPoints` (start/center/end с `angle` для `orient: 'path'`) и `bounds` (для виртуализации — иначе ядро измеряет путь через SVG).

Производительность: pull-модель (как в Studio) — путь каждого ребра пересчитывается при движении любой ноды в радиусе `obstacleMargin`; `nodeGeometries` — один `computed`, но чтение его в фабрике делает каждый edge-path зависимым от всех нод. Ограничение известно (отчёт о плагинах: глобальный роутер — push-модель); тикет 03 замеряет на 200 нод/300 рёбер и фиксирует порог в docs. Push-роутер (libavoid, воркер) — отдельный будущий effort.

**`@vflow/auto-size`**

```ts
@Directive({ selector: 'vflow[vxAutoSize]' })
export class VxAutoSize {
  readonly padding = input(24, { alias: 'vxAutoSizePadding' }); // или объект {top,right,bottom,left}
  readonly shouldResize = input<(parent: Node) => boolean>(() => true); // какие родители растут
  readonly shrink = input(false); // сжиматься ли обратно (по умолчанию только рост, как в Studio)
}
```

Поведение: на `(nodeDrag)` для каждого предка тянущихся нод (снизу вверх, синхронно) считает bounds детей через `flow.getNodeRect()` (дети в node space родителя → `flowToNodeSpacePosition`), расширяет `width`/`height`, при росте влево/вверх сдвигает `parent.point` на −d и всех детей на +d. Пишет только application-owned signals (ADR-0002: интерактивные свойства — позиция и размер). Ничего не хранит в `data`. На `(nodeDragEnd)` ничего не коммитит — состояние уже консистентно (хак `offset` из Studio не нужен после тикета 02). Также реагирует на `nodesChanges.size` детей (ресайз ребёнка внутри родителя) — опционально, решить в тикете 04.

**`@vflow/layout`**

```ts
export interface LayoutNode {
  id: string;
  width: number;
  height: number;
  parentId: string | null;
}
export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
}
export interface LayoutGraph {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}
/** Позиции во flow space; хост переводит в node space родителя. */
export interface LayoutResult {
  positions: ReadonlyMap<string, Point>;
}
export type LayoutAlgorithm<O = unknown> = (graph: LayoutGraph, options?: O) => LayoutResult | Promise<LayoutResult> | Observable<LayoutResult>;

@Directive({ selector: 'vflow[vxLayout]' })
export class VxLayout {
  readonly algorithm = input.required<LayoutAlgorithm>({ alias: 'vxLayout' });
  readonly options = input<unknown>();
  readonly nodes = input.required<readonly Node[]>(); // те же массивы, что у vflow — директива не может читать входы хоста
  readonly edges = input<readonly Edge[]>([]);
  readonly trigger = input<'auto' | 'manual'>('auto'); // auto: при изменении набора нод/рёбер и измерений
  readonly animate = input<boolean | { duration?: number }>(false);
  readonly layoutEnd = output<LayoutResult>();
  run(): Promise<LayoutResult>; // для 'manual'
}
```

Хост: ждёт готовность (`initialized` + все `getNodeRect` определены), строит `LayoutGraph` из измеренных размеров, вызывает алгоритм, отбрасывает устаревший результат по счётчику запуска, не трогает ноды, которые сейчас тянут (`nodeDragStart`/`nodeDragEnd`), применяет позиции мгновенно или через аниматор из Studio (`createNodePositionAnimator`: длительность от дистанции, min/max, очередь). Observable-результат (d3-force) — непрерывный режим: каждое значение применяется мгновенно.

Адаптеры (secondary entries):

- `@vflow/layout/dagre`: `dagreLayout(options: DagreOptions): LayoutAlgorithm` — `rankdir`, `nodesep`, `ranksep`, `align`, `ranker`; compound через `setParent` для `parentId`. Peer `@dagrejs/dagre`.
- `@vflow/layout/elk`: `elkLayout(options: ElkOptions): LayoutAlgorithm` — `layoutOptions` ELK как есть (`elk.algorithm`, `elk.direction`, …), вложенные ноды → children ELK; ELK считает в Web Worker (`elkjs/lib/elk.bundled.js` или `elk-api` + worker — решить в тикете 06). Peer `elkjs`.
- `@vflow/layout/d3-force`: `forceLayout(options): LayoutAlgorithm` возвращает Observable, прокидывает `tick`; заменяет ручной прокси `x/y` из cookbook. Peer `d3-force`.

Vizdom не адаптируется; страница Cookbook `vizdom-layout` и зависимость `@vizdom/vizdom-ts-web` удалены (решение пользователя 2026-11-07). Страница `expand-collapse` тоже удалена, а не переписана.

## Ход работ

- 2026-11-07: тикеты 01 и 02 реализованы в ядре (см. комментарии в тикетах). Фаза B разблокирована.
- 2026-11-07: тикет 03 — `@vflow/routing` собран, протестирован, задокументирован; каркас для 04–06 готов (сборка пакета против `dist/libs/ngx-vflow`, см. тикет).
- 2026-11-07: алгоритм routing проверен стендом и доработан в ближней зоне (17 % → 2.5 % рёбер с нарушениями на случайных графах, пересечений нод и самопересечений нет; см. тикет 03).
- 2026-11-07: тикет 04 — `@vflow/auto-size` (директива `vxAutoSize`), тесты, docs, e2e; dry-run группы из четырёх пакетов.
- 2026-11-07: тикет 05 — `@vflow/layout` ядро: контракт, хост `vxLayout`, аниматор; готовность завязана на `initialized` флоу.
- 2026-11-07: тикет 06 — адаптеры dagre/elk/d3-force, docs Layout, cookbook `force` на пакете; `expand-collapse` и `vizdom-layout` удалены; `LayoutResult.sizes` для родителей; у ELK типизированный фасад опций без сырых `LayoutOptions`.

## Порядок

| Фаза         | Тикеты                                                                                                        | Разблокирует |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ------------ |
| A — ядро     | 01 nodeGeometries в CurveFactory; 02 drag во flow-space offsets                                               | пакеты       |
| B — пакеты   | 03 routing (включая каркас первого пакета); 04 auto-size; 05 layout core; 06 адаптеры dagre/elk/d3-force      | docs         |
| C — поставка | 07 docs-категория Packages, замена STUDIO-страниц, ADR, releasing.md; 08 release dry-run и smoke на тарболлах | релиз 3.0    |

03 идёт первым в фазе B: он создаёт каркас (`libs/<name>` + алиасы + docs-категория), который 04–06 копируют. 04 и 05/06 независимы друг от друга.

## Возможные дополнения (не в плане; на выбор)

- `@vflow/export`: `toSvg(flow)`/`toPng(flow)` снимок флоу (частый запрос в экосистеме React Flow; у нас HTML-ноды → `foreignObject` или html-to-image).
- `@vflow/history`: undo/redo поверх application-owned signals — снапшоты `nodes`/`edges` по `nodesChanges`/`edgesChanges`; не противоречит ADR-0002, но дизайн нетривиален (гранулярность, drag как одна запись).
- Proximity connect (`easy-connect` уже рецепт) — как пакет имеет смысл только после эфемерного слоя в ядре (отчёт о плагинах).

## Issues

1. [Геометрия всех нод в параметрах CurveFactory](issues/01-curve-factory-node-geometries.md)
2. [Drag хранит смещения во flow space](issues/02-drag-flow-space-offsets.md)
3. [@vflow/routing и каркас пакета-расширения](issues/03-routing-package.md)
4. [@vflow/auto-size](issues/04-auto-size-package.md)
5. [@vflow/layout: контракт, хост, аниматор](issues/05-layout-package-core.md)
6. [@vflow/layout: адаптеры dagre, elk, d3-force](issues/06-layout-adapters.md)
7. [Docs «Packages», замена STUDIO-страниц, ADR и releasing.md](issues/07-docs-and-adr.md)
8. [Release dry-run и smoke на тарболлах](issues/08-release-smoke.md)
