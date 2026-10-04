# 02. Core работает в DOM без layout

Status: resolved
Type: task
Blocked by: —

Решение (2026-10-04): геометрия — только в browser mode; в jsdom и happy-dom flow должен рендериться и реагировать без заглушек.

## Answer

Правки core (пути от `libs/ngx-vflow/src/lib/vflow/`):

- `services/resize-observer.service.ts`, `utils/resizable.ts` — без `ResizeObserver` ничего не наблюдают.
- `models/handle.model.ts` — без `DOMMatrixReadOnly` zoom берётся из viewport-сигнала. Предупреждение «handle has no layout box» молчит, если box'а нет у самого узла: скрытый узел или DOM без layout.
- `public-components/minimap/minimap-canvas.directive.ts` — context не запрашивается для пустого bitmap (jsdom логирует каждый `getContext`); pointer capture через optional call.
- `directives/connection-controller.directive.ts` — `hasPointerCapture` через optional call.

Проверка: `libs/ngx-vflow/node-dom/*.spec.ts`, 10 тестов в двух окружениях (jsdom 29, happy-dom 20). `afterEach` падает на любом `console.error` и `console.warn`. Запускаются в `nx test ngx-vflow` третьим шагом (`vitest.node-dom.config.mts`); `jsdom` и `happy-dom` добавлены в devDependencies.

Что работает без layout: рендер презентаций узлов, рёбер и labels; реакция на изменения `nodes`/`edges`; выбор кликом; соединение pointer-событиями; `(componentNodeEvent)`; `setViewport`, `zoomTo`, `zoomIn`, `zoomOut`, `getNode`.

Что честно не работает: `initialized()` остаётся `false`, `fitView()` резолвится в `false`, размеры и позиции handles — нули.
