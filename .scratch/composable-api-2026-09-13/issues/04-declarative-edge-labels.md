# 04. Декларативные лейблы внутри ребра

Status: resolved
Type: task
Blocked by: 03

Реализовать D6 из `spec.md` (обновлено 2026-09-14: структурная директива, одна форма механики).

- `directives/template.directive.ts`: `EdgeLabelTemplateDirective`, селектор `ng-template[edgeLabel]`,
  единственный вход `edgeLabel: EdgeLabelPosition` с дефолтом `center` и `transform: (v) => v || 'center'`
  (обе формы записи ставят статический атрибут `''`). Инжектит `EdgeComponent`, в `effect` по
  `edgeLabel()` пишет `TemplateRef` в `EdgeModel.labelTemplates`, снимает через `onCleanup` (смена
  позиции и destroy). Dev-warning при повторной позиции и при `path().labelPoints === undefined`.
  Удалить `EdgeLabelHtmlTemplateDirective`.
- Формы записи, обе через один селектор: `<span *edgeLabel>`, `<button *edgeLabel="'end'">`,
  `<ng-template edgeLabel="end">…</ng-template>`. Микросинтаксис ничего не добавляет к директиве,
  только имя входа совпадает с селектором.
- `models/edge.model.ts`: `labelTemplates = signal<Partial<Record<EdgeLabelPosition, TemplateRef<unknown>>>>({})`;
  удалить `edgeLabels`, `labelModels`, `EdgeLabelModel`.
- `interfaces/edge.interface.ts`: удалить `edgeLabels` и `EDGE_DEFAULTS.edgeLabels`;
  `interfaces/edge-label.interface.ts` оставить только `EdgeLabelPosition`; удалить
  `HtmlEdgeLabelContext`.
- `components/edge-label/edge-label.component.*`: селектор `div[edgeLabelHost]`, входы `edgeModel`,
  `position`, `template: TemplateRef`, `injector`; outlet с пустым контекстом и инжектором ребра;
  позиционирование, visibility и zIndex без изменений. После рендера (`afterNextRender` или эффект по
  `template()`) проверить `namespaceURI` первого элемента `.edge-label-wrapper`: если SVG, dev-warning
  «move `*edgeLabel` out of any svg:* element (next to `<svg:g>`, not inside it)».
- `components/vflow/vflow.component.{ts,html}`: слой лейблов итерирует `Object.entries(model.labelTemplates())`
  вместо трёх блоков `start`/`center`/`end`; убрать `contentChild(EdgeLabelHtmlTemplateDirective)`.
- Спеки: регистрация/снятие при уничтожении шаблона ребра и при смене `edgeLabel`; `*edgeLabel` без
  значения и `<ng-template edgeLabel>` дают `center`; рендер в слое лейблов в точке позиции; замыкание
  `ctx` ребра; лейбл внутри компонентного ребра; лейбл рядом с `svg:g` внутри `ng-template[edge]`
  это `HTMLElement`; лейбл внутри `svg:g` даёт dev-warning; кривая без `labelPoints` даёт dev-warning.

Не делать: `labelPoints` в `EdgeRef`, числовую позицию вдоль пути (см. D6, отвергнуто/отложено).

Файлы: `libs/ngx-vflow/src/lib/vflow/directives/template.directive.ts`, `models/edge.model.ts`,
`models/edge-label.model.ts` (удалить), `interfaces/edge.interface.ts`,
`interfaces/edge-label.interface.ts`, `interfaces/template-context.interface.ts`,
`components/edge-label/*`, `components/vflow/vflow.component.*`, `vflow.ts`, `public-api.ts`.

## Answer

Сделано 2026-09-14.

- `EdgeLabelTemplateDirective` (`ng-template[edgeLabel]`) с единственным входом `edgeLabel`: дефолт `center`, пустая
  строка тоже `center`. Инжектит `EdgeComponent`, в эффекте по позиции пишет `TemplateRef` в
  `EdgeModel.labelTemplates` и снимает регистрацию в `onCleanup`, только если на позиции всё ещё этот шаблон.
  Dev-предупреждения: повторная позиция (побеждает последний) и кривая без `labelPoints`.
- `EdgeModel`: `labelTemplates` и производный `labelEntries` в порядке `start`, `center`, `end`; удалены `edgeLabels`,
  `labelModels`, `EdgeLabelModel`. Из `Edge`, `EDGE_DEFAULTS` и `createEdge` удалено поле `edgeLabels`;
  `edge-label.interface.ts` содержит только `EdgeLabelPosition`; `HtmlEdgeLabelContext` удалён.
- `div[edgeLabelHost]`: входы `edgeModel`, `position`, `template`, outlet без контекста. Позиционирование, visibility и
  zIndex прежние. В dev-режиме после рендера проверяет namespace первого элемента и предупреждает про SVG.
  Вход `injector` не понадобился: DI идёт по цепочке объявления и находит инжектор ребра (проверено по исходникам
  Angular 20.3 и тестом с `injectEdge()` внутри лейбла).
- Слой в `vflow.component.html` итерирует `labelEntries()`; `contentChild(EdgeLabelHtmlTemplateDirective)` удалён.
- `ngx-vflow/testing`: `EdgeLabelTemplateMockDirective` рендерит лейбл на месте; из `vflow-mock` убран слой по
  `edgeLabels`, в контекст ребра добавлен `data`; `all-mocks.spec` использует лейбл внутри шаблона ребра.
- Спеки: новый `edge-label.spec.ts` (рендер в слое в точке пути, замыкание `ctx` и обновление данных, дефолт `center`
  для обеих форм, DI в контенте лейбла, смена позиции и снятие при уничтожении шаблона, лейбл в компонентном ребре,
  предупреждения про SVG namespace, дубликат и кривую без `labelPoints`). `audit-regressions`, `css-virtualization` и
  `initial-handles` переведены на шаблон и компонентное ребро с лейблом.
- Docs: `docs-edge` рисует `data.label` через лейбл внутри себя, `DocsEdgeLabelComponent` и 46 типовых строк
  `edgeLabelHtml` удалены. Демо labels, overview, reconnection, workflow, relationships, ERD и BPMN объявляют лейблы в
  шаблоне ребра, данные лейблов перенесены в `data`. Переписаны страница labels, абзац про рёбра в обзоре дизайн-системы
  и список общих презентаций на default-nodes. Migration guide не менялся, это 07.
- Gotcha: ng-doc падает на любом слове со звёздочкой в инлайн-коде markdown и публичного JSDoc, если для него нет
  страницы. Структурная форма пишется только в fenced-блоках.

Проверки: `nx build ngx-vflow` (включая testing), lint библиотеки и docs, prettier, typecheck спек, `ngc` по docs,
`consumer:check`; юнит-тесты библиотеки 251/251, docs 1/1. В чистом Playwright на labels, overview, workflow,
relationships, ERD, BPMN и connections лейблы стоят в слое, это видимые `HTMLElement` с позицией, тексты совпадают,
кнопка Delete на labels удаляет ребро с тремя лейблами; ошибок консоли нет. Предупреждения: WebGPU «No available
adapters» на overview и NG0912 о совпадении ID двух демо на connections (шаблоны этих демо структурно одинаковы и
до изменений). e2e docs 31/32; упал `virtualization demo retains node DOM and geometry through viewport pan` на
`toHaveCount(4900)` за 5 с, повтор spec отдельно 5/6 с тем же тестом. Это известная нестабильность dev-режима, демо
виртуализации потеряло только неиспользуемый шаблон лейбла.
