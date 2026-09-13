# 02. Рендер компонентов через `createComponent`, `injectNode()`, события через `reflectComponentType`

Status: resolved
Type: task
Blocked by: 01

Реализовать D3 из `spec.md` для нод.

- Новая внутренняя директива `[entityComponentOutlet]` (`directives/entity-component-outlet.directive.ts`):
  входы `component` (класс или фабрика), `hostElement?`, `injector`; резолв фабрики по `shouldLoad`
  (перенести логику `componentInstance$`); `createComponent` + `viewContainerRef.insert`;
  подписка на `reflectComponentType(type).outputs` через `instance[propName].subscribe`; отписка и
  `destroy` при смене компонента и при уничтожении.
- Токен `NODE_REF` и функция `injectNode<T>()` (`interfaces/node-ref.interface.ts` или рядом с
  контекстом). `NodeComponent` предоставляет токен значением `model().context.$implicit`.
- Шина: `ComponentEventBusService` получает `pushNodeEvent`; `eventName` = `templateName` output.
  `component-node-event.interface.ts`: `ComponentNodeEvent<T extends unknown[]>` по объявленным
  output; `CustomNodeComponent` из generic убрать.
- Удалить `public-components/custom-node/custom-node.component.ts`, `utils/is-vflow-component.ts`;
  из `public-api.ts` убрать экспорт `CustomNodeComponent`.
- `node.component.html`: заменить `ngComponentOutlet` на `entityComponentOutlet`.
- Спеки: outlet с `@Output`, `output()`, `outputFromObservable`; отписка; `injectNode()` внутри
  компонента и внутри шаблона через `ngTemplateOutletInjector`; ленивая фабрика.

Файлы: `libs/ngx-vflow/src/lib/vflow/directives/`, `services/component-event-bus.service.ts`,
`interfaces/component-node-event.interface.ts`, `components/node/node.component.*`,
`models/node.model.ts` (убрать `componentInstance$`, `componentTypeInputs`, `isComponentType`),
`public-api.ts`.

## Answer

Сделано 2026-09-13.

- `EntityComponentOutletDirective` (`ng-container[entityComponentOutlet]`) создаёт компонент через
  `ViewContainerRef.createComponent`, сама разрешает ленивую фабрику, когда нода должна загрузиться, и
  отбрасывает результат устаревшей фабрики. Для каждого output из `reflectComponentType(type).outputs`
  подписывается на свойство экземпляра и пересылает `{ eventName, eventPayload }`; подписки снимаются при
  смене компонента и уничтожении.
- `NODE_REF`, `NodeRef<T>` и `injectNode<T>()` публичные. `NodeComponent` провайдит токен тем же объектом,
  что получает `ng-template[node]` через `let-ctx`; `NodeContext` теперь `{ $implicit: NodeRef }`.
- `NodeComponent` пересылает события компонента в `ComponentEventBusService` с `nodeId`.
  `ComponentNodeEvent<T extends object[]>` больше не требует базового класса.
- Удалены `CustomNodeComponent`, `isCustomNodeComponent`, `NodeModel.componentInstance$`,
  `componentTypeInputs`, `isComponentType`. Решение «класс или фабрика» вынесено в `isComponentClass`.
- `provideCustomNodeMocks` провайдит `NODE_REF` из мок-модели.
- Docs: 13 компонентов нод переведены на `injectNode()` без наследования, сниппет страницы
  «Unit testing component nodes» обновлён. Остальные тексты markdown про `CustomNodeComponent` остаются
  тикету 07.

Решение при реализации: `eventName` это имя свойства output, а не алиас, чтобы совпадать с ключами
типа `ComponentNodeEvent`. Записано в `spec.md`.

Проверки: typecheck библиотеки, спек и docs; eslint и prettier; `nx build ngx-vflow`; `nx build docs`;
`consumer:check`; юнит-тесты библиотеки 236/236, docs 1/1. Новые спеки: outlet (класс и фабрика без
базового класса, контекст в компоненте и в шаблоне, все виды output с именем свойства, отписка после
удаления ноды, фабрика с `lazyLoadTrigger: 'viewport'`) и `provideCustomNodeMocks` с `injectNode()`.
В браузере: Delete в тулбаре transform-ноды на overview удаляет ноду через событие компонента; клики по
квадратам на custom-nodes показывают уведомления; lazy-loading загружает только `node-a` в viewport;
stress-test 1024/1024 нод и 1023/1023 рёбер; ошибок в консоли нет.

e2e docs: 31/32. Падает `virtualization demo retains node DOM and geometry through viewport pan` на
ожидании 4900 нод за 5 с. Это не регрессия: A/B холодной загрузки страницы показал одинаковое время до
4900 нод на `13b270f4` (медиана 4460 мс), `919c2cfd` (4414 мс) и текущем состоянии (4390 мс). Порог теста
в dev-режиме на грани при любом коде.
