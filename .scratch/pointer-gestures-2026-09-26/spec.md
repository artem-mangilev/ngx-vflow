# Спецификация: собственный слой жестов на Pointer Events вместо d3

Status: implemented
Дата: 2026-09-26, ветка `zoom-pan` (3.0)
Тикеты: `issues/`

## Цель

Убрать `d3-zoom`, `d3-drag`, `d3-selection` (и транзитивные `d3-transition`, `d3-interpolate`, `d3-ease`, `d3-timer`, `d3-dispatch`) из ядра `ngx-vflow`. Вместо них — один компактный модуль на Pointer Events, который живёт внутри библиотеки и подчиняется её правилам (фильтры по `closest`, статусы `FlowStatusService`, сигналы viewport), а не навязывает свои: `.zoom`/`.drag` namespaces на элементах, `stopImmediatePropagation` на `mousedown`, inline `touch-action`, property `__zoom` на pane, transition через side-effect импорт.

Поведение для потребителя сохраняется везде, где оно наблюдаемо через публичный API `<vflow>`: входы жестов, формулы зума, события, методы `viewportTo/zoomTo/panTo/fitView` с анимацией, правила перетаскивания и ресайза. Отклонения перечислены в «Что ломается».

## Текущее состояние (2026-09-26)

| Место                                                                                                                                                            | Что делает                                                                                         | Стек                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directives/map-context.directive.ts`                                                                                                                            | pan/zoom pane: wheel, dblclick, mouse drag, touch pan/pinch, программные изменения с анимацией     | d3-zoom + d3-selection; touch-логика поверх d3 через `property('__zoom')`; `selection.transition()` работает только потому, что d3-zoom импортирует d3-transition (в зависимостях не объявлен) |
| `services/draggable.service.ts`                                                                                                                                  | перетаскивание ноды и выделенных нод, порог `nodeDragThreshold`, кэш геометрии pane, auto-pan sync | d3-drag; порог реализован поверх (`clickDistance` + ручная активация)                                                                                                                          |
| `public-components/resizable/resizer.ts`                                                                                                                         | ресайз по контролу                                                                                 | d3-drag; публичный тип `ResizeDragEvent = D3DragEvent`                                                                                                                                         |
| `utils/allow-root-zoom-for-node-target.ts`                                                                                                                       | классификация цели pointerdown для pane                                                            | чистая функция, проверяет `event.type` mousedown/touchstart                                                                                                                                    |
| `directives/root-pointer.directive.ts`, `pointer.directive.ts`, `handle.directive.ts`, `components/edge/edge.component.ts`, `connection-controller.directive.ts` | выделение по нажатию, selection box, соединения, порог соединения                                  | собственные mouse/touch listeners, `elementFromPoint` для touch                                                                                                                                |
| `directives/auto-pan.directive.ts`, `public-components/minimap/minimap-canvas.directive.ts`                                                                      | auto-pan, минимап                                                                                  | уже Pointer Events; минимап — образец (`setPointerCapture`, `touch-action` через host binding, `blur` → cancel)                                                                                |

Конфликты между этими слоями сегодня разрешаются четырьмя способами одновременно: фильтры по селекторам (`allowRootZoomForNodeTarget`, `[data-vflow-no-drag|no-pan|no-wheel]`, `.vflow-handle`, `.vflow-drag-handle`), `stopImmediatePropagation` d3 на `mousedown`/`touchstart`, снятие inline `touch-action`, которое ставит d3, и `preventDefault` на `touchmove` в трёх местах.

## Термины

- **Жест**: последовательность `pointerdown → pointermove* → pointerup | pointercancel` одного указателя, для pinch — двух.
- **Примитив перетаскивания** (`createPointerDrag`): функция, которая вешает жест на элемент и отдаёт `start/move/end/cancel` после фильтра и порога. Внутренний, не публичный API.
- **Viewport transform**: `{ zoom: k, x, y }` с семантикой d3: `client = flow · k + (x, y)`. Это уже `ViewportState`.
- **Viewport gesture policy**, **Interaction eligibility**: как в `CONTEXT.md`.

## Решения

### D1. Один внутренний модуль `gestures/`, без зависимостей от Angular

`libs/ngx-vflow/src/lib/vflow/gestures/`:

- `viewport-transform.ts`: `scaleAbout(state, k, clientPoint)`, `translateBy`, `invert`, `apply`, `clampZoom`. Порт `ZoomTransform` без `translateExtent`: в vflow нет такой настройки, а `defaultConstrain` d3 с бесконечным extent тождественен.
- `zoom-interpolation.ts`: порт `interpolateZoom` (van Wijk & Nuij, ρ = √2, с линейной веткой при совпадении масштаба), `easeCubicInOut`, аниматор на `requestAnimationFrame` с `interrupt()`. Это ровно то, что даёт d3-transition + d3-zoom для `duration > 0`.
- `wheel.ts`: `wheelZoomFactor(event)` по формуле d3 и `wheelPanDelta(event, paneHeight)` по текущей формуле scroll-pan.
- `pointer-drag.ts`: примитив (D2).
- `pinch.ts`: математика двух указателей (D4).

Angular-обёртки остаются на своих местах: `ViewportGesturesDirective` (замена `MapContextDirective`, селектор `div[viewportGestures]`), `DraggableService`, `createResizer`. Сигнатуры `enable/disable/destroy` и `createResizer` не меняются.

### D2. Только Pointer Events; правила, из которых складывается отсутствие конфликтов

1. **`pointerdown` никогда не получает `preventDefault`.** Иначе браузер не выпустит compat-события `mousedown/mouseup`, на которых пока живут `PointerDirective` (выделение), `HandleDirective` (соединения), `EdgeComponent`, а также фокус a11y-обёрток. Принятый жест делает `stopPropagation()` (аналог d3 `nopropagation`), чтобы pane не начал pan, а root не начал selection box. Compat `mousedown` диспатчится отдельно, и `stopPropagation` на `pointerdown` на него не влияет; это проверяет тикет 01.
2. **`pointermove/pointerup/pointercancel` слушаются на `window` в capture-фазе и фильтруются по `pointerId`** (паритет с d3, который слушает `event.view`). `setPointerCapture` вызывается best effort в `try/catch`: синтетические события в Karma дают `NotFoundError`, а поведение без capture должно быть полноценным. Опция `capture`: pan и resize — да; перетаскивание ноды — нет, чтобы `mouseenter/mouseover` других нод продолжали приходить, когда ноду тянут за drag handle (рецепты drop-target в шаблонах).
3. **Завершение без `pointerup`**: `pointermove` с `buttons === 0` для мыши → `end`; `pointercancel` → `cancel` (браузер забрал жест под скролл или системный жест); `window blur` → `cancel`. `KeyboardService` и минимап уже сбрасывают состояние по `blur`.
4. **Во время жеста** на `document` висят `selectstart` и `dragstart` с `preventDefault` (d3 `nodrag`); `user-select: none` на `:host` остаётся. После сдвига больше порога следующий `click` подавляется capture-listener'ом на `window` (`stopImmediatePropagation` + `preventDefault`, снимается через `setTimeout(0)`; d3 `yesdrag(view, moved)`). Это сохраняет два наблюдаемых поведения: `(click)` в шаблоне ноды не срабатывает после перетаскивания, и клик по pane после pan не доходит до приложения.
5. **Порог** живёт в примитиве: `threshold` в client px; `start` вызывается при первом `pointermove` за порогом (или сразу на `pointerdown` при нуле); `end` не вызывается, если `start` не был. Сегодняшняя ручная активация в `DraggableService` и `afterDragThreshold` в соединениях повторяют одно и то же; соединения переезжают на примитив в этапе B.
6. **Pen = mouse**: `pointerType === 'pen'` идёт по ветке мыши (кнопки, модификаторы). Это новое, d3 обрабатывал перо как mouse-события браузера, так что видимого изменения нет.

### D3. Нативная прокрутка на touch управляется `touch-action`, а не `preventDefault` на `touchmove`

В Pointer Events `preventDefault` на `pointermove` не отменяет скролл: браузер сам решает по `touch-action` на `pointerdown` и при скролле шлёт `pointercancel`. Поэтому:

- `.vflow-pane`: `touch-action: none`, если разрешён touch pan (`panOnDrag !== false`); `pan-x pan-y`, если pan запрещён, а `zoomOnPinch` включён (один палец скроллит страницу, два приходят нам); `auto`, если запрещено и то и другое. Host binding, как в минимапе, а не inline-стиль из d3.
- `.vflow-node` с перетаскиванием: `touch-action: none` через CSS класса; `vflow-node--undraggable` — `auto`. d3-drag тоже ставил `none`, но мы его снимали ради скроллящихся контролов внутри нод.
- `vflowNoDrag`, `vflowNoPan`: `touch-action: auto` на хосте. По спецификации Pointer Events цепочка `touch-action` считается от целевого элемента до ближайшего элемента с собственным default touch behavior (скроллер) включительно, так что собственный скролл `textarea`/`overflow: auto` внутри ноды сохраняется. Прокрутка _страницы_ пальцем из no-pan региона, который сам не скроллер, гарантируется только при `panOnDrag = false`. Это отклонение от сегодняшнего поведения; фактическую картину по браузерам снимает тикет 01, после него формулировка в доке `viewport-gestures` уточняется.
- `data-vflow-no-wheel` не меняется: он про `wheel`, а не про touch.

### D4. Viewport: формулы d3 сохраняются

- **Wheel zoom**: `k' = clamp(k · 2^(−deltaY · (deltaMode === 1 ? 0.05 : deltaMode ? 1 : 0.002) · (ctrlKey ? 10 : 1)), minZoom, maxZoom)` вокруг курсора. Событие, которое не меняет `k` **в начале** жеста, не потребляется (страница скроллит на границе зума, как обещает дока). Wheel-события группируются в один жест с idle 150 ms: один `start`, один `end`.
- **Scroll pan**: как сейчас: `unit` по `deltaMode` (1 → 16 px, 2 → высота pane), сдвиг на `−delta · unit` в client px.
- **Double click / double tap** (два тапа < 500 ms и < 10 px): ×2, `Shift` → ×0.5, вокруг точки, анимация 250 ms (`duration` d3 по умолчанию). Только при `zoomOnDoubleClick`; `filterCondition` как сейчас.
- **Mouse/pen pan**: фильтр как сейчас (`panOnDrag` кнопки, `panActivation`, приоритет `selection`, `allowRootZoomForNodeTarget`, no-pan/no-drag); `x = x0 + Δclient`.
- **Touch**: один палец — pan; два — `k' = k · d1/d0`, сдвиг так, чтобы середина двух flow-точек осталась под серединой двух client-точек (d3 `touchmoved`). Флаги `pan`/`zoom` берутся из настроек до расчёта; сегодняшний пересчёт трансформа через `__zoom` исчезает. Двойной тап уходит в ветку double click.
- **Программные изменения** через `writableViewport` не меняют контракт: `zoomTo` — вокруг центра pane (d3 `scaleTo`), `panTo` — только сдвиг, `viewportTo`/`fitView` — всё. `duration > 0` → анимация `interpolateZoom` + `easeCubicInOut` из текущего состояния. Любой новый вызов или начало жеста прерывает анимацию (d3 `interrupt`). Конец анимации даёт `end`, как `end.zoom` на transition. `duration = 0` (auto-pan каждый кадр, минимап, клавиатура) применяется синхронно, без rAF.
- **События**: `readableViewport.set` на каждом изменении; на `start` запоминается состояние для selection; на `end` в `zone.run`: `triggerViewportChangeEvent('end')` и `selectionService.setViewport({ start, end, target })`. `target` — цель `pointerdown` (для wheel — цель wheel-события). d3 отдавал цель `mouseup`; при capture она всегда была бы pane, а стратегии выделения нужен элемент, по которому нажали (`closest('.selectable')`).
- Слушатели вешаются в `runOutsideAngular`, как сейчас.

