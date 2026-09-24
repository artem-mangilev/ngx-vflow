# Edges 3.0: label вдоль кривой и custom markers

Дата: 2026-09-24. Итог обсуждения edges после фикса инсета маркера (`0cb0778c`). Ориентир по маркерам:
React Flow (`markerEnd` — объект встроенного маркера или строка-id пользовательского `<marker>` из `<defs>`;
обёртка в `url('#id')` делает библиотека). Ориентир по label вдоль пути: text-on-path в mermaid и dagre-d3
(текст поворачивается по касательной и переворачивается, чтобы читаться слева направо).

## Принципы

- Label — HTML в слое label, не `<textPath>`. Ориентация вдоль пути — поворот HTML-элемента на угол касательной.
- Встроенные маркеры остаются двумя стрелками. Любая другая фигура (круг, ромб, черта, крест, логотип) —
  пользовательский `<marker>`, на который edge ссылается по id. Библиотека не расширяет набор типов.
- Кастомная кривая без новых данных продолжает работать: угол опционален, без него label горизонтальный.
- Один способ на задачу: строка-id для пользовательского маркера, объект `Marker` для встроенного.

## Решения

### D1. Угол касательной в `labelPoints`

Тип точки label становится `EdgeLabelPoint = Point & { angle?: number }`. `angle` — направление пути в этой
точке в градусах, `atan2(dy, dx)` в координатах потока (ось y вниз, по часовой стрелке положительно; `0` —
вправо, `90` — вниз). Слой label лежит внутри viewport, масштаб равномерный, поэтому угол в координатах потока
равен углу на экране.

Встроенные кривые отдают угол во всех трёх точках:

- straight: `atan2(target - source)`.
- bezier: касательная де Кастельжо на том же `t` (0.1, 0.5, 0.9), что и точка: направление между двумя
  точками предпоследнего уровня.
- smooth-step и step: направление сегмента, на котором лежит точка. Для `start`/`end` сегмент известен из
  `getPointAtRatio`; для `center` — сегмент, содержащий `(labelX, labelY)`. На скруглении label не ставится,
  так что угол всегда 0, 90, 180 или -90.

`CurveLayout.labelPoints` меняет тип значения на `EdgeLabelPoint`; `Point` присваивается ему, кастомные
кривые не ломаются.

### D2. `orient` у `edgeLabel`

Вход `edgeLabelOrient: 'horizontal' | 'path'`, дефолт `horizontal`. Микросинтаксис:

```html
<span *edgeLabel="'center'; orient: 'path'" vflowEdgeLabel>{{ text }}</span> <ng-template edgeLabel="end" edgeLabelOrient="path">…</ng-template>
```

`EdgeLabelComponent` при `path` добавляет `rotate(angle)` к `translate` хоста; обёртка уже центрирована
`translate(-50%, -50%)`, поэтому вращение идёт вокруг точки пути. Угол нормализуется в `(-90, 90]`: при
`|angle| > 90` прибавляется 180, текст читается слева направо на любом направлении ребра. Ориентация «по
направлению ребра» без переворота не делается: label — текст, стрелку направления рисует маркер.

Точка без `angle` (кастомная кривая) — label горизонтальный, без предупреждения; это документируется на
странице labels рядом с `labelPoints`.

Модель хранит ориентацию вместе с шаблоном: `labelTemplates` → `Record<EdgeLabelPosition, { template, orient }>`.

### D3. Пользовательский маркер по id

```ts
markers: signal({ end: 'logo' }); // id элемента <marker id="logo">
markers: signal({ start: { type: 'arrow' }, end: 'diamond' });
connection: {
  marker: 'circle';
}
```

`Edge.markers.start/end` и `ConnectionSettings.marker` принимают `Marker | string`. Для строки:

- `ctx.markerEnd()` / `ctx.markerStart()` / `ctx.marker()` возвращают `url(#<id>)` как есть; библиотека ничего
  не экранирует и не проверяет наличие элемента.
- В общий `<defs flowDefs>` строка не попадает; `FlowEntitiesService.markers` пропускает строки.
- `markerInset` равен 0: путь заканчивается в точке соединения, геометрию задаёт `refX` пользовательского
  маркера. Инсет для кастомного маркера не настраивается; кому нужен — сдвигает конец в кастомной кривой.
- `createEdge`/`createEdges` не меняются: значение проходит в сигнал как есть.

Тип объекта `Marker` не меняется. Хэш-id встроенных маркеров не меняется.

### D4. Слот `ng-template[defs]`

`<marker>` ищется по id во всём документе, поэтому пользователь может держать его в любом `<svg>` на
странице. Чтобы не заводить скрытый svg, `vflow` принимает шаблон:

```html
<vflow …>
  <ng-template defs>
    <svg:marker id="diamond" viewBox="-10 -10 20 20" refX="-8" refY="0" markerWidth="16" markerHeight="16" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
      <svg:polygon class="vflow-marker vflow-marker--arrow-closed" points="-8,0 -4,-4 0,0 -4,4" />
    </svg:marker>
  </ng-template>
</vflow>
```

Директива `DefsTemplateDirective` (`ng-template[defs]`) рядом с `node`/`edge`/`connection`;
`DefsComponent` получает `template` и рендерит его через `ngTemplateOutlet` после встроенных маркеров.
Содержимое компилируется в SVG-пространстве имён (`svg:` префикс), как шаблоны edge. Публичные классы
`.vflow-marker`, `.vflow-marker--arrow`, `.vflow-marker--arrow-closed` дают `context-stroke` и толщину
штриха; пользовательский маркер может их переиспользовать.

### D5. Демо дополнительных фигур как custom markers

Страница markers получает раздел «Custom markers» с демо `CustomMarkersDemoComponent`: `circle`,
`circle-closed`, `diamond`, `diamond-closed`, `bar` в `ng-template defs`, edges со строковыми маркерами, один
из них с `start` и `end` разных видов, и `connection.marker` со строкой. Это закрывает запрос на новые типы
без расширения библиотеки. Раздел объясняет `refX` (где путь кончается относительно фигуры) и `context-stroke`.

Страница labels получает пример с `orient: 'path'` на bezier и smooth-step. Страница curves упоминает
`angle` в `labelPoints`.

## Не меняется

Встроенные типы `arrow` и `arrow-closed`, их геометрия и инсет (`markerTipInset`), `MARKER_DEFAULT_SIZE`,
хэш-id, `Marker.markerUnits` (инсет при `strokeWidth` считается как для `userSpaceOnUse` — отдельная тема),
контекст label (его по-прежнему нет), позиция label `start`/`center`/`end` и её точки на встроенных кривых.

## Миграция

Ломающих изменений нет. `labelPoints` кастомной кривой остаются валидными; `angle` — добавка.

## Порядок

01 → 02 (label), 03 → 04 → 05 (markers). Ветки независимы, можно вести параллельно.
