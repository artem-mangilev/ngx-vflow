# 03. Контролы и inline размер на резайзабельном элементе

Status: resolved
Type: task
Blocked by: 01

Решение D3 из `spec.md`.

- `ResizableComponent`: host bindings `box-sizing: border-box`, `[style.width.px]`/`[style.height.px]` при `sizeMode() === 'explicit'`; контролы под `@if (enabled())` внутри регистрируемого шаблона.
- `NodeComponent`: контролы по-прежнему рендерятся из `resizerTemplate` в слое ноды (см. отклонение в D3); inline размер `.wrapper` только в `explicit` без резайзабельного элемента. Удалить `controlledByResizer` и `resizable` из `NodeModel`; снимать шаблон с модели при уничтожении элемента.
- Убедиться, что контролы по-прежнему не запускают drag ноды и selection, и что `autoScale` с zoom работает внутри элемента с возможным `transform`.
- Спеки: `resizable.component.spec` (gap/autoScale остаются), новые: inline размер только в `explicit`, border-box на хосте.

Файлы: `public-components/resizable/*`, `components/node/node.component.{html,scss}`, `models/node.model.ts`, `testing/src/component-mocks/resizable-mock.component.ts`.

## Answer

Сделано с отклонением от первоначальной формулировки, зафиксированным в D3 `spec.md`: контролы остаются в слое ноды, потому что карточки с `overflow: hidden` обрезали бы их.

- `ResizableComponent`: в режиме `explicit` хост получает inline `width`/`height` и `box-sizing: border-box`; контролы под `@if (enabled())`; при уничтожении элемент снимает свой шаблон с модели, только если тот ещё зарегистрирован.
- `NodeComponent.wrapperSize`: `.wrapper` получает размер только в `explicit` без резайзабельного элемента.
- `NodeModel`: удалены `resizable` и `controlledByResizer`; `resizerTemplate` документирован как носитель размера.
- Спеки в `resizable.component.spec.ts` (блок `size target`): auto-нода без inline размера, explicit размер как border-box на элементе, переход после коммита ресайзера, контролы вне клипующего элемента, размер на `.wrapper` без `[resizable]`, возврат размера на `.wrapper` при уничтожении элемента.

Проверки: библиотека 225/225, lint, typecheck lib/docs/consumer. В браузере на Overview перетаскивание угла на +60/+48 при zoom 1 дало карточку 431x368 из 371x320, inline размер на карточке, рамка контролов совпадает. Демо Resizer: `.custom-node` 150x100 без inline размера, группа 170x70 на своём элементе. Мок в `ngx-vflow/testing` менять не пришлось: новые члены защищённые.
