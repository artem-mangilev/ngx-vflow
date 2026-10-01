# 02. Форма viewport API: `duration`, центрирование, один метод записи

Status: needs-triage
Type: task
Priority: P1 (до 3.0)
Blocked by: 01

Отчёт: 1.2 (`duration`), 2.5 (`panTo`), 3.2. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- `viewportTo(state)`, `zoomTo(zoom)` и `panTo(translation)` — три метода над одним `Partial<ViewportState>`. В них зашит `duration: 0`: анимировать можно только `fitView({ duration })`.
- `panTo(point)` принимает сдвиг viewport, а не точку графа. Об этом предупреждает собственный JSDoc метода (`components/vflow/vflow.component.ts:600-606`). Центрировать на точке или узле графа нечем.
- Публичный `fitView()` возвращает `void`, хотя сервис знает, применилось ли изменение (`services/viewport.service.ts:47`).

Методы почти не используются, поэтому ломать дёшево. В `apps` вызовов нет. В `libs` есть только `VflowControls.zoomTo` (`libs/ui/src/lib/controls.component.ts:106`) и мок (`libs/ngx-vflow/testing/src/component-mocks/vflow-mock.component.ts:205-215`).

## Решить

- **Вариант A (не ломает):** оставить три метода, добавить каждому `options?: { duration?: number }`, добавить `setCenter(flowPoint, { zoom?, duration? })`.
- **Вариант B (рекомендую):**
  - `setViewport(partial, { duration? })`;
  - `setCenter(flowPoint, { zoom?, duration? })`;
  - `zoomTo(zoom, { duration? })`;
  - `fitView(options)`;
  - `viewportTo` и `panTo` удалить.
- **Дополнительно:**
  - `zoomIn()`/`zoomOut()` с шагом клавиатуры (`ZOOM_STEP`, `services/keyboard-viewport-commands.service.ts`); сейчас это реализует `VflowControls`;
  - `fitView()` возвращает `boolean`.

## Сделать после решения

- `components/vflow/vflow.component.ts`, мок `VflowMockComponent`, `libs/ui/src/lib/controls.component.ts` (убрать собственный clamp: core ограничивает zoom после тикета 01).
- Docs: `apps/docs/src/app/categories/interactions/pages/viewport-gestures/index.md:107`, migration guide (Removed APIs), страница API компонента.
- spec: `duration` анимирует; `setCenter` ставит точку графа в центр pane при текущем и заданном zoom.
