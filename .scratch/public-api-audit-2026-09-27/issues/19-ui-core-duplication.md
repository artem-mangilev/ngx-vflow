# 19. `@vflow/ui`: убрать дублирование с core

Status: needs-triage
Type: task
Priority: P2
Blocked by: 12

Отчёт: 3.9, 4.1, 4.5, 4.8. Пути — от `libs/ui/src/lib/`.

## Проблема

- **`[vflowSelected]` повторяет core.** Он дублирует `selected`/`preselected` из `NODE_REF`/`EDGE_REF`; пара `selectable` + `[vflowSelected]="ctx.selected() || ctx.preselected()"` встречается 38 раз в docs и consumer.
- **`vflowPortState` дублирует атрибут core.** Он пишет `data-state`, который повторяет `data-vflow-handle-state` и может с ним разойтись (`port.directive.ts:31,41`). ADR-0007 отказался от непрефиксного `data-state`.
- **`VflowControls`:**
  - сам ограничивает zoom (`controls.component.ts:104-106`) и дублирует шаг 1.2 клавиатуры, но не объявляет zoom в live region;
  - получает flow через `[flow]` + `@if (flow(); as flow)`, тогда как миникарта — через DI внутри `vflow`;
  - `labels` принимает только полный объект, а core `ariaLabelConfig` — `Partial`.
- **Data-атрибуты:** `data-vui-theme` и `data-vui-selected` с префиксом; `data-tone`, `data-busy`, `data-state`, `data-connected`, `data-event`, `data-gateway` и `data-flow` — без.
- **Селекторы.** `vflow*` делит пространство имён с core (`vflowNode` рядом с `vflowNoDrag`), а CSS-классы — `.vui-*`.
- **Типы BPMN.** Виды (`'start' | …`) — инлайн-юнионы без экспорта, тогда как `VflowTone` экспортирован.
- **Состояния без эффекта:**
  - `VflowSelected` ничего не меняет на field, edge label, port и toolbar;
  - порт не отражает `canStart=false`/`canAccept=false`.

## Решить

- **`VflowSelected`:** по умолчанию берёт состояние из `NODE_REF`/`EDGE_REF`. Зависит от модели выбора (тикет 12).
- **`vflowPortState`:** удалить вместе с `data-state` и стилизовать по `data-vflow-handle-state`.
- **`VflowControls`:**
  - делегировать в core (`zoomIn`/`zoomOut`, если появятся в тикете 02);
  - объявлять zoom;
  - получать flow через DI, если контрол стоит внутри `vflow`;
  - `labels` сделать `Partial`.
- **Префиксы:** селекторы `vui*` или `vflow*` — согласовать с тикетом 09; data-атрибуты — все `data-vui-*`.
