# 04. Component harnesses на `@angular/cdk/testing`

Status: needs-triage
Type: task
Blocked by: —

## Проблема

После удаления моков у потребителя нет API для действий в тесте. Он пишет pointer-события руками и должен знать, что между нажатием и отпусканием нужен `whenStable()` (тикет 03). Angular рекомендует авторам библиотек harness'ы: они работают в TestBed (любой DOM) и в e2e.

## Что мешает сделать сразу

Harness'у нужен DOM-контракт, которого нет:

- у `.v-node` и ребра нет id сущности в DOM;
- у выбранного узла или ребра нет маркера в DOM (состояние только в контексте презентации);
- у `[vHandle]` нет `handleId` в `data-v-handle-*` (есть type, position, state).

Migration guide сейчас говорит, что приватные элементы и вложенность — не контракт.

## Решить

- **DOM-контракт:** `data-v-node-id`, `data-v-edge-id`, `data-v-selected`, `data-v-handle-id`. Ограничение из расследования pan/zoom: никаких чтений сигналов в host bindings сущностей — атрибуты писать из effect'ов.
- **Набор:** `VflowHarness`, `VflowNodeHarness`, `VflowEdgeHarness`, `VflowHandleHarness`.
- **Действия:** `getNodes({ id })`, `node.select()`, `handle.connectTo(other)`, `edge.select()`, `getViewport()`. `node.dragBy()` — только если работает без layout, иначе документировать как browser-only.
- **Зависимость:** core уже импортирует `@angular/cdk/a11y`, но `@angular/cdk` нет в `peerDependencies` `libs/ngx-vflow/package.json` — проверить отдельно от harness'ов.
- **Entry point:** вернуть `ngx-vflow/testing` только с harness'ами.
