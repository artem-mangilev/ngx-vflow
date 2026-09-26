# 05. DraggableService на примитиве

Status: resolved
Type: task
Blocked by: 01, 03

`services/draggable.service.ts` по D5: заменить `drag()`/`select()` на `createPointerDrag(element, { capture: false, threshold: () => settings.nodeDragThreshold(), filter: filterCondition, ... })`.

- Удалить ручной `activate()`/`threshold`/`clickDistance` — примитив вызывает `onStart` после порога; `startEvent` = `ctx.sourceEvent` первого события.
- Сохранить: `filterCondition` целиком (проверка `event.button !== 0 || event.ctrlKey` для `pointerType !== 'touch'`), `getDragNodes`, `moveNode`, `alignToGrid`, кэш геометрии pane (`startTrackingPaneGeometry`), `moveNodesOnAutoPan$`, статусы.
- `enable/disable/destroy`: хранить `{ destroy }` примитива в `WeakMap<Element, …>`; никаких `style('touch-action')`/`-webkit-tap-highlight-color`.
- CSS: `.vflow-node { touch-action: none }`, `.vflow-node--undraggable { touch-action: auto }` в стилях ноды; `NoDragDirective`/`NoPanDirective` получают host binding `[style.touch-action]="'auto'"` (уточнить формулировку по итогу тикета 01).
- `utils/event.ts`: `eventClientPoint` принимает `PointerEvent`; `isTouchEvent` остаётся до этапа B для соединений.

Переписать `draggable.service.spec.ts`: `PointerEvent` вместо `MouseEvent`; названия тестов «(d3-drag default)» → «(primary button only)»; добавить: `click` подавляется после сдвига и не подавляется без; `pointercancel`/`blur` завершают drag как `end` (статус `node-drag-end`, без отката позиций, как у d3 при потере `mouseup`).

## Answer

Сделано: `DraggableService` на `createPointerDrag`, фильтр вынесен в `dragFilter(model)`; `enable/disable/destroy` не трогают inline-стили. CSS: `:host { touch-action: none }` у ноды, `auto` у `--undraggable` и `--drag-handles-only`; `.vflow-handle`, `.vflow-drag-handle`, `.reconnect-handle`, `.resize-control` получают `none` в стилях `vflow`. Host binding `touch-action` на `vflowNoDrag`/`vflowNoPan` не добавлен: по итогу тикета 01 он ничего не меняет, скроллер внутри ноды скроллится и без него. `pointercancel`/`blur` завершают drag как `end` без отката. Спека переписана, добавлены клики, отмена и потерянный `mouseup`.
