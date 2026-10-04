# `ngx-vflow/testing`: имеет ли смысл в текущем виде

Дата: 2026-10-04. Ветка `3.0`.

**Решения (2026-10-04):** моки убираем сразу в 3.0; геометрия — только в browser mode, фейкового layout нет. Реализация — тикеты 01–03 в `issues/` (resolved), ADR-0009. Тикет 05 (сущности не скрываются в DOM без layout) тоже resolved. Открыт 04 (harness'ы и их DOM-контракт). Probe из раздела 2 заменён постоянными specs в `libs/ngx-vflow/node-dom/`.

## Вывод

Моки компонентов (`VflowMocks`) потеряли причину существования: настоящий `vflow` 3.0 рендерится в Node-DOM. `provideCustomNodeMocks` полезен по задаче, но держится на 10 приватных `ɵ`-символах. Современная форма test-утилит для Angular-библиотеки — настоящие компоненты + harness'ы на `@angular/cdk/testing` + подготовка окружения, а не зеркальные моки.

## 1. Что сейчас в entry point

- `VflowMocks` — 13 рукописных моков (`VflowMockComponent` на 336 строк и 12 директив/компонентов), повторяющих селекторы, inputs, outputs и методы.
- `provideCustomNodeMocks()` — провайдеры, чтобы отрендерить компонент узла вне `vflow`.
- Docs объясняют моки так: «to simplify testing in a Node environment (e.g., Jest)».

Исходная причина — issue #130: в jsdom падал `rootSvg.createSVGPoint is not a function`, настоящий `vflow` там не жил.

## 2. Эксперимент: настоящий `Vflow` в Node-DOM

Разовый probe под Vitest 3.2 до правок core. Flow: component-узел с `vResizable`, `vSelectable`, двумя `vHandle` и `v-node-toolbar`, template-узел, template-ребро с `vEdgeInteraction`, `v-minimap`.

| Проверка                     | happy-dom 20.14               | jsdom 29.1                                                                                                            |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Создание без настройки       | да, 0 ошибок                  | нет: `ResizeObserver is not defined`                                                                                  |
| Чего не хватает              | ничего                        | `ResizeObserver`, `IntersectionObserver`, `matchMedia`, `DOMMatrixReadOnly`, `canvas.getContext`, `setPointerCapture` |
| Узлы, handles, содержимое    | 3 узла, 5 handles             | то же (после заглушек)                                                                                                |
| Путь ребра                   | `M0,0 C98.8,0 151.2,0 250,0`  | то же                                                                                                                 |
| Соединение pointer-событиями | `(connect)` эмитит `a → b`    | не дошёл: `DOMMatrixReadOnly` падает в rAF                                                                            |
| Добавление узла через signal | рендерится                    | рендерится                                                                                                            |
| `zoomTo(2)`                  | работает                      | работает                                                                                                              |
| `initialized()`              | `false`                       | `false`                                                                                                               |
| `fitView()`                  | `false`, viewport не меняется | то же                                                                                                                 |
| `getNodeRect`                | размер 0×0                    | `undefined`                                                                                                           |

Что не работает ни в одном Node-DOM, потому что там нет layout: измеренные размеры, `fitView`, hit-testing, virtualization, готовность `initialized`. Клик через `element.click()` изменений выбора не дал — причину не разбирал.

В jsdom 6 заглушек — это тот же объём, что `mockReactFlow()` у React Flow.

## 3. Что изменил Vitest

- Официальный раннер Angular 21 (`@angular/build:unit-test`) по умолчанию работает в Node: jsdom, либо happy-dom, если он установлен. Сам переход на Vitest Node-DOM не отменяет.
- Browser mode — одна опция: `ng test --browsers=chromiumHeadless` (Playwright или WebdriverIO). Совет «геометрию тестируйте в браузере» стал дешёвым.
- Упоминание Jest в docs устарело.

## 4. Как это делают другие

- **Angular (CDK, Material, Router, HttpClient).** Мок-компонентов нет. Есть harness'ы (`MatButtonHarness`, `RouterTestingHarness`) и подмена инфраструктуры на границе (`provideHttpClientTesting`, `MatIconTestingModule`). Гайд angular.dev: команда Angular рекомендует harness'ы для shared-компонентов с интерактивностью; harness описывает действия пользователя и скрывает DOM. Один harness работает в TestBed (любой DOM) и в e2e (WebDriver; Playwright — через свой `HarnessEnvironment`).
- **React Flow.** Testing-пакета нет. Рекомендуют Cypress/Playwright; для Jest — сниппет `mockReactFlow()` с заглушками `ResizeObserver`, `DOMMatrixReadOnly`, `offsetWidth/Height`, `getBBox`.
- **AG Grid.** Рекомендуют e2e в настоящем браузере; jsdom — только для простых случаев, с оговоркой про отсутствие layout.

Никто из них не поставляет зеркальные моки компонентов.

## 5. Оценка текущих частей

**`VflowMocks` — убрать.**

- Тест потребителя проверяет поведение мока, а не библиотеки: мок не рендерит component-узлы, не даёт `NODE_REF` шаблону, не эмитит ни одного output.
- Паритет держится вручную: `all-mocks.spec.ts` на 243 строки и открытый тикет 17 со списком расхождений.
- Потребителю приходится писать `viewChild<VflowComponent>('vflow')` вместо `viewChild(VflowComponent)` ради подмены.
- Кому нужен именно shallow-тест, тот получит авто-мок из `ng-mocks` (`MockComponent(VflowComponent)`) без нашего кода.

**`provideCustomNodeMocks` — заменить.**

- Задача реальная (issue #89): тест узла без flow.
- Реализация тянет 10 `ɵ`-экспортов из core и ломается при каждом изменении DI узла (так было с `RequestAnimationFrameBatchingService` и `ConnectionControllerDirective`).
- `injectNode()` всегда отдаёт узел `mock` без `data`.
- Тот же тест пишется с настоящим flow из одного узла — см. probe.

## 6. Предлагаемая форма `ngx-vflow/testing`

1. **Core живёт в Node-DOM без настройки.** Feature-detect для 6 API из таблицы, чтобы jsdom не требовал заглушек. Это правка core, не testing.
2. **Harness'ы на `@angular/cdk/testing`:** `VflowHarness`, `VflowNodeHarness`, `VflowEdgeHarness`, `VflowHandleHarness`. Действия: `getNodes({ id })`, `node.select()`, `node.dragBy()`, `handle.connectTo(other)`, `edge.select()`, `getViewport()`. `@angular/cdk` — optional peer только для этого entry point.
3. **Layout в Node-DOM — отдельное решение.** Либо честно документировать «геометрия — только browser mode», либо дать `provideVflowTesting()`, который подставляет размеры из `width`/`height` узлов и переводит flow в `initialized`.
4. **Docs.** Страницы testing переписать: настоящий `Vflow`, harness'ы, когда нужен browser mode.

## Источники

- https://angular.dev/guide/testing
- https://angular.dev/guide/testing/creating-component-harnesses
- https://angular.dev/guide/testing/component-harnesses-testing-environments
- https://reactflow.dev/learn/advanced-use/testing
- https://www.ag-grid.com/angular-data-grid/testing/
- https://github.com/artem-mangilev/ngx-vflow/issues/130, /issues/89
