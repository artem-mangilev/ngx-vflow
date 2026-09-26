# 06. Ресайзер на примитиве и тип ResizeDragEvent

Status: resolved
Type: task
Blocked by: 03

`public-components/resizable/resizer.ts` по D6: `createPointerDrag(domNode, { capture: true, threshold: () => 0, ... })`; `update()` пересоздаёт жест (сегодня — `selection.call(dragHandler)` поверх старого; проверить, что старый снимается через `destroy` прежнего примитива).

- `resizer-types.ts`: `export interface ResizeDragEvent { sourceEvent: PointerEvent }`; удалить импорт `d3-drag`. Колбэки `OnResizeStart/OnResize/OnResizeEnd/ShouldResize` без изменений в сигнатуре.
- `clientFromEvent`/`getPointerPosition`: принимать `PointerEvent`.
- `resizable.component.ts`: JSDoc «d3-drag based resize engine» → без d3.
- Спеки ресайзера: диспатчить `PointerEvent`; убедиться, что `data-vflow-no-drag` на контроле по-прежнему не даёт ноде начать drag (фильтр в 05) и что клик по контролу без сдвига не меняет `sizeMode` (D1 спеки resizer-size-model).

Документация `nodes/resizer`: если упоминается тип события в `shouldResize` — обновить.

## Answer

Сделано: `createResizer` держит один примитив на всё время жизни, `update()` меняет параметры следующего жеста, жест в процессе держит свои (как d3, где активный жест жил в старом замыкании). `ResizeDragEvent = { sourceEvent: PointerEvent }`. Спеки ресайзера и регрессий переведены на Pointer Events; e2e `resizer.spec.ts` проходит без изменений.
