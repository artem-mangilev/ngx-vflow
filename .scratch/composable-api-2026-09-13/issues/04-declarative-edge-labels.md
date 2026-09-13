# 04. Декларативные лейблы внутри ребра

Status: ready-for-agent
Type: task
Blocked by: 03

Реализовать D6 из `spec.md`.

- `directives/template.directive.ts`: `EdgeLabelTemplateDirective`, селектор `ng-template[edgeLabel]`,
  вход `position` (обязателен); инжектит `EdgeAccessorService`, регистрирует `TemplateRef` в
  `EdgeModel.labelTemplates`, снимает на destroy; dev-warning при повторной позиции. Удалить
  `EdgeLabelHtmlTemplateDirective`.
- `models/edge.model.ts`: `labelTemplates = signal<Partial<Record<EdgeLabelPosition, TemplateRef<unknown>>>>({})`;
  удалить `edgeLabels`, `labelModels`, `EdgeLabelModel`.
- `interfaces/edge.interface.ts`: удалить `edgeLabels` и `EDGE_DEFAULTS.edgeLabels`;
  `interfaces/edge-label.interface.ts` оставить только `EdgeLabelPosition`; удалить
  `HtmlEdgeLabelContext`.
- `components/edge-label/edge-label.component.*`: селектор `div[edgeLabelHost]`, вход
  `template: TemplateRef`, outlet с пустым контекстом и инжектором ребра; позиционирование,
  visibility и zIndex без изменений.
- `components/vflow/vflow.component.{ts,html}`: слой лейблов итерирует `labelTemplates()`;
  убрать `contentChild(EdgeLabelHtmlTemplateDirective)`.
- Спеки: регистрация/снятие при уничтожении шаблона ребра; рендер в слое лейблов в точке позиции;
  замыкание `ctx` ребра; лейбл внутри компонентного ребра.

Файлы: `libs/ngx-vflow/src/lib/vflow/directives/template.directive.ts`, `models/edge.model.ts`,
`models/edge-label.model.ts` (удалить), `interfaces/edge.interface.ts`,
`interfaces/edge-label.interface.ts`, `interfaces/template-context.interface.ts`,
`components/edge-label/*`, `components/vflow/vflow.component.*`, `vflow.ts`, `public-api.ts`.
