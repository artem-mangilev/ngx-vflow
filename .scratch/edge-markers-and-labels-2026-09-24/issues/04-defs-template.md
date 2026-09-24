# 04. Слот `ng-template[defs]`

Status: ready-for-agent
Type: task
Blocked by: 03

D4 из `spec.md`. `DefsTemplateDirective` (`ng-template[defs]`) в `template.directive.ts`, `contentChild` в
`VflowComponent`, вход `template` у `DefsComponent`, `ngTemplateOutlet` после встроенных маркеров. Экспорт в
`Vflow` и `public-api.ts`. Спека `DefsComponent`: шаблон рендерится внутри `<defs>` в SVG-пространстве имён.