`allowRootZoomForNodeTarget` остаётся; проверка типа события меняется на `pointerdown`.

### D5. Перетаскивание нод на примитиве

`DraggableService`: тот же фильтр (primary button без Ctrl, `[data-vflow-no-drag]`, `.vflow-handle` против `.vflow-drag-handle`, только drag handles при `dragHandlesCount > 0`, группа при активном `selection`), тот же кэш геометрии pane, тот же `moveNodesOnAutoPan$`, те же статусы `node-drag-start/node-drag/node-drag-end`. Порог и подавление клика уходят в примитив. `enable/disable/destroy` больше не трогают inline-стили.

### D6. Ресайзер на примитиве

`createResizer` меняет только транспорт. Публичный `ResizeDragEvent` становится `{ sourceEvent: PointerEvent }`: из полей d3 (`x, y, dx, dy, subject, identifier, active`) у потребителя `shouldResize` осмыслен только `sourceEvent`. Порога у ресайза нет и не появляется.

### D7. Зависимости и миграция

- `libs/ngx-vflow/package.json`: удалить `d3-drag`, `d3-selection`, `d3-zoom` и их `@types` из `peerDependencies`. В корне остаются `d3-force` и `@types/d3-force` для cookbook `force`; остальные d3-пакеты и типы удаляются.
- Удалить `declare module 'd3-selection'` из map-context, упоминания «D3» в JSDoc (`panTo`), в доке `viewport-gestures` («An already-started D3 mouse drag…»).
- Страница миграции 3.0: удалить d3-пакеты из зависимостей приложения; `ResizeDragEvent`; тесты приложений, которые диспатчили синтетические `MouseEvent`/`TouchEvent` в `<vflow>`, переводятся на `PointerEvent`.
- Коммит `feat(core)!: replace d3 zoom and drag with pointer gestures` с `BREAKING CHANGE:` футером.

