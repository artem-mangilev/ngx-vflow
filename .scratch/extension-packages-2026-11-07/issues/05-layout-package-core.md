# 05. `@vflow/layout`: контракт, хост, аниматор

Status: ready-for-agent
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
