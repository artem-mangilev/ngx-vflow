# 06. `@vflow/ui`: `vflowPort` читает состояние из `VflowHandle`

Status: resolved
Type: task
Blocked by: 05

- `libs/ui/src/lib/port.directive.ts`: `inject(VflowHandleDirective, { self: true, optional: true })`;
  `data-state` берётся из `vflowPortState()` если задан явно, иначе из `handle.state()`;
  `vflowPortConnected` без изменений. Добавить зависимость `@vflow/ui` от `ngx-vflow` (peer).
- Убедиться, что размеры `vui:size-3.5` дают hit-area; описать в README ui.
- Спека: `vflowPort` на элементе с `[vflowHandle]` меняет `data-state` при смене `state`.

Файлы: `libs/ui/src/lib/port.directive.ts`, `libs/ui/package.json`, `libs/ui/README.md`.

## Answer

Сделано 2026-09-15 в рамках 05. `vflowPort` инжектит `HANDLE_REF` (`optional`, без `self`, чтобы порт внутри
шаблона компонента-handle тоже находил его); `data-state` берётся из `vflowPortState()`, если он задан, иначе из
`handle.state()`, иначе `idle`. Peer-зависимость `@vflow/ui` от `ngx-vflow` уже была. README обновлён. Отдельной
юнит-спеки нет, потому что у `@vflow/ui` нет test target: смену `data-state` на `valid`/`invalid` проверяют
e2e design-system (entities и pipeline), они зелёные.

2026-09-15, пересмотрено: `VflowPort` больше не инжектит `HANDLE_REF` предка, а сам является handle через
`hostDirectives: [VflowHandleDirective]` (тип `vflowPort="target"`, остальные входы handle проброшены) и читает
`state` директивы на своём элементе. `vflowPortState` остаётся override.
`HANDLE_REF` удалён в тот же день: `VflowPort` инжектит `VflowHandleDirective` со своего элемента.
