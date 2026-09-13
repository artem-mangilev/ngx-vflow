# Appearance inputs и их замены

Дата: 2026-09-12, этап 3. Полный список программных параметров оформления core и замен по CSS-контракту. На этапе 3 inputs были сохранены с токенами `--vflow-*` в значениях по умолчанию; на этапе 7 (2026-09-12) все перечисленные inputs и default presentation удалены, замены зафиксированы в migration guide.

| Текущее API                        | Место                          | Замена                                                                                                                                                  |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resizerColor`                     | `ResizableComponent`           | `--vflow-selection`; форма и размер контролов — CSS по `.resize-control`                                                                                |
| `color` у `nodeResizeControl`      | `NodeResizeControlComponent`   | то же                                                                                                                                                   |
| `maskColor`, `strokeColor`         | `MiniMapComponent`             | `--vflow-muted` (маска с прозрачностью) и `--vflow-border`; minimap читает вычисленные значения                                                         |
| `lineColor`                        | `AlignmentHelperSettings`      | `--vflow-foreground`; `tolerance` остаётся параметром поведения                                                                                         |
| `color`                            | `SelectionBoxSettings`         | `--vflow-selection`; `mode` остаётся параметром поведения                                                                                               |
| `color` (solid), `backgroundColor` | `Background` для `dots`/`grid` | `--vflow-background`; `gap`, `size`, `strokeWidth`, `src`, `fixed`, `repeat`, `scale` остаются данными                                                  |
| `color` у `dots`/`grid`            | `Background`                   | `--vflow-muted`                                                                                                                                         |
| `color`, `strokeWidth`             | `Marker`                       | `--vflow-muted` по умолчанию; для собственного цвета — свой маркер в шаблоне связи; `type`, `width`, `height`, `orient`, `markerUnits` остаются данными |
| `style` стандартной подписи        | `DefaultEdgeLabel`             | Удаляется вместе с default presentation; HTML-подпись оформляется потребителем или `vflowEdgeLabel`                                                     |
| `color` у `default-group`          | `DefaultGroupNode`             | Удаляется вместе с default presentation; контейнер оформляется `vflowContainer`                                                                         |
| Цвета `default` node               | `DefaultNodeComponent`         | Удаляется вместе с default presentation                                                                                                                 |

Токены core, введённые на этапе 3, и их fallback:

| Токен                | Использование в core                                                              | Fallback                |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| `--vflow-background` | фон сцены (solid по умолчанию, подложка dots/grid), фон стандартной подписи       | `#fff`                  |
| `--vflow-surface`    | заливка default node, обводка handle, заливка нод в minimap                       | `#fff`                  |
| `--vflow-foreground` | текст default node, заливка handle, линии alignment helper, обводка нод в minimap | `#1b262c`               |
| `--vflow-muted`      | линии связей, connection preview, маркеры, точки/сетка фона, маска minimap        | `rgb(177, 177, 183)`    |
| `--vflow-border`     | рамка default node, рамка minimap                                                 | `#1b262c` / `#c8c8c8`   |
| `--vflow-selection`  | выделенные связи, selection box, resize controls, выделенные ноды в minimap       | `#0f4c75` и др.         |
| `--vflow-focus`      | focus-обводка нод, индикатор фокуса связи                                         | `#005fcc`, `CanvasText` |
