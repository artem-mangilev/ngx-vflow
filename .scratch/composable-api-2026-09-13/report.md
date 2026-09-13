# Обсуждение API 3.0 и сравнение с другими библиотеками

Дата: 2026-09-13. Итог обсуждения зафиксирован в `spec.md`.

## Что было

- `Node` это union `html-template | template-group | ComponentNode` с дискриминантом `type`; для
  компонентов в то же поле кладётся класс или ленивая фабрика.
- Компонентная нода обязана наследовать `CustomNodeComponent`; события собираются сканированием
  полей инстанса (`Object.getOwnPropertyNames`) на `EventEmitter`/`OutputEmitterRef`, поэтому
  `outputFromObservable` не виден, а `(componentNodeEvent)` типизирован как `any`.
- Рёбра только шаблоном `ng-template[edge]` внутри библиотечного `<svg edge>`.
- Handle это компонент `<handle>` с обёрткой, которую библиотека позиционирует абсолютно от центра
  родителя; визуал через `[template]` и `HandleContext`; магнит рендерится соседним `div`.
- Лейблы ребра: карта `edge.edgeLabels` в данных + один глобальный шаблон `ng-template[edgeLabelHtml]`.

## Как делают другие

|                 | React Flow                                                                                                         | ng-diagram                                                                                                                                  | Foblex Flow                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Кастомное ребро | компонент возвращает SVG (`<BaseEdge>` = `<path>`) внутри общего `<svg>`; реестр `edgeTypes`                       | HTML-хост `<custom-edge>` с `<ng-diagram-base-edge>` внутри, который сам рендерит `<svg>`; консьюмер SVG не пишет; реестр `edgeTemplateMap` | `f-connection`: HTML-хост со своим `<svg>`; путь считает библиотека по `fType`; слоты только для маркеров |
| Лейбл ребра     | `EdgeLabelRenderer` портал в HTML-слой, объявляется внутри компонента ребра, позиция `labelX/labelY` от консьюмера | `<ng-diagram-base-edge-label [positionOnEdge]>` HTML-контент, спроецирован после svg, позиционируется библиотекой, меряется ResizeObserver  | `[fConnectionContent]` HTML-блок после svg, `position 0..1`, `offset`, `align: 'along'`                   |
| Дискриминатор   | `type: string` + реестр                                                                                            | `type: string` + реестр                                                                                                                     | тип пути `fType`                                                                                          |

Общее: лейбл объявляется внутри презентации ребра и рендерится как HTML, которое позиционирует
библиотека. Ни у кого нет глобального шаблона лейбла и карты лейблов в данных ребра.

## Принятые решения

1. Node и group объединяются; `type` убирается; дискриминатор приложения живёт в `data`.
2. Шина событий остаётся, но без наследования: `reflectComponentType(type).outputs`.
3. Компонентные рёбра через `createComponent` с `hostElement = <svg:g>`; консьюмер продолжает
   рисовать произвольный SVG. Модель «HTML-хост + библиотечный svg» отвергнута.
4. Handle это директива в core с автопозиционированием; визуал в `@vflow/ui`.
5. Лейблы декларативно внутри ребра, `edgeLabels` из данных удаляются.

Источники: reactflow.dev (custom edges, EdgeLabelRenderer), ngdiagram.dev (custom edges, custom edge
example) и исходники `synergycodes/ng-diagram` (`base-edge.component.html`,
`base-edge-label.component.ts`), flow.foblex.com (connection content, f-connection) и исходники
`Foblex/f-flow` (`f-connection.component.html`).
