# 02. `edgeLabelOrient` и поворот label

Status: ready-for-agent
Type: task
Blocked by: 01

D2 из `spec.md`. Вход `edgeLabelOrient: 'horizontal' | 'path'` на `EdgeLabelTemplateDirective`;
`labelTemplates` модели хранит `{ template, orient }`; `labelEntries` отдаёт `orient` в `EdgeLabelComponent`.
Компонент при `path` и наличии `angle` пишет `translate(x, y) rotate(a)`, где `a` нормализован в `(-90, 90]`.
Без `angle` — как `horizontal`.

Спеки компонента: угол 135 → поворот -45; угол -100 → 80; отсутствие угла → без `rotate`. Демо labels
получает label с `orient: 'path'` на bezier и smooth-step; страница labels описывает вход, переворот для
читаемости и поведение без `angle`. Страница curves упоминает `angle`.
