# 03. Компонентные рёбра

Status: resolved
Type: task
Blocked by: 02

Реализовать D4 из `spec.md`.

- `interfaces/edge.interface.ts`: `component?: NodeComponentType` (переименовать алиас в
  `EntityComponentType`, оставить `NodeComponentType` как алиас); `createEdge` прокидывает поле.
- `EdgeComponent`: `providers: [EdgeAccessorService]` (новый, по образцу `NodeAccessorService`),
  токен `EDGE_REF` = `model().context.$implicit`, `injectEdge<T>()`. При `component` создать
  `<svg:g class="vflow-edge-host">` и передать его как `hostElement` в `[entityComponentOutlet]`;
  иначе шаблон `ng-template[edge]`, как сейчас.
- Шина: `pushEdgeEvent`, `event$` для рёбер; `VflowComponent.componentEdgeEvent` через
  `outputFromObservable`; тип `ComponentEdgeEvent<T>` / `AnyComponentEdgeEvent`.
- `CustomTemplateEdgeComponent` → `CustomEdgeComponent`, селектор `g[customEdge]`; файл и мок в
  `testing` переименовать.
- Спеки: host компонента это `SVGGElement`; host-биндинги применяются к `<g>`; `injectEdge()`;
  событие уходит с `edgeId`; ленивая фабрика для ребра.

Файлы: `libs/ngx-vflow/src/lib/vflow/interfaces/edge.interface.ts`, `components/edge/edge.component.*`,
`services/edge-accessor.service.ts`, `public-components/custom-template-edge/` →
`public-components/custom-edge/`, `components/vflow/vflow.component.ts`, `public-api.ts`, `vflow.ts`.

## Answer

Сделано 2026-09-13.

- `Edge.component?: EntityComponentType` (общий тип с нодами, бывший `NodeComponentType`), `createEdge` передаёт
  поле как есть.
- `EntityComponentOutletDirective` получил вход `entityComponentOutletSvgHost`: компонент создаётся через
  `createComponent` с `hostElement`, равным `<svg:g>` в SVG namespace, и его представление вставляется в
  контейнер внутри `<svg edge>`. Селектор компонента не используется, host-биндинги применяются к группе.
- `EdgeComponent` рендерит компонент ребра через outlet, иначе `ng-template[edge]`; фокус-индикатор,
  reconnect-хэндлы, `visibility` и `zIndex` остались в библиотечном SVG. Провайдит `EDGE_REF` через
  `inject(EdgeComponent)`; `injectEdge<T>()` и `EdgeRef<T>` публичные, `EdgeContext` теперь
  `{ $implicit: EdgeRef }`.
- Шина: `pushNodeEvent`/`nodeEvent$` и `pushEdgeEvent`/`edgeEvent$`. У `vflow` новый output
  `(componentEdgeEvent)`; типы `ComponentEdgeEvent<T>`, `AnyComponentEdgeEvent`, общий `ComponentOutputEvent<T>`.
- `CustomTemplateEdgeComponent` переименован в `CustomEdgeComponent` (`g[customEdge]`) вместе с моком.
  Переименование прошло по docs, consumer, `@vflow/ui` и e2e (20 файлов).
- Docs: на странице custom-edges добавлены раздел и демо `ComponentEdgesDemoComponent` (ребро-компонент с
  output `picked` и `(componentEdgeEvent)`).

Проверки: typecheck библиотеки, спек и docs; eslint и prettier; `nx build ngx-vflow`; `nx build docs` без
предупреждений; `consumer:check`; юнит-тесты библиотеки 239/239 (новые: хост компонента и ленивой фабрики
это SVG-группа внутри `svg[edge]` с путём, контекст ребра в компоненте и в компоненте внутри шаблона ребра,
события ребра приходят в `componentEdgeEvent` и не попадают в `componentNodeEvent`), docs 1/1; e2e docs
32/32. В браузере на custom-edges оба компонентных ребра видимы, клик по ребру показывает его id через
событие компонента и выделяет ребро, шаблонное демо не изменилось; в чистом Playwright ошибок консоли нет.