### D8. Проверка формул без d3

Golden-значения для `wheelZoomFactor`, `scaleAbout`, `interpolateZoom` (t = 0, 0.25, 0.5, 0.75, 1 для пары «zoom + сдвиг» и пары «только сдвиг») снимаются с d3 один раз до удаления и кладутся в спеки как константы. d3 не остаётся даже в devDependencies.

### D9. Этап B: единый арбитр pointerdown (после удаления d3)

Оставшиеся mouse/touch слушатели (`RootPointerDirective`, `PointerDirective`, `HandleDirective`, `EdgeComponent`, `ConnectionControllerDirective.afterDragThreshold`) переводятся на Pointer Events, а классификация цели собирается в одном capture-listener `pointerdown` на `.vflow-root`: resize control → handle → drag handle / node → pane. Он запускает ровно один жест, `stopPropagation` из D2.1 становится ненужным, `isTouchEvent`/`eventClientPoint`/`touchMovement$` с `elementFromPoint` уходят, а порог соединения использует тот же примитив. Это окончательно убирает конфликты, но не требуется для удаления d3, поэтому идёт отдельными тикетами после этапа A и может быть отложено.

## Совместимость: что сохраняется

- Все входы `<vflow>`: `panOnDrag` (включая массив кнопок), `panOnScroll`, `zoomOnScroll`, `zoomOnPinch`, `zoomOnDoubleClick`, `minZoom`, `maxZoom`, `paneClickDistance`, `nodeDragThreshold`, `connectionDragThreshold`, `autoPan`, `snapGrid`, `keyboardShortcuts.modifiers.panActivation/zoomActivation/selection`.
- Формулы wheel zoom, scroll pan, double click, pinch; клампинг зума; направление и величина сдвигов.
- `viewport`, `viewportChange$`, `viewportChangeEnd$`, статусы `node-drag-*`, `nodesChanges.position/size`, события ресайза.
- `viewportTo/zoomTo/panTo/fitView` и анимация с `duration` (та же интерполяция и easing, что у d3).
- Директивы `vflowNoDrag`, `vflowNoPan`, `vflowNoWheel`; классы `vflow-node--undraggable`, `vflow-node--drag-handles-only`, `.vflow-drag-handle`, `.vflow-handle`.
- Подавление `click` после перетаскивания/панорамирования; выбор по `mousedown`; deselect по клику в pane.
- Правила выбора набора перетаскиваемых нод и `extent: 'parent'`.

