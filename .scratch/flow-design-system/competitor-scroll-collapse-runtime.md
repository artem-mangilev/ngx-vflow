# React Flow / Foblex: scroll и collapse в живых демо

Дата: 2026-09-10. Проверка через Playwright Chromium, viewport 1400×950. Два полных прогона дали одинаковые итоговые признаки. Это проверка опубликованных сайтов, не локальных сборок ранее исследованных commit SHA; версии библиотек в deployed bundles не устанавливались.

## Источники и метод

- [React Flow Database Schema Node](https://reactflow.dev/ui/components/database-schema-node), [живой iframe](https://ui.reactflow.dev/components/database-schema-node).
- [Foblex Schema Designer](https://flow.foblex.com/examples/schema-designer), [живой iframe](https://flow.foblex.com/embedded/schema-designer/).
- [React Flow Expand and Collapse](https://reactflow.dev/examples/layout/expand-collapse), [живой iframe](https://example-apps.xyflow.com/react/pro/expand-collapse/index.html).

В двух schema demos не обнаружены штатные контролы сворачивания/прокрутки полей. Поэтому ниже разделены **обычный пользовательский сценарий** и **инъекция CSS в работающий пример**. Нельзя представлять второе как поломку заявленной функциональности демо.

CSS-probe: ограничить существующий контейнер полей через `max-height: 60px; overflow-y: auto`, дождаться resize, затем присвоить `scrollTop = 50`. Это настоящий DOM-scroll с браузерным scroll event, но не тест wheel gesture arbitration. Затем восстановить CSS и scrollTop, дождаться resize, скрыть контейнер через `display: none`. Application refresh APIs не вызывались. Записываются DOM rects, scrollTop и SVG `d`; после каждого изменения ожидание 700 ms.

## Результаты

### 1. Scroll без дополнительного уведомления приложения

|                                      | React Flow: Products                | Foblex: Orders                      |
| ------------------------------------ | ----------------------------------- | ----------------------------------- |
| Фактический scrollTop                | 50 CSS px                           | 44 CSS px (максимум контейнера)     |
| Изменение client Y измеренного порта | около −92.90 px                     | около −30.40 px                     |
| Изменение SVG paths после scroll     | Нет, строки `d` совпадают полностью | Нет, строки `d` совпадают полностью |

Разница client px и scrollTop обусловлена масштабом canvas. В обоих случаях браузер переместил порты, но связи не последовали за ними. После первоначального ограничения высоты пути обновлялись (незначительные числовые изменения), поэтому сравнение делается **между constrained и scrolled**, не с baseline.

Вывод ограничен этими примерами: CSS-scroll сам по себе не дал автоматического обновления endpoints. Это не доказательство невозможности реализовать scroll через API библиотеки.

### 2. Collapse через `display: none` контейнера полей

В обоих примерах скрытый порт получил DOM rect `{x:0,y:0,w:0,h:0}`. Связи **пересчитались**, но не перенеслись к заголовку: связанные со скрытыми портами концы визуально ушли к верхнему левому углу browser viewport. React Flow сохранил 2 связи, Foblex — все 7 (среди них есть не связанные с изменённой таблицей).

- [React Flow screenshot](competitor-runtime/reactflow-collapse.png)
- [Foblex screenshot](competitor-runtime/foblex-collapse.png)

Это отличается от нашего прототипа: у нас endpoints остаются на прежних координатах, здесь получается некорректная новая геометрия. Ни один вариант не задаёт полезную collapse-политику. Результат согласуется с предупреждением React Flow не применять `display: none` к handles; см. [предыдущее исследование](handle-placement-research.md).

### 3. Штатный React Flow Expand/Collapse

Нажат первый видимый `collapse ▲`, затем соответствующий `expand ▼`:

| Состояние | DOM nodes | SVG edges |
| --------- | --------: | --------: |
| До        |         6 |         4 |
| Collapse  |         4 |         2 |
| Expand    |         6 |         4 |

Демо корректно убирает дочерние узлы и их связи, затем восстанавливает их. Это **сворачивание дерева графа**, не скрытие DOM-строк внутри одного узла. Официальная страница описывает application hook `useExpandCollapse`, который хранит полный граф и рендерит видимую часть. Исходники платного Pro-примера не получались; проверено только публичное интерактивное демо.

## Что это означает для ngx-vflow

1. DOM-first не обеспечивает автоматически отслеживание внутреннего scroll — в проверенных конкурирующих примерах получен тот же класс рассинхронизации.
2. Автоматический remeasure при collapse недостаточен и может дать нулевые rects вместо полезной привязки.
3. Требуются раздельные решения: когда инвалидировать геометрию; куда вести связь при невидимой строке; как отображать/обрезать сам порт.
4. Перенос к заголовку, скрытие связей или прижатие endpoints к границе scroll-области — возможные политики для нашего API/recipe, но не подтверждённая автоматическая возможность этих demos.
5. Не проверялись реализации с `updateNodeInternals` / `refresh`, virtualized rows, wheel/zoom arbitration, все остальные демо конкурентов и версии пакетов. Из отсутствия контролов в двух schema demos нельзя выводить отсутствие готового решения во всей экосистеме.

## Воспроизведение и артефакты

Из корня ngx-vflow, с установленным Playwright/Chromium и доступом к сайтам:

```bash
node .scratch/flow-design-system/competitor-runtime/probe.cjs
```

[Скрипт](competitor-runtime/probe.cjs), [измерения](competitor-runtime/results.json). Скриншоты baseline, scroll, collapse и tree-collapse находятся в `competitor-runtime/`.

Итоговый вывод двух прогонов:

```text
reactflow: scrollMoved=true, portMoved=true, scrollPathsUnchanged=true,
           collapsedPathsUnchanged=false, collapsedEdgeCount=2
foblex:    scrollMoved=true, portMoved=true, scrollPathsUnchanged=true,
           collapsedPathsUnchanged=false, collapsedEdgeCount=7
tree:      before={nodes:6,edges:4}, after={nodes:4,edges:2}, expanded={nodes:6,edges:4}
```

Библиотека и наш прототип не изменялись.