Дополнение 2026-09-13 по обсуждению с пользователем: зона клика и выделение рёбер перенесены в библиотеку.

- `EdgeComponent` рисует прозрачный путь `interactive-edge` по вычисленной геометрии первым элементом SVG ребра,
  под шаблоном или компонентом, с шириной из нового поля `Edge.interactionWidth` (по умолчанию 20, `0`
  убирает путь). Ширина ставится через `style`, потому что правило CSS перебивает атрибут `stroke-width`.
- Хост `EdgeComponent` сам слушает `click` (выделение с проверкой завершения рамки выделения, клики по
  reconnect-хэндлам пропускаются) и `mousedown`/`touchstart` (подъём при `elevateEdgesOnSelect`). Клики от
  элементов презентации всплывают туда же, так что своя геометрия с `pointer-events="stroke"` при
  `interactionWidth: 0` тоже выделяет ребро.
- `CustomEdgeComponent` и его мок удалены; `selectable` больше не поддерживает рёбра и остаётся для частей ноды.
- Docs и consumer: сняты обёртки в 14 шаблонах, `selectable` убран с путей рёбер в selecting и drag-and-drop,
  delete-selected оставил фокусируемую группу для Backspace. Демо компонентных рёбер шлёт `picked` при
  выделении ребра, потому что клик по зоне клика не доходит до элементов внутри компонента. Тексты
  custom-edges, default-edges, обзора дизайн-системы, сниппеты migration и README `@vflow/ui` обновлены.

Проверки: typecheck, eslint, prettier; сборки библиотеки и docs; `consumer:check`; юнит-тесты библиотеки
241/241 (новые: зона клика первой в каждом SVG ребра с шириной 20px и выделение кликом для шаблонного и
компонентного ребра; при ширине 0 зоны нет, а клик по элементу презентации выделяет ребро), docs 1/1;
e2e docs 32/32. В чистом Playwright настоящий клик в середину ребра попадает в `interactive-edge` и выделяет
шаблонное и компонентное ребро, компонентное демо выводит «Last selected edge: 1 -> 2», delete-selected
удаляет выделенное ребро по Backspace, ошибок консоли нет.

Дополнение 2 (2026-09-13): базовый элемент вернулся как директива `g[edgeInteraction]`.

- Причина: зона клика в корне SVG ребра — сосед презентации, а не её предок, поэтому клики, наведение,
  `:hover` и остальные события указателя на ней не доходили до элементов шаблона или компонента. Референсы
  (React Flow `BaseEdge`, ng-diagram base edge, Foblex `f-connection`) держат зону внутри разметки пользователя.
- `attachEdgeInteractionArea` вставляет прозрачный путь первым дочерним элементом узла, обновляет `d`, ширину и
  видимость эффектом, стили ставит инлайн (инкапсулированные стили ребра к нему не применяются) и увеличивает
  `EdgeModel.interactionHostCount`. Пока счётчик больше нуля, `EdgeComponent` не рисует путь в корне.
- `EdgeInteractionDirective` (`g[edgeInteraction]`) использует её для группы в `ng-template[edge]`. Для компонентных
  рёбер outlet получил вход `entityComponentOutletAttach`: `EdgeComponent` передаёт функцию, и путь попадает в
  хост компонента автоматически, так что работают `host: { '(click)' }` и `:host(:hover)`.
- Без директивы остаётся запасной путь в корне SVG, выделение по клику работает без разметки. Выделение и подъём
  остаются на хосте `EdgeComponent`.
- Мок `EdgeInteractionMockDirective` добавлен в `ngx-vflow/testing`. Демо custom-edges показывает директиву с
  подсветкой при наведении, компонентное демо снова реагирует на клик через `host` и подсвечивает `:host(:hover)`.