## Что ломается

- Peer-зависимости d3 удалены; приложение может удалить пакеты.
- `ResizeDragEvent` — свой тип `{ sourceEvent: PointerEvent }`.
- Библиотека реагирует на Pointer Events; синтетические `MouseEvent`/`TouchEvent` в тестах приложений больше не запускают жесты.
- `touch-action` на pane и нодах задаёт библиотека (D3); прокрутка страницы пальцем из no-pan региона, не являющегося скроллером, при включённом touch pan не гарантируется.
- Во время pan pane держит pointer capture: `mouseover/mouseenter` на нодах, проезжающих под курсором, не приходят до `pointerup`.
- `target` в `ViewportForSelection` — цель `pointerdown`, а не `mouseup` (внутренний тип, виден в моках).

## Нерешённое, закрывается тикетом 01

- Фактическое поведение `touch-action` в цепочке «нода `none` → вложенный скроллер `auto`» в Chrome, Firefox, Safari macOS и iOS Safari.
- Компат-`mousedown` после `stopPropagation` на `pointerdown` в тех же браузерах.
- `setPointerCapture` с синтетическим `pointerId` в Karma/Chrome и в Playwright.

## Проверка

- Юнит: `gestures/*` (goldens D8, порог, подавление клика, `pointercancel`, `blur`, `buttons === 0`, два указателя), переписанные `viewport-gestures.spec.ts` и `draggable.service.spec.ts`, спеки ресайзера, `allow-root-zoom-for-node-target`.
- E2E (docs-e2e, Chromium): pan мышью и колесом, wheel zoom вокруг курсора, dblclick zoom, drag ноды с порогом, ресайз, touch pan/pinch через CDP `Input.dispatchTouchEvent`, `fitView({ duration })` доходит до цели и прерывается жестом; регресс существующих сьютов (`resizer`, `minimap-navigation`, `keyboard-shortcuts`, `easy-connect`, `stress-rendering`).
- Сборка `nx build ngx-vflow` без d3 в графе; `npm ls d3-zoom` пуст.

## Порядок

Этап A: 01 → 02, 03 (параллельно) → 04, 05, 06 (параллельно, 04 ждёт 01–03; 05 ждёт 01, 03; 06 ждёт 03) → 07 → 08.
Этап B: 09 после 08.

## Отклонения при реализации (2026-09-26)

- Pointer capture берётся при первом сдвиге, а не на `pointerdown` (D2.2): иначе клик без сдвига по ребру уходил бы на pane.
- `touch-action: auto` на `vflowNoDrag`/`vflowNoPan` не нужен (D3): скроллер внутри ноды скроллится при `none` у предков, а не-скроллер не скроллит страницу в любом случае.
- Pinch без pan масштабирует вокруг середины пальцев на момент начала pinch, а не вокруг середины предыдущего события (D4): при покадровых `pointermove` по пальцам центр иначе уплывает.
- Вместо capture-арбитра на root (D9) одна таблица `utils/press-target.ts`, которой пользуются все участники; мост compat-событий оставлен как контракт поглощения нажатия.
- Для e2e добавлено демо на странице viewport-gestures.
