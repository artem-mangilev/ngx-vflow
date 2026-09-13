# 02. Рендер компонентов через `createComponent`, `injectNode()`, события через `reflectComponentType`

Status: ready-for-agent
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
