# 11. Документация: исправить расхождения с текущим API

Status: ready-for-agent
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: раздел 5. Здесь только фактические ошибки о текущем поведении. Страницы, которые изменятся по решениям тикетов 01–09, правятся в своих тикетах. Пути — от `apps/docs/src/app/categories/`.

## Неверно

- **`SelectionBoxSettings.color`** упомянут в трёх местах, а значение молча игнорируется:
  - `interactions/pages/selection-box/index.md:13-22`;
  - демо `selection-box-demo.component.ts:60-63`;
  - JSDoc `[selectionBox]` (`libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.ts:364-369`).
- **`ReconnectionEvent`** → `ReconnectEvent` (`edges/connections/index.md:33`).
- **«By default, every connection is valid»** (`edges/connections/index.md:21`) неверно: жест отклоняет self-connection и пары одинаковых типов (`libs/ngx-vflow/src/lib/vflow/models/connection.model.ts:11-17`). Описать `allowSelfConnections`.
- **`EdgeContext`** (`edges/custom-edges/index.md:12-21`): реальный — `{ $implicit: EdgeRef }`. Убрать фразу «tricky to infer type for `let-ctx`» — type guards есть.
- **`interactions/pages/selecting/index.md`:** «Edges need `selectable`» (`:3`) неверно; фраза про focus (`:13`) устарела.
- **`nodes/resizer/index.md:24`:** причина «`ctx.node.width` is not reactive» неверна — сигнала обычно просто нет. Контракт решает тикет 04, здесь убрать неверное объяснение.
- **Таблицы атрибутов handle** (`handles/pages/custom-handles/index.md:61-62`): добавить `any`, `auto`, `center`.
- **`(nodesChanges.[EdgeChangeType])`** → `(edgesChanges.…)` (`interactions/pages/handling-changes/index.md:41`).
- **Migration guide:**
  - модификаторы `pan`/`zoom` → `panActivation`/`zoomActivation` (`introduction/pages/migration/index.md:373`, `interactions/pages/viewport-gestures/index.md:38`);
  - секция «Viewport virtualization» стоит после v1.0 (`introduction/pages/migration/index.md:466`).
- **Сниппеты рёбер:**
  - `edges/labels/index.md:14,17,43`: пометить, что `vflowEdge`/`vflowEdgeLabel` — из `@vflow/ui`;
  - `edges/markers/index.md:39`: объявить маркер `'bar'`.
- **`testing/pages/component-mocks/index.md`:** утверждение «mocks for every public component» неверно; в примере `<vflow #vflow />` нет обязательного `[nodes]`.
- **`FitViewOptions.padding`** — доля размера, а не пиксели: поправить JSDoc (`libs/ngx-vflow/src/lib/vflow/interfaces/fit-view-options.interface.ts`) и docs fitView.
- **Мусор:**
  - `apps/docs/src/assets/sitemap.xml` (lastmod 2026-04-04) содержит 26 удалённых страниц API — перегенерировать или удалить;
  - удалить `viewport/pages/custom-background/demo/grid-custom-background-demo.component copy.ts`.

## Не описано

- outputs: `(connectStart)`, `(connectEnd)`, `(nodeDragStart|nodeDrag|nodeDragEnd)`;
- input `[elevateEdgesOnSelect]`;
- `initialized` — основа fit-on-load в 8 демо;
- `viewportChange$`, `initialized$`;
- методы `getNode()`, `getDetachedEdges()`;
- у `[resizable]`: `gap` и `shouldResize`;
- дефолт `Node.extent: 'parent'` (страница subflows).

## Проверки

- Сборка docs и typecheck.
- `npm run e2e` не падает.