Проверки: typecheck, eslint, prettier; сборки библиотеки и docs; `consumer:check`; юнит-тесты библиотеки 243/243
(путь первым внутри хоста компонента и группы с директивой и отсутствие пути в корне; клики доходят до
слушателей презентации и выделяют ребро; при ширине 0 путь скрыт, а клик по элементу презентации выделяет
ребро; запасной путь в корне без директивы), docs 1/1. e2e на перезапущенном сервере 31/32, упал только известный
нестабильный тест virtualization; `custom-edge-interactions.spec` отдельно 4/4. В чистом Playwright настоящим
курсором: `:hover` у группы с директивой и у хоста компонента (линия 5px, после ухода 3px), клики выделяют рёбра и
выводят «Last clicked edge: 1 -> 2», delete-selected работает через запасной путь, ошибок консоли нет.
Первый прогон e2e шёл против устаревшего dev-сервера: после удаления файлов и параллельной сборки docs его
пересборка сломалась, сервер пришлось перезапустить.

Дополнение 3 (2026-09-13): компонентные рёбра подключают зону клика явно.

- Автоматическая вставка пути в хост компонента убрана вместе с входом outlet `entityComponentOutletAttach`.
  Компонент подключает `EdgeInteractionDirective` через `hostDirectives`; селектор директивы там не применяется,
  а хост очищается до создания директив, поэтому путь остаётся первым. Без директивы у компонента работает
  запасной путь в корне SVG: клик выделяет ребро, но до хоста не доходит.
- Общий `DocsEdgeComponent` получил `hostDirectives: [EdgeInteractionDirective]` (43 использования, все внутри
  шаблонов рёбер), демо `ColoredEdgeComponent` тоже; текст custom-edges описывает подключение.
- Спека: пробный компонент подключает директиву явно; новый тест проверяет запасной путь для шаблона и
  компонента без директивы и то, что клик по нему не попадает в хост.

Проверки: typecheck, eslint, prettier; `nx build ngx-vflow`; `consumer:check`; юнит-тесты библиотеки 243/243;
typecheck docs. `nx build docs` не повторялся, шаблоны docs не менялись. В чистом Playwright: у `docs-edge` путь
в хосте, `:hover` у хоста и выделение кликом; у компонентного ребра путь в хосте, линия 5px при наведении, клик
выводит «Last clicked edge: 1 -> 2»; delete-selected работает через запасной путь; ошибок консоли нет.
Полный e2e под параллельной нагрузкой: 30/32 (virtualization и scroll-collapse); scroll-collapse отдельно 3/3.

Дополнение 4 (2026-09-13): запасной путь в корне SVG ребра удалён по решению пользователя.

- `EdgeComponent` больше не рисует `interactive-edge`; зона клика есть только у рёбер с `g[edgeInteraction]` в
  шаблоне или `EdgeInteractionDirective` в `hostDirectives` компонента. Без неё ребро выделяется только кликом по
  своему элементу с `pointer-events="stroke"`. Удалены `EdgeModel.interactionHostCount` и правило `.interactive-edge`.
- `edgeInteraction` добавлен во все шаблоны рёбер docs и consumer (13 файлов; общий `DocsEdgeComponent` уже с
  `hostDirectives`). Тексты custom-edges, default-edges, обзора дизайн-системы, сниппеты migration, README и
  комментарий `@vflow/ui` говорят, что директива нужна для зоны клика.
- Спека: тест запасного пути заменён проверкой, что без директивы пути нет, а клик по элементу презентации
  выделяет ребро и доходит до хоста компонента.

Проверки: typecheck, eslint, prettier; `nx build ngx-vflow`; `consumer:check`; юнит-тесты библиотеки 243/243;
typecheck docs; dev-сервер docs компилирует шаблоны без ошибок. В чистом Playwright на default-edges, selecting,
bpmn, custom-edges и delete-selected нет путей в корне SVG, путь стоит первым в группе презентации, клики выделяют
рёбра, компонентное ребро реагирует на наведение и клик, delete-selected удаляет по Backspace, ошибок консоли нет.
e2e без параллельной нагрузки 30/32: virtualization и «keeps wheel zoom within limits … aligns after resize at high
DPI» из `minimap-navigation.spec.ts`. A/B последнего теста, 16 прогонов на сервер вперемешку: база `53a226e4` 2 падения,
текущий код 1 падение, значит нестабильность старая.
