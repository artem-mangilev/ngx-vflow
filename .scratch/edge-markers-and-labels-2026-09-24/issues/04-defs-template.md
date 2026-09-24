# 04. Фигура через `ng-template[marker]`

Status: resolved
Type: task
Blocked by: 03

D4 из `spec.md`. `DefsTemplateDirective` (`ng-template[defs]`) в `template.directive.ts`, `contentChild` в
`VflowComponent`, вход `template` у `DefsComponent`, `ngTemplateOutlet` после встроенных маркеров. Экспорт в
`Vflow` и `public-api.ts`. Спека `DefsComponent`: шаблон рендерится внутри `<defs>` в SVG-пространстве имён.

## Answer

Сделано 2026-09-24, переписано в тот же день по D4: `MarkerTemplateDirective` (`ng-template[marker]`, входы
`marker`, `inset`), `contentChildren` и `markerShapes` в `VflowComponent`, `FlowEntitiesService.markerShapes`,
`DefsComponent` рендерит `<marker>` для всех типов с наследуемыми stroke-атрибутами и предупреждает о типе без
фигуры. Мок `MarkerTemplateMockDirective` в `VflowMocks` и `all-mocks.spec.ts`. scss компонента defs удалён.
