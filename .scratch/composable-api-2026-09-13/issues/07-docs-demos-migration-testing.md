# 07. Docs, демо, migration guide, тестовые моки, CONTEXT.md

Status: ready-for-agent
Type: task
Blocked by: 04, 06

- `apps/docs/src/app/shared/flow-presentations.ts`: `DocsGroupComponent` сливается в `DocsNodeComponent`
  веткой по `ctx.data().type === 'group'`; `docs-edge` объявляет `<ng-template edgeLabel
position="center">` с `ctx.data().label`; удалить `DocsEdgeLabelComponent`; handle через
  `<span vflowHandle="…" position="…" vflowPort>`.
- Все демо (список файлов в `grep -rl "groupNode\|nodeHtml\|edgeLabelHtml\|<handle\|template-group\|html-template\|CustomNodeComponent\|customTemplateEdge" apps/docs/src`):
  убрать `type`, `groupNode`, `edgeLabelHtml`; `nodeHtml` → `node`; `edgeLabels` → `data.label`;
  компонентные ноды Overview и custom-nodes без базового класса, с `injectNode()`.
- Новые/обновлённые страницы: `nodes/custom-nodes` (component, injectNode, componentNodeEvent через
  output), `edges` (компонентное ребро, `componentEdgeEvent`, лейблы внутри ребра), `handles`
  (директива, `layout`, скрытый handle), `nodes/subflows` (группа это нода с размером).
- `introduction/pages/migration/index.md`: раздел 3.0 по списку «Что ломается» из `spec.md`.
- `CONTEXT.md`: убрать упоминания group node, добавить «Handle» и «Лейбл ребра» по терминам спеки.
- `libs/ngx-vflow/testing`: `template-mock.directive.ts` (`node`, `edge`, `edgeLabel`,
  `connection`), `vflow-mock.component.ts` (одна ветка нод, слой лейблов по `edgeLabel`-шаблонам),
  `handle-mock`, `custom-edge-mock`, `provide-custom-node-mocks.ts`; `all-mocks.spec.ts`.
- ADR: новый `docs/adr/0007-composable-entity-presentation.md` с решениями D1–D6 и отвергнутыми
  альтернативами из `report.md`.

## Comments

2026-09-13, после тикета 01, для промежуточной проверки уже сделано:

- `docs-node` рисует контейнер для `data.type === 'group'`; `DocsGroupComponent` удалён.
- Во всех демо docs и в `apps/consumer`: убран `type` у нод, `nodeHtml` → `node`, шаблоны `groupNode`
  слиты в шаблон ноды, компоненты и фабрики переданы через `component`, группы помечены
  `data: { type: 'group' }`; relationships и bpmn ветвятся по `kind`; drag-and-drop определяет группу
  по данным.
- ng-doc падает на инлайн-коде `node.<поле>`, потому что `Node` стал интерфейсом с членами-ключевыми
  словами: убраны `node.id` в JSDoc `getNodesBounds` и `node.width?.()` в migration.

Осталось в этом тикете: тексты markdown (custom-nodes, default-nodes, subflows, resizer, migration,
lazy-loading, accessibility, design-system) ещё описывают `html-template`, `template-group`,
`nodeHtml` и `groupNode`; всё, что относится к тикетам 02–06.

Проверки промежуточного состояния (2026-09-13): typecheck приложения и спек docs, eslint и prettier
изменённых файлов, `nx build docs`, `consumer:check`, юнит-тесты docs 1/1, e2e docs 32/32. В браузере
на overview, custom-nodes, subflows, resizer, accessibility, minimap, lazy-loading, stress-test,
drag-and-drop, relationships и bpmn все ноды и рёбра видимы, размеры групп совпадают с данными,
ошибок в консоли нет.
