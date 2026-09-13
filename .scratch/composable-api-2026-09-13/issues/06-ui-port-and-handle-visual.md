# 06. `@vflow/ui`: `vflowPort` читает состояние из `VflowHandle`

Status: ready-for-agent
Type: task
Blocked by: 05

- `libs/ui/src/lib/port.directive.ts`: `inject(VflowHandleDirective, { self: true, optional: true })`;
  `data-state` берётся из `vflowPortState()` если задан явно, иначе из `handle.state()`;
  `vflowPortConnected` без изменений. Добавить зависимость `@vflow/ui` от `ngx-vflow` (peer).
- Убедиться, что размеры `vui:size-3.5` дают hit-area; описать в README ui.
- Спека: `vflowPort` на элементе с `[vflowHandle]` меняет `data-state` при смене `state`.

Файлы: `libs/ui/src/lib/port.directive.ts`, `libs/ui/package.json`, `libs/ui/README.md`.
