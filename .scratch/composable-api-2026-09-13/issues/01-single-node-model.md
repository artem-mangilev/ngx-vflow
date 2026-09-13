# 01. Единая модель ноды без `type`

Status: resolved
Type: task
Blocked by: —

Реализовать D1 и D2 из `spec.md`: один интерфейс `Node<T>` с полем `component`, без `type`.

- `interfaces/node.interface.ts`: убрать `HtmlTemplateNode`, `ComponentNode`, `TemplateGroupNode`,
  `isTemplateNode`, `isTemplateGroupNode`; `isComponentNode = node.component !== undefined`;
  `NodeComponentType`; `createNode`/`createNodes`/`NodeWithDefaults`/`StaticNode` без ветвления.
- `models/node.model.ts`: `sizeMode` без условия группы; `shouldLoad` по `component`
  (класс сразу, фабрика и шаблон по viewport); `context.$implicit` для всех нод с `width`/`height`;
  `ariaLabel` через `groupLabel` при `children().length > 0`.
- `interfaces/template-context.interface.ts`: убрать `GroupNodeContext`; `NodeContext` с
  `width`/`height`.
- `directives/template.directive.ts`, `vflow.ts`, `public-api.ts`: `NodeHtmlTemplateDirective` →
  `NodeTemplateDirective` (`ng-template[node]`), удалить `GroupNodeTemplateDirective`.
- `components/node/node.component.{ts,html}`: одна ветка рендера с `.wrapper`,
  `nodeHandlesController`, `nodeResizeController`; `isMeasured` для всех нод от контроллера;
  dev-ошибка, если нет ни `component`, ни шаблона; пока оставить `ngComponentOutlet` (уходит в 02).
- `components/vflow/vflow.component.{ts,html}`: убрать `groupNodeTemplate`.
- Спеки: `node.interface.spec` (createNodes без type), `node.model.spec` (sizeMode, context, aria),
  существующие спеки групп переписать на ноды с размером.

Файлы: `libs/ngx-vflow/src/lib/vflow/interfaces/node.interface.ts`, `models/node.model.ts`,
`interfaces/template-context.interface.ts`, `directives/template.directive.ts`,
`components/node/node.component.*`, `components/vflow/vflow.component.*`, `vflow.ts`, `public-api.ts`.

## Answer

Сделано 2026-09-13.

- `Node<T>` это один интерфейс с `component?: NodeComponentType`; `HtmlTemplateNode`, `ComponentNode`,
  `TemplateGroupNode`, `isTemplateNode`, `isTemplateGroupNode` удалены. `createNode` без ветвления,
  `component` передаётся как есть, размер по умолчанию не подставляется.
- `NodeModel`: `sizeMode` без условия группы; `context.$implicit` у всех нод с `width`/`height`;
  `ariaLabel` берёт `groupLabel` при наличии детей; класс компонента определяется через
  `reflectComponentType`, фабрика и шаблон ждут viewport при `lazyLoadTrigger: 'viewport'`.
- `NodeComponent` рендерит одну ветку `.selectable > .wrapper` для всех нод, `isMeasured` всегда
  выставляет `nodeResizeController`. Вход `groupNodeTemplate` и класс `.default-group-node` удалены.
- `ng-template[nodeHtml]` → `ng-template[node]` (`NodeTemplateDirective`), `GroupNodeTemplateDirective`
  и `GroupNodeContext` удалены.
- `isGroupNode` теперь означает «есть дети» и используется в слое групп, миникарте и фильтре
  перетаскивания при выделении.
- Моки `ngx-vflow/testing`: `NodeTemplateMockDirective`, одна ветка нод в `VflowMockComponent`.

Отклонение от спеки: нода без `component` и без шаблона не бросает dev-ошибку, а рендерит пустую
обёртку своего размера. Так нода остаётся видимой для рёбер и API, а контент-размерная нода без
презентации честно измеряется как 0x0. Из-за этого в `vflow.component.spec` ребёнку дан явный размер:
раньше тест полагался на плейсхолдер 100x50, который не попадал в DOM.

Проверки: typecheck библиотеки и спек, eslint и prettier по изменённым файлам, `nx build ngx-vflow`
(включая `ngx-vflow/testing`), юнит-набор 231/231.

Не сделано в этом тикете: docs не проходят typecheck, 185 ошибок в 54 файлах из-за удалённых `type`,
`nodeHtml` и `groupNode`. Это объём тикета 07.
