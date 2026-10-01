# 02. Форма viewport API: `duration`, центрирование, один метод записи

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: 01

Отчёт: 1.2 (`duration`), 2.5 (`panTo`), 3.2. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- `viewportTo(state)`, `zoomTo(zoom)` и `panTo(translation)` — три метода над одним `Partial<ViewportState>`. В них зашит `duration: 0`: анимировать можно только `fitView({ duration })`.
- `panTo(point)` принимает сдвиг viewport, а не точку графа. Об этом предупреждает собственный JSDoc метода (`components/vflow/vflow.component.ts:600-606`). Центрировать на точке или узле графа нечем.
- Публичный `fitView()` возвращает `void`, хотя сервис знает, применилось ли изменение (`services/viewport.service.ts:47`).

Методы почти не используются, поэтому ломать дёшево. В `apps` вызовов нет. В `libs` есть только `VflowControls.zoomTo` (`libs/ui/src/lib/controls.component.ts:106`) и мок (`libs/ngx-vflow/testing/src/component-mocks/vflow-mock.component.ts:205-215`).

## Решение (2026-10-01)

Набор методов — как у React Flow (де-факто стандарт), `duration` в опциях каждого метода:

```ts
setViewport(viewport: ViewportState, options?: ViewportOptions): Promise<boolean>
setCenter(point: Point, options?: ViewportOptions & { zoom?: number }): Promise<boolean>
fitView(options?: FitViewOptions): Promise<boolean> // + minZoom, maxZoom
zoomTo(zoom: number, options?: ViewportOptions): Promise<boolean>
zoomIn(options?: ViewportOptions): Promise<boolean>
zoomOut(options?: ViewportOptions): Promise<boolean>

interface ViewportOptions {
  duration?: number;
}
```

- **`viewportTo` и `panTo` удалить.** Сдвиг без зума: `setViewport({ ...flow.viewport(), x, y })`.
- **`setViewport` принимает полный `ViewportState`, не `Partial`.** `setViewport` — «поставить точно», `zoomTo` — «зум вокруг центра pane»; у частичного состояния было два смысла.
- **`setCenter(point, …)` принимает `Point` в координатах графа** (как `clientToFlowPosition(point)`), ставит его в центр pane; без `zoom` — при текущем зуме.
- **`FitViewOptions` получает `minZoom` и `maxZoom`.** Они сужают глобальные пределы для этого вызова; `fitView({ nodes: [id], maxZoom })` — фокус на узле, отдельный `centerOnNode` не нужен.
- **Все методы возвращают `Promise<boolean>`.** Резолвится по окончании изменения (сразу при `duration: 0`): `true` — применилось, `false` — нет (например, `fitView` нечего вписывать).
- **`zoomIn` / `zoomOut` в core** с шагом `ZOOM_STEP` (`services/keyboard-viewport-commands.service.ts`), вокруг центра pane, в пределах зума.

Не добавлять:

- `fitBounds(rect)` — отложено; добавляется позже без ломки (отдельным методом или полем `bounds` в `FitViewOptions`).
- `panBy`, `zoomBy`, `resetZoom`, `getViewport`, `getZoom` — выражаются через сигнал `viewport()` и методы выше.
- `easing` / `interpolate` — добавляются в `ViewportOptions` позже без ломки.

## Сделать

- `components/vflow/vflow.component.ts`, `services/viewport.service.ts`, `interfaces/fit-view-options.interface.ts`, новый `ViewportOptions` в публичном barrel.
- Мок `VflowMockComponent` (`libs/ngx-vflow/testing/src/component-mocks/vflow-mock.component.ts`) — тот же набор методов.
- `libs/ui/src/lib/controls.component.ts`: перейти на `zoomIn()` / `zoomOut()`, убрать собственный clamp и input `step` (решение 2026-10-01: шаг только в core).
- Docs: `apps/docs/src/app/categories/interactions/pages/viewport-gestures/index.md:107`, migration guide (Removed APIs: `viewportTo`, `panTo`), страница API компонента.
- spec:
  - `duration` анимирует, Promise резолвится после анимации;
  - `setCenter` ставит точку графа в центр pane при текущем и заданном zoom;
  - `fitView` с `maxZoom` не превышает его; `fitView` без узлов резолвится `false`;
  - `zoomIn` / `zoomOut` упираются в `minZoom` / `maxZoom`.

## Answer

Сделано 2026-10-01, без коммита.

- **Канал изменений.** `ViewportChange` теперь `{ target(from, center), duration, done(reached) }`: цель вычисляется от того, куда ведёт предыдущее изменение, и от центра pane. `ViewportService` строит цели: `change(partial)` (внутренние вызовы: auto-pan, minimap, клавиатура), `zoomBy`, `setCenter`, `fitView`. Каждый возвращает `Promise<boolean>`.
- **Promise.** `true` — viewport дошёл до цели (при `duration: 0` сразу). `false` — нечего менять (`fitView` без узлов или без размера pane), анимацию прервал другой вызов или жест, директива уничтожена, или изменение так и не применилось до уничтожения сервиса.
- **`fitView`** вычисляет цель в момент применения, а не вызова. `minZoom`/`maxZoom` из опций зажимаются в пределы flow; при `minZoom > maxZoom` побеждает `maxZoom`. Невалидные `padding`/`minZoom`/`maxZoom` бросают `RangeError` синхронно, как раньше бросал `getViewportForBounds`.
- **`ZOOM_STEP`** переехал в `services/viewport.service.ts`; его используют клавиши зума и `zoomIn`/`zoomOut`. Клавиатурный зум теперь тоже складывается с целью анимации; объявление зума читает viewport после применения.
- **`VflowControls`**: кнопки вызывают `flow().zoomIn()` / `zoomOut()`, input `step` и собственный clamp удалены.
- **Мок** `VflowMockComponent`: тот же набор методов, зум в пределах `minZoom`/`maxZoom`, центр pane считается в начале координат, `fitView` не двигает viewport и резолвится `true`.
- **Публичный barrel**: `ViewportOptions`, `SetCenterOptions`.
- **Docs**: `viewport-gestures/index.md`, migration guide — раздел «Viewport methods» и три строки в Removed APIs (`viewportTo`, `panTo`, `step` у `vflow-controls`). Страница API генерируется из JSDoc.

Тесты: `viewport-gestures.spec.ts` — 2 переписаны на публичный API с `duration`, 3 новых (Promise, `setCenter`, `zoomIn`/`zoomOut`); `initial-viewport.spec.ts` — `fitView` с `minZoom`/`maxZoom`; `viewport.service.spec.ts` переписан под новый `ViewportChange` + spec на `done`. Остальные specs переведены с `viewportTo`/`panTo` на `setViewport`. Полный набор `ngx-vflow` — 377 SUCCESS; eslint `ngx-vflow` и `ui` чистый; `ngx-vflow`, `ngx-vflow/testing`, `@vflow/ui` собираются с временным экспортом `ViewportCullingDirective` (NG3001 на `3.0` по-прежнему не починен).
