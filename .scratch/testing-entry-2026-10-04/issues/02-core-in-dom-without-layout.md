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

## Comments

### 2026-10-04 — проверка как потребитель

Временное приложение вне репозитория: Angular 21.2, `@angular/build:unit-test`, Vitest 4.1, пакет из tarball, 11 тестов (сценарии из docs, Testing Library `getByRole`/`findByRole`, `viewChild(VflowComponent)`, первый layout и `fitView` в браузере). Матрица: jsdom 28, happy-dom 20, `--browsers=chromiumHeadless`; zoneless и zone.js. Все шесть прогонов проходят после правок ниже.

Найдено и исправлено:

- **zone.js + jsdom (Vitest 4):** `addEventListener` с опцией `signal` бросает — zone.js вызывает jsdom-слушатель на `AbortSignal` из Node. Воспроизводится без ngx-vflow. `viewport-gestures` и `connection-controller` снимают слушатели явно (`utils/listen.ts`).
- **zone.js + happy-dom:** zone.js подменяет `MutationObserver` классом без методов. Воспроизводится без ngx-vflow. Minimap не наблюдает за темой, если у observer нет `observe`.
- **Примеры в docs** не работали в приложении с zone.js: `whenStable()` там не запускает change detection. В примерах перед ним стоит `fixture.detectChanges()`.

Node-DOM specs идут теперь в четырёх вариантах: jsdom и happy-dom, zoneless и zone.js (`test-setup.zone.ts`, `zone.js` в devDependencies). Вариант happy-dom + zone.js падает без правки minimap. Падение jsdom + zone.js в репозитории не воспроизводится: оно есть только на Vitest 4, а здесь Vitest 3.2.

Найдено и не исправлено: без `@angular/cdk` импорт пакета падает (`Cannot find package '@angular/cdk'`) — его нет в `peerDependencies`.

Не проверялось: Jest, Karma, Angular 20 как потребитель.
