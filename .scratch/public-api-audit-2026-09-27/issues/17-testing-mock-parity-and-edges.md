# 17. `ngx-vflow/testing`: паритет моков и component edges

Status: needs-triage
Type: task
Priority: P2
Blocked by: 16

Отчёт: 1.7. Пути — от `libs/ngx-vflow/testing/src/`.

## Проблема

- **Нет host-directive outputs у `VflowMockComponent`.** `(nodesChanges*)`, `(edgesChanges*)` и `(nodeDrag*)` компилируются и молча становятся DOM-listener'ами. `AsInterface<VflowComponent>` этого не ловит: outputs host directives — не члены класса. Тикет 07 добавляет в мок `(nodesChanges*)` и `(edgesChanges*)`; после него остаются `(nodeDrag*)`.
- **Мок рендерит сущности не так, как реальный компонент:**
  - узлы с `component` не рендерятся (`component-mocks/vflow-mock.component.ts:49`);
  - рёбра с `component` рендерятся через `ng-template[edge]` (66-81);
  - содержимое `ng-template[node]` не получает `NODE_REF`, поэтому `injectNode()` в дочернем компоненте падает;
  - в edge-контексте нет `preselected` и `shouldLoad`.
- **Component edges не тестируются.** Нет `EDGE_REF` и `EdgeComponent`, поэтому `injectEdge()`, `hostDirectives: [EdgeInteractionDirective]` и `*edgeLabel` падают с NG0201.
- **`provideCustomNodeMocks()` без аргументов.**
  - `injectNode()` всегда отдаёт узел `'mock'`.
  - Для `NODE_REF`, `NodeAccessorService` и `HandleService` создаются три разных `NodeModel`.
- **Неполные моки директив:**
  - нет моков `vflowNo*` — `VflowMocks` не надмножество `Vflow`;
  - у `HandleMockDirective` нет host-атрибутов `data-vflow-handle-*`;
  - у `NodeToolbarMockComponent` нет `data-position` и `NoDrag`.

## Решить

- **Host directives:** мок повторяет их у реального `vflow`, с учётом решений 05 и 07.
- **Провайдеры:** `provideCustomEdgeMocks()` для компонентов рёбер; `provideCustomNodeMocks({ node })` с узлом теста.
- **Рендеринг:** мок рендерит component-узлы и рёбра (ближе к реальности) или честно документирует ограничение.
- **Docs:** страницы testing — сейчас там «mocks for every public component».

Связано: набор моков меняют тикеты 05, 07, 08, 09.
