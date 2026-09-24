# Edges 3.0: label вдоль кривой и custom markers

Дата: 2026-09-24. Итог обсуждения edges после фикса инсета маркера (`0cb0778c`). Ориентир по маркерам:
React Flow (`markerEnd` — объект встроенного маркера или строка-id пользовательского `<marker>` из `<defs>`);
в отличие от него `<marker>` здесь всегда рендерит библиотека, приложение даёт только фигуру. Ориентир по label вдоль пути: text-on-path в mermaid и dagre-d3
(текст поворачивается по касательной и переворачивается, чтобы читаться слева направо).

## Принципы

- Label — HTML в слое label, не `<textPath>`. Ориентация вдоль пути — поворот HTML-элемента на угол касательной.
- Встроенные маркеры остаются двумя стрелками. Любая другая фигура (круг, ромб, черта, крест, логотип) —
  фигура, объявленная приложением по типу. Элемент `<marker>` всегда рендерит библиотека, поэтому встроенные и
  объявленные фигуры используются одинаково.
- Кастомная кривая без новых данных продолжает работать: угол опционален, без него label горизонтальный.
- Один тип маркера: `type` либо зарезервирован библиотекой, либо объявлен приложением.

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

### D3. Один тип маркера: встроенные и объявленные фигуры

```ts
export type MarkerType = 'arrow' | 'arrow-closed' | (string & {});
export interface Marker {
  type?: MarkerType; // дефолт 'arrow-closed'
  width?: number;
  height?: number;
  orient?: string;
  strokeWidth?: number; // flow-единицы, дефолт 2
}
export type MarkerRef = MarkerType | Marker; // строка равна { type }
```

`Edge.markers.start/end` и `ConnectionSettings.marker` принимают `MarkerRef`. Зарезервированные типы `arrow` и
`arrow-closed` рисует библиотека, любой другой `type` это фигура, объявленная приложением (D4). Все поля
`Marker` работают для любого типа, потому что элемент `<marker>` всегда рендерит библиотека. `normalizeMarker`
приводит ссылку к канонической форме (тип проставлен, фиксированный порядок полей), так что `'arrow-closed'`,
`{}` и `{ type: 'arrow-closed' }` дают один хэш и один элемент. `createEdge`/`createEdges` не меняются.

Отдельного типа для пользовательского маркера нет. Первая реализация (`CustomMarker = { id; inset }` плюс
`ng-template[defs]` с полным `<svg:marker>` от приложения) отброшена 2026-09-24: два типа маркеров, инсет во
flow-единицах и глобальные стили через `ViewEncapsulation.None`.

### D4. Фигура через `ng-template[marker]`

```html
<ng-template marker="diamond" inset="8">
  <svg:polygon fill="context-stroke" points="-1,0 -5,-4 -9,0 -5,4" />
</ng-template>
```

`MarkerTemplateDirective` (`ng-template[marker]`) с входами `marker` (тип) и `inset` (единицы маркера, дефолт 0).
`VflowComponent` собирает `contentChildren` в карту `MarkerShapes` (тип → `{ template, inset }`), отдаёт её
`DefsComponent` и кладёт в `FlowEntitiesService.markerShapes`, откуда `EdgeModel` и `ConnectionComponent` берут
инсет через `markerTipInset(marker, shapes)`: встроенная таблица, иначе `inset` фигуры, иначе 0.

Контракт фигуры: viewBox `-10 -10 20 20`, вершина кончика в `x = -1` (штрих доходит до 0, как у встроенных
стрелок), тело в минус по `x`, `inset` на единицу внутри задней вершины, `fill` задаёт автор (`none` или
`context-stroke`). Штрих маркера равен `strokeWidth` flow-единицам при любом размере (дефолт 2, толщина линии по
умолчанию; `stroke-width = strokeWidth / scale` в единицах маркера, где `scale = min(width, height) / 20`), чтобы
линия входила в фигуру без ступеньки; ребро с линией толще задаёт маркерам тот же `strokeWidth`. Инсет тоже
считается через `scale`. `markerUnits` из `Marker` удалён: обёртка всегда `userSpaceOnUse`, режим `strokeWidth`
не давал ничего, что не даёт `strokeWidth` маркера, и ломал расчёт инсета. `DefsComponent` рендерит `<marker>` для всех типов одинаково: viewBox, `refX =
-inset`, размер, `orient`, `markerUnits="userSpaceOnUse"`, классы `vflow-marker` и `vflow-marker--<type>`, и
презентационные
атрибуты `stroke="context-stroke" stroke-width stroke-linecap="round" stroke-linejoin="round"`, которые
наследуются фигурой. Стили компонента и `ViewEncapsulation.None` не нужны; CSS приложения переопределяет
атрибуты через классы. Тип без фигуры рендерит пустой `<marker>` и предупреждает в dev-режиме.

Свой `viewBox`, `refY` или полностью свой `<marker>` контрактом не предусмотрены.

### D5. Демо дополнительных фигур

Страница markers получает раздел «Custom markers» с демо `CustomMarkersDemoComponent`: `circle`,
`circle-closed`, `diamond`, `diamond-closed`, `bar` как `ng-template marker`, edges со строковыми типами и с
объектом `{ type: 'diamond', width: 24 }`, `connection.marker` строкой. Это закрывает запрос на новые типы без
расширения библиотеки. Раздел объясняет контракт фигуры, `inset` и наследование stroke.

Страница labels получает пример с `orient: 'path'` на bezier и smooth-step. Страница curves упоминает
`angle` в `labelPoints`.

## Не меняется

Встроенные типы `arrow` и `arrow-closed`, их геометрия и инсет, `MARKER_DEFAULT_SIZE`, хэш-id,

контекст label (его по-прежнему нет), позиция label `start`/`center`/`end` и её точки на встроенных кривых.

## Миграция

Ломающих изменений нет. `labelPoints` кастомной кривой остаются валидными; `angle` — добавка.

## Порядок

01 → 02 (label), 03 → 04 → 05 (markers). Ветки независимы, можно вести параллельно.
