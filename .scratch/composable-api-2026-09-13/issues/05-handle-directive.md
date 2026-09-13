# 05. `[vflowHandle]` вместо `<handle>`

Status: ready-for-agent
Type: task
Blocked by: 01

Реализовать D5 из `spec.md` в core.

- `directives/handle.directive.ts`: `VflowHandleDirective`, селектор `[vflowHandle]`, `exportAs:
'vflowHandle'`; входы по D5; `hostDirectives: [EntityAccessibilityDirective, PointerDirective]`
  или явные host-listeners; регистрация `HandleModel` через `HandleService`; публичные сигналы
  `state`, `canStart`, `canAccept`, `type`, `position`.
- `models/handle.model.ts`: `hostReference` и `handleElement` → одно поле `element`; `measure`
  берёт центр `element` и его размер; `NodeHandle.template` удалить.
- `layout: 'auto'`: host-стили `position: absolute`, `top/left/right/bottom` из `layoutStyles`,
  `transform` по стороне с учётом `offsetX/offsetY` (перенести из `handle.component.scss` в
  host-биндинги или глобальный css класса `vflow-handle--<side>`); якорь это родитель host.
  `layout: 'manual'`: стили не пишутся.
- Магнит: `NodeComponent` рендерит `@for (handle of model().handles())` невидимую зону в слое ноды по
  `localPoint`, с теми же pointer-обработчиками, что сейчас в `handle.component.html`. Логика
  `validateConnection`/`endConnection` переезжает в директиву/контроллер ноды.
- `directives/node-handles-controller.directive.ts`: наблюдать `handle.element` (и родителя в `auto`).
- Dev-warning при первом измерении, если `element.getClientRects().length === 0`.
- Удалить `public-components/handle/*`, `HandleTemplateDirective`, `HandleContext`; обновить
  `vflow.ts`, `public-api.ts`, `testing/component-mocks/handle-mock.component.ts` → директива-мок.
- Спеки: `initial-handles.spec.ts` на директиве; `auto` и `manual`; `display: none` не измеряется;
  `visibility: hidden` измеряется; магнит появляется при активном соединении.

Файлы: `libs/ngx-vflow/src/lib/vflow/directives/handle.directive.ts`, `models/handle.model.ts`,
`services/handle.service.ts`, `directives/node-handles-controller.directive.ts`,
`components/node/node.component.*`, `public-components/handle/` (удалить), `testing/`.
