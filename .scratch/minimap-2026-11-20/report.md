# Миникарта: рамка блока, стиль нод, viewport, который нельзя потерять

Дата: 2026-11-20. Исследование и проект API, кода в `libs/` не меняли, ничего не закоммичено. Требования автора (рамка выключена и стилизуется CSS; стиль ноды объектом; viewport не теряется, образец — React Flow; миникарта остаётся на `<canvas>`; настройки на ноде плюс фича `withMinimapSettings()`) приняты как решения, отчёт отвечает на «как».

## Решения автора

2026-11-20 автор ответил на вопросы раздела 8 и сказал реализовывать. Реализовано в рабочем дереве, не закоммичено; что именно и чем отличается от текста ниже — в разделе «Реализация». В разделах 1–9 стоят имена и варианты на момент написания; расхождения с ними перечислены здесь.

1. Размер блока по умолчанию — `width: clamp(120px, 20%, 240px); aspect-ratio: 4 / 3`.
2. Заливка называется `background`; фича — `withMinimapSettings({ nodeStyles: { … } })`.
3. **Входа `groupStyle` нет.** 2026-11-21 автор убрал и вход `nodeStyle`: стиль одной ноды не входной параметр миникарты. Группу ядро различает само: нода, на которую ссылаются как на родителя (`isGroupNode()`, [`utils/is-group-node.ts`](../../libs/ngx-vflow/src/lib/vflow/utils/is-group-node.ts), уже используется миникартой). Умолчание для группы другое — см. раздел 10.1.
4. Перетаскивание в миникарте — живой пересчёт масштаба, как у React Flow (раздел 5.2 без изменений).
5. Контур viewport по умолчанию `transparent`, минимальный размер дырки 8×8 px.
6. Умолчания цветов из раздела 5.3 приняты. **Выделение миникарта пока не показывает вообще:** ключа `selected` в `MinimapNodeStyle` нет, токен `--v-minimap-selected` удаляется (в том числе из `forced-colors` и из отображения `@vflow/ui`), кэш нод перестаёт зависеть от `node.selected()`. Раздел 10.2 и все упоминания `selected` в разделах 5.3, 5.4 и 10.1 этим отменены.
7. **Входа `position` у миникарты нет.** Вместо него — общий механизм ядра, который кладёт любой элемент в угол или к стороне flow; через него же ставятся контролы. API — раздел 10.3; имя **`vPanel`** подтверждено автором. **Умолчания угла у миникарты нет** (вариант (б) раздела 10.3): без `vPanel` миникарта — обычный блок, который приложение размещает своим CSS; host-директивы у `v-minimap` нет. **`null` у `vPanel` не допускается:** вход — `input.required<PanelPosition>()`, снять размещение значит убрать атрибут. Открытых вопросов не осталось.

## После коммита `a16f14f4`

2026-11-21, после разбора слабых мест стилизации нод, автор решил убрать внешний вид из графа: **поля `Node.minimap` нет** (интерфейс, `createNode`, `toStaticNode`, `NodeModel.minimapStyle`, тесты, документация, демо). Уровень стиля один — `withMinimapSettings().nodeStyles[ключ компонента]` над умолчанием. Сделано в рабочем дереве, не закоммичено; тесты библиотеки 526 + 64 + 7, `ngc`, e2e миникарты 4 из 4.

Затем (2026-11-21) форма настроек дважды менялась; итог:

- **Общий вид — токены CSS**, задаются на миникарте или любом предке: `--v-minimap-node` (заливка), `--v-minimap-node-border` (контур, `transparent` = нет), `--v-minimap-node-radius` (радиус в пикселях flow, как `border-radius` самой ноды, для нод и групп), `--v-minimap-group` (заливка группы, по умолчанию прозрачная), `--v-minimap-group-border` (контур группы; не зарегистрирован, поэтому по умолчанию берёт `--v-minimap-node`). Тема `@vflow/ui` ставит радиусу радиус поверхности.
- **Толщины контура нет**: контур либо задан цветом, либо его нет; ширина всегда один пиксель миникарты (решение автора, убирает смешение единиц).
- **`nodeStyles` — только ключи компонентов**, значение — объект `{ background, borderColor, borderRadius }` или функция от ноды (запоминается в `computed` на ноду). Символов «все ноды / все группы» нет: их роль играют токены. Ближний уровень `withMinimapSettings()` заменяет правило ключа целиком.
- **Шаблонные ноды** и ноды с компонентом-классом оформляются только токенами; стиля по данным для них нет (автор согласился).
- Палитра переименована в `utils/css-values.ts`: кроме цветов читает длины (радиус) через `border-top-left-radius` пробы с переходом.

Тесты библиотеки 530 + 64 + 7, `ngc`, eslint. E2E: при прогоне всего набора тесты миникарты падали вперемешку, пока dev-сервер NgDoc каждые 30 секунд пересобирал страницы («files kept changing»); по отдельности `minimap-navigation.spec.ts` проходит (два упавших теста — дважды подряд). Не закоммичено.

## SVG вместо canvas (2026-11-21)

Автор счёл код разрешения CSS слишком тяжёлым и выбрал SVG. Замер в headless Chromium (240×180, DPR 2, мс на кадр): узлы одним `<path>` на стиль в SVG с `will-change: transform`, маска отдельным элементом — 0,16–0,17 при 500…20 000 нод (кэш-bitmap canvas 0,20); полная перерисовка нод — 1,5 у SVG и 2,0 у canvas при 5000; перетаскивание ноды при 5000 — 3,7 и 3,0. Маска в том же SVG стоила O(n) на кадр, поэтому она — `div` с `box-shadow` поверх.

- **Удалены**: `utils/css-values.ts` (пробы с переходами), `minimap-canvas.directive.ts` (логика перенесена в `minimap.component.ts`), `minimap-node-styles.ts` (кэш `computed` на ноду и планы). Цвета, `var()`, `color-mix()`, тема, `forced-colors` — обычный CSS на `<path>`; контур — `vector-effect: non-scaling-stroke`; маска — `.v-minimap-viewport` с `box-shadow` и `outline`, хост с `contain: paint` (блок для маски и её обрезка без `position`, который спорил бы с `vPanel`).
- **Стиль ноды** — одна функция `minimapNodeStyle()` в `minimap-nodes.ts`; правило-функция вызывается для всех нод при изменении любого прочитанного сигнала или набора нод, но не при движении (стили и геометрия — разные `computed`).
- **Радиус-токен** читается `getComputedStyle` при сборке путей (`shortcut:`): смена одного радиуса без изменения графа не видна до следующего изменения графа.
- Тесты: стили проверяются вычисленными `fill`/`stroke` пути под точкой (`elementFromPoint`), а не пикселями; тесты проб, переходов, скрытия и hex-литералов удалены. Библиотека 524 + 64 + 7, `ngc` документации, eslint. E2E миникарты на production-копии документации проходят, но нестабильно: демо-компонент страницы пересоздаётся примерно через 350 мс после загрузки, и тест иногда держит старый элемент («not attached to the DOM»); каждый из 4 тестов проходил.

## Реализация

Сделано 2026-11-20 в рабочем дереве ветки `3.0`, не закоммичено.

- **`vPanel`**: `public-directives/panel.directive.ts` (`VflowPanelDirective`, `PanelPosition`), правила `::ng-deep :where([data-v-panel…])` в `vflow.component.scss`, токен `--v-panel-offset`. Директива в массиве `Vflow` и в `public-api.ts`. Проверки «вне flow» в dev-режиме нет.
- **Миникарта**: `minimap.component.ts` — хост-блок со стилями `:where(:host)`, входы `pannable`, `zoomable`; `minimap-canvas.directive.ts` переписана, рядом `minimap-nodes.ts` и `utils/css-palette.ts`. Слот `<ng-content select="v-minimap" />` из шаблона `vflow` убран, тип `MinimapPosition` удалён.
- **Стили нод**: `interfaces/minimap.interface.ts` (`MinimapNodeStyle`, `MinimapSettings`), `features/with-minimap-settings.ts`, поле `Node.minimap` (`createNode`, `toStaticNode`), `NodeModel.minimapStyle`.
- **Токены**: `--v-minimap-node`, `--v-minimap-mask` (с альфой), `--v-minimap-viewport`; `--v-minimap-selected` удалён. `forced-colors`: ноды `CanvasText`, маска прозрачная, контур viewport `Highlight`. Тема `@vflow/ui`: ноды и маска — смеси `--vui-muted`.
- **Документация**: страница «Minimap» переписана, новая страница «Panels» с демо (`docs/viewport/panel`), справочники `reference/viewport` и `reference/styling`, миграция, конфигурация, `@vflow/ui`. Во всех демо `class="absolute bottom-2.5 left-2.5"` заменён на `vPanel`.
- **Тесты**: `minimap-navigation.spec.ts` переписан, новые `minimap-node-style.spec.ts` и `panel.directive.spec.ts`, поправлен `css-virtualization.spec.ts`; e2e `minimap-navigation.spec.ts` переписан и получил тест «viewport остаётся на миникарте».

Чем реализация отличается от разделов 5 и 10 (после замечаний автора 2026-11-21 отрисовка переписана второй раз):

1. **Входа `nodeStyle` у миникарты нет** (решение автора 2026-11-21). Уровней стиля два: `withMinimapSettings().nodeStyles[key]` и `Node.minimap`. Цвет всех нод задаёт токен `--v-minimap-node`. Умолчание группы — отдельная константа: контур цвета `--v-minimap-node` без заливки.
2. **Нет кэша-картинки с собственной трансформацией.** Первая версия держала bitmap нод в «своей» трансформации и перерисовывала его через 120 мс покоя; из-за этого нода, вытащенная за старую область, пропадала (найдено автором на группе в «Feature overview»). Теперь всё рисуемое — производные сигналов в `minimap-canvas.directive.ts`: `transform` (границы нод ∪ viewport), `batches` (ноды как `Path2D` во flow-координатах, по одному пути на стиль и глубину, `minimap-nodes.ts`), `picture` (пути, закрашенные в текущей трансформации) и кадр (картинка под маской). Таймеров и масштабирования картинки нет.
3. **Стоимость кадра.** Пока viewport внутри границ нод, трансформация не меняется и кадр камеры — `drawImage` плюс маска. Когда viewport выходит за ноды, каждый кадр заново закрашивает пути: синтетический замер в headless Chromium (canvas 480×360 пикселей) — 0,2 мс на 500 нод, 0,6 на 2000, 1,2 на 5000, 4,6 на 20 000 при одной заливке; с обводкой у всех нод — 1,1 / 4,3 / 10,4 / 42 мс, обводка по умолчанию есть только у групп. Построение путей при изменении графа — 0,8 мс на 5000 нод.
4. **Жесты через `createPointerDrag`.** Собственный учёт нажатия, захвата и отмены удалён. Клик центрирует по событию `click` (`auxclick` для других кнопок); перетаскивание начинается после `paneClickDistance` и, если началось вне viewport, сначала центрирует его на точке нажатия. Нажатие без движения и без отпускания ничего не делает (раньше центрировало сразу).
5. **Размер и DPR — `toSignal`**: размер из `resizable()` (тот же помощник, что у корня flow), плотность — из события `resize` окна. `device-pixel-content-box` не используется: под эмулированным DPR он отдаёт пиксели реального экрана.
6. **Цвета — `utils/css-palette.ts`**: `cssPalette(host, colors)` возвращает сигнал «цвет как написан → цвет для canvas». Директива объявляет список цветов (`colors`: два токена и цвета стилей нод; пустой, пока у canvas нет размера). На каждый цвет в `v-minimap` стоит скрытый элемент с `color` и переходом `color 1ms step-start`; браузер начинает переход ровно тогда, когда вычисленный цвет изменился, по любой причине (класс, атрибут, stylesheet, медиа-запрос), и палитра перечитывается по событиям перехода. Поток rx заканчивается `distinctUntilChanged` по содержимому, счётчика-триггера нет. Выбрано автором 2026-11-21 вместо `MutationObserver` на атрибутах предков, который видел любой атрибут и не видел правок stylesheet. Меры против скрытых отказов: переход задан inline с `!important` (сброс `* { transition: none !important }` его не отключает), события перехода останавливаются на контейнере проб и не доходят до слушателей приложения, после скрытия (`display: none`) цвета разрешаются заново. На сервере палитра пустая и элементов нет. Проверено только в Chromium.
7. **Обводка по центру края**, а не внутри прямоугольника: путь не зависит от масштаба.
8. Зум колесом, пропорциональный `deltaY` (тикет 6), не делался.

Проверено 2026-11-21: `tsc` и три набора тестов библиотеки (526 + 64 + 7), `ngc` документации, eslint и prettier изменённых файлов, e2e `minimap-navigation.spec.ts` (4 из 4) и `design-system.spec.ts` (10 из 11, падает известный «ERD: adding a field»), перетаскивание группы в «Feature overview» скриптом Playwright (группа остаётся на миникарте), страницы «Minimap» и «Feature overview» по скриншотам при DPR 2. Полный e2e документации после второй переделки не запускался; после первой было 53 из 56, падали `accessibility.spec.ts` (два теста, восстановление фокуса) и тот же ERD — оба записаны как падающие на базе в заметках прошлых сессий и на базе не перепроверялись.

## 1. Вывод

Три изменения, каждое закрывает одно требование и не зависит от остальных по смыслу (по коду они идут друг за другом, потому что правят один файл):

1. **Блок миникарты — сам элемент `v-minimap`.** Сейчас `v-minimap` растянут на весь flow, а блок — внутренний `<canvas>` с размером и позицией в inline-стилях и рамкой, нарисованной в пикселях. Предлагаю: хост и есть блок, все умолчания (позиция, размер, фон) — в CSS с нулевой специфичностью, canvas прозрачный и заполняет хост, рамки нет. Тогда `v-minimap { border: …; border-radius: …; width: … }` работает из любого места, включая стили компонента, в шаблоне которого стоит `<v-minimap>`.
2. **Границы миникарты = границы нод ∪ viewport, как в React Flow.** Прямоугольник viewport по построению всегда внутри миникарты. Маска рисуется поверх нод с «дыркой» на месте viewport (`evenodd`), у дырки есть минимальный размер на экране. Перетаскивание из миникарты становится относительным (дельты), иначе при живом пересчёте масштаба оно неустойчиво.
3. **Стиль ноды — объект `MinimapNodeStyle`** (`background`, `borderColor`, `borderWidth`, `borderRadius`, `selected`) на четырёх уровнях: умолчание библиотеки → вход `[nodeStyle]` у `<v-minimap>` → `withMinimapSettings({ nodeStyles: { <ключ компонента>: … } })` → поле `minimap` на ноде. Цвет — любая строка CSS-цвета, включая `var(--token)`; значения разрешаются через элемент-пробу один раз на смену темы или набора стилей, на кадр это не стоит ничего.

Маска и контур viewport остаются токенами (`--v-minimap-mask`, новый `--v-minimap-viewport`): это части, которые рисует ядро, по ADR-0005 у них по токену. Входов для них не предлагаю.

Бюджет 144 Гц не страдает: кадр камеры остаётся O(1) (очистка, один `drawImage`, одна заливка маски), ноды растеризуются только при изменении графа. Цифры — в разделе 5.5.

## 2. Что миникарта делает сегодня

Файлы: [`minimap.component.ts`](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap.component.ts), [`minimap.component.html`](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap.component.html), [`minimap-canvas.directive.ts`](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts).

### 2.1. Блок и его стили

- Хост `v-minimap` — оверлей на весь flow: `position: absolute; inset: 0; pointer-events: none; z-index: 2` ([minimap.component.ts#L16-L22](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap.component.ts#L16-L22)). Замер на странице документации: хост 646×400 при панели 646×400.
- Видимый блок — `<canvas>` внутри. Размер — 20 % ширины и 20 % высоты flow ([directive#L66-L67](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L66-L67)); `width`, `height`, `left`, `top` пишутся inline в каждом проходе эффекта, отступ 10 px зашит ([#L178-L182](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L178-L182)). Замер: `style="… width: 129.2px; height: 80px; left: 506.8px; top: 310px;"`.
- Рамка нарисована в пикселях canvas: `strokeRect(0.5, 0.5, width - 1, height - 1)` цветом `--v-minimap-mask` ([#L211-L213](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L211-L213)). У элемента `border: 0`, `border-radius: 0`, `background: transparent`.
- Фона у блока нет. Canvas очищается, заливается маской с альфой 0,35, поверх — прямоугольник viewport цветом фона flow ([#L197-L209](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L197-L209)). Замер: в начальном состоянии непрозрачны 39,5 % пикселей (прямоугольник viewport и заливка нод), остальное просвечивает — нода или ребро под миникартой видны сквозь маску.
- Токенов два: `--v-minimap-mask` и `--v-minimap-selected` ([vflow.component.scss#L52-L64](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.scss#L52-L64)). `--v-minimap-mask` — одновременно маска, контур каждой ноды, заливка групп и рамка блока. Заливка нод и прямоугольник viewport берут вычисленный `background-color` корня flow, а если он прозрачный — `--v-background` ([#L76-L92](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L76-L92)).

Что из этого мешает стилизовать блок своим CSS:

| Что мешает                                                            | Следствие                                                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Хост — не блок, а оверлей на весь flow                                | `border`, `border-radius`, `box-shadow` на `v-minimap` обрамляют весь flow                                                                        |
| Блок — `<canvas>` во view компонента библиотеки                       | Стили компонента приложения до него не достают без `::ng-deep`; глобальный `v-minimap canvas` достаёт, но это внутренняя разметка                 |
| Размер и позиция — inline-стили                                       | CSS их не меняет без `!important`; отступ 10 px и доля 20 % зашиты                                                                                |
| Рамка — пиксели, а не `border`                                        | Её нельзя выключить; `border-radius` на canvas обрезает нарисованную квадратную рамку по углам                                                    |
| Фон — не CSS                                                          | `background` на canvas оказывается под маской, а прямоугольник viewport всё равно закрашен цветом из выборки                                      |
| Один токен на маску, контуры нод и рамку                              | Нельзя перекрасить одно без остального                                                                                                            |
| `:host { … }` при эмулированной инкапсуляции — `[_nghost-…]`, (0,1,0) | Правило приложения `v-minimap { … }` (0,0,1) проигрывает умолчаниям; класс приложения (0,1,0) проигрывает по порядку: стили компонента идут позже |

### 2.2. Границы и viewport

Трансформация миникарты — вписывание **только границ нод** в canvas, зум не больше 0,3, без отступа; для пустого графа — `{ x: 0, y: 0, zoom: 0.2 }` ([#L106-L113](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L106-L113)). Камера в неё не входит. Прямоугольник viewport рисуется в этой трансформации где получится ([#L203-L209](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L203-L209)); если он вне canvas, его просто не видно.

Порядок рисования: маска 35 % на весь canvas → прямоугольник viewport цветом фона → кэш нод → рамка. Ноды оказываются **над** маской, то есть ноды вне viewport не приглушаются.

### 2.3. Ноды

Кэш нод — отдельный `<canvas>` в памяти, пересчитывается в `computed` при изменении геометрии, выделения, темы или размера ([#L95-L140](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L95-L140)). Камера его не трогает — это правильная часть, её надо сохранить.

Каждая нода — `roundRect` с радиусом 2 (у группы 5) во flow-единицах, заливка цветом фона flow (у группы — маска с альфой 0,08), контур `lineWidth = 2` тоже **во flow-единицах** ([#L124-L137](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L124-L137)). На демо зум миникарты 0,1174, значит контур — 0,23 CSS-пикселя. Нода внутри viewport — прямоугольник цвета фона на фоне цвета фона с волосяным контуром: на снимке canvas при отдалении до 0,5 (раздел 4, предпоследняя строка таблицы) от нод остаются бледные контуры на сплошном фоне. Выделение — только цвет контура.

### 2.4. Жесты

- Точка указателя переводится во flow-координаты через трансформацию миникарты ([#L217-L227](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L217-L227)) — отображение **абсолютное**.
- Нажатие внутри прямоугольника viewport запоминает смещение захвата; вне его — сразу центрирует viewport на точке ([#L239-L261](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L239-L261)). Движение центрирует на `точка + смещение` ([#L263-L282](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L263-L282)). Указатель захвачен, так что перетаскивание продолжается за пределами canvas.
- Колесо: либо пан (если у flow `panOnScroll` или зажата клавиша пана), либо зум вокруг центра панели на фиксированный множитель `√1.2` за событие, независимо от `deltaY` ([#L307-L344](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L307-L344)).

## 3. React Flow

Источник — `xyflow/xyflow`, `main`, коммит [`29ab9e00`][xy-commit]. Документация — [reactflow.dev/api-reference/components/minimap][rf-minimap] на 2026-11-20. Код читали, не запускали.

### 3.1. Границы

[`MiniMap.tsx#L27-L57`][xy-minimap-bounds]:

```ts
const viewBB = { x: -tx / zoom, y: -ty / zoom, width: width / zoom, height: height / zoom };
boundingRect = hasVisibleNode ? getBoundsOfRects(getInternalNodesBounds(nodeLookup, { filter: (n) => !n.hidden }), viewBB) : viewBB;
```

Границы — объединение границ видимых нод и прямоугольника viewport ([`getBoundsOfRects`][xy-bounds-of-rects] — обычное объединение двух прямоугольников). Без нод границы равны viewport. Отсюда главное свойство: **viewport всегда внутри границ**, потерять его нельзя по построению.

Дальше `viewBox` SVG ([`MiniMap.tsx#L114-L125`][xy-minimap-viewbox]): `viewScale = max(bounds.width / elementWidth, bounds.height / elementHeight)` — сколько flow-единиц в одном пикселе миникарты; границы центрируются, со всех сторон добавляется `offset = offsetScale * viewScale` (по умолчанию 5 экранных пикселей). Верхнего предела масштаба нет. Размер элемента — `style.width` и `style.height` числами, иначе 200×150.

Цена: когда viewport уходит от нод, границы растут и ноды сжимаются; на каждый кадр пана за пределами графа `viewBox` меняется.

### 3.2. Маска

[`MiniMap.tsx#L224-L230`][xy-minimap-mask]: один `<path>` из двух прямоугольников с `fill-rule="evenodd"` — внешний (весь `viewBox` плюс ещё один `offset`) и внутренний (`viewBB`). Маска лежит **после** нод, то есть поверх: ноды вне viewport приглушены, внутри — нет. `pointer-events: none`. Цвет по умолчанию `rgba(240, 240, 240, 0.6)`, в тёмной теме `rgba(60, 60, 60, 0.6)` через `light-dark()`; контур `transparent`, ширина 1 ([`init.css#L16-L22`][xy-css-vars], [`#L364-L403`][xy-css-minimap]). Ширина контура умножается на `viewScale`, чтобы на экране остаться постоянной ([`MiniMap.tsx#L193-L194`][xy-minimap-stroke]).

### 3.3. Ноды

[`MiniMapNodes.tsx#L86-L93`][xy-nodes]: по `<rect>` на ноду, скрытые и с нулевым размером пропускаются. [`MiniMapNode.tsx#L22-L41`][xy-node]: `fill = color || style.background || style.backgroundColor`, `stroke`, `stroke-width`, `rx = ry = borderRadius`; классы `react-flow__minimap-node`, `selected` и пользовательский. Умолчания: заливка `#e2e2e2`, контур `transparent` шириной 2, радиус 5 — всё во flow-единицах. Правила для `.selected` в стилях библиотеки нет (проверены `system/src/styles/*.css` и `react/src/styles/*.css`): выделенная нода по умолчанию выглядит как обычная.

`nodeColor`, `nodeStrokeColor`, `nodeClassName` — строка или функция от ноды ([`types.ts`][xy-types]); `nodeBorderRadius` и `nodeStrokeWidth` — только число на все ноды; `nodeComponent` — свой SVG-компонент вместо `<rect>`.

### 3.4. Пан и зум из миникарты

[`XYMinimap`][xy-xyminimap] вешает `d3-zoom` на SVG.

- **Пан** ([`#L73-L104`][xy-xyminimap-pan]): относительный. На каждое событие берётся дельта экранных координат с прошлого события и умножается на `getViewScale() * zoom` (в коде `Math.max(zoom, Math.log(zoom))`, что при `zoom > 0` всегда `zoom`); результат вычитается из трансляции viewport и проходит через `setViewportConstrained` с `translateExtent` ([`XYPanZoom.ts#L249-L262`][xy-constrained]). `viewScale` читается на каждое событие, поэтому живое изменение границ меняет скорость, но не даёт скачков. Тянуть можно из любой точки миникарты, не только за прямоугольник; есть `inversePan`.
- **Клик не центрирует.** `onClick` — только колбэк приложения с flow-точкой ([`MiniMap.tsx#L162-L167`][xy-minimap-click]).
- **Зум** ([`#L43-L57`][xy-xyminimap-zoom]): `nextZoom = zoom * 2^(-deltaY * k * zoomStep)`, где `k` — 0,002 для пикселей, 0,05 для строк, 1 для страниц, и ×10 при `ctrlKey` на macOS; затем `panZoom.scaleTo(nextZoom)` — зум вокруг центра панели ([`XYPanZoom.ts#L292-L302`][xy-scaleto]). Шаг пропорционален `deltaY`.

Мелочь: в документации и в комментарии типа у `zoomStep` указано умолчание 10, в коде — 1 ([`MiniMap.tsx#L95`][xy-minimap-zoomstep]).

### 3.5. Блок

`<Panel>` — `div` с классами `react-flow__panel`, `react-flow__minimap` и пользовательским `className`, пользовательский `style` на нём же ([`MiniMap.tsx#L185-L202`][xy-minimap-panel]). `position: absolute; z-index: 5; margin: 15px` ([`init.css#L289-L293`][xy-css-panel]), фон — из CSS-переменной, рамки нет. То есть блок у React Flow — обычный элемент, который приложение стилизует классом. Размер CSS-классом не меняется: `width`/`height` SVG — атрибуты из `style`.

Svelte Flow считает то же самое ([`Minimap.svelte#L49-L76`][sv-minimap]), отличия — `width`/`height` отдельными пропсами и `pannable`/`zoomable` включены по умолчанию.

### 3.6. Что переносится на canvas

| React Flow                                             | На canvas                                                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `nodeColor` (строка)                                   | Переносится: `background` в `MinimapNodeStyle`                                                                                                |
| `nodeColor` (функция от ноды)                          | Заменяется данными: стиль по ключу компонента и поле `minimap` на ноде. Функцию не предлагаю, раздел 6                                        |
| `nodeStrokeColor`, `nodeStrokeWidth`                   | Переносятся: `borderColor`, `borderWidth`. Ширина — в пикселях миникарты, а не во flow-единицах (иначе она исчезает, раздел 2.3)              |
| `nodeBorderRadius`                                     | Переносится и становится настройкой на ноду: `borderRadius`                                                                                   |
| `nodeClassName`                                        | **Не переносится**: у пикселей нет классов. Тему дают `var(--token)` в значениях, состояние — подобъект `selected`                            |
| `nodeComponent`                                        | **Не переносится** как компонент. Аналог на canvas — функция рисования `(context, rect) => void`; не предлагаю, раздел 6                      |
| `bgColor`, `style`, `className`                        | Обычный CSS на `v-minimap` (`background`, размер, рамка)                                                                                      |
| `maskColor`, `maskStrokeColor`, `maskStrokeWidth`      | Переносятся токенами `--v-minimap-mask`, `--v-minimap-viewport`; `fill('evenodd')` на canvas есть. Ширину контура оставляю 1 px без настройки |
| Правила CSS на `.react-flow__minimap-node` (`:hover`…) | Не переносятся                                                                                                                                |
| `onClick`, `onNodeClick`                               | Клик по миникарте у нас центрирует viewport. Клик по ноде потребовал бы поиска ноды по точке; не предлагаю                                    |
| `offsetScale`                                          | Константа 5 px, без входа                                                                                                                     |
| `inversePan`, `zoomStep`                               | Не предлагаю                                                                                                                                  |
| `ariaLabel`                                            | Уже есть: `minimapLabel` в `withAccessibility()`                                                                                              |

## 4. Воспроизведение потери viewport

Страница `http://localhost:4200/docs/viewport/minimap`, Playwright из `apps/docs-e2e/node_modules` (Chromium, окно 1280×900, DPR 2). Скрипт читает трансформацию `.v-viewport`, границы нод из DOM, считает прямоугольник viewport на canvas по формуле директивы и для контроля читает пиксели canvas (доля полностью непрозрачных: это прямоугольник viewport и заливка нод; одни ноды дают 8,9 %).

Состояние демо: панель 646×400, canvas 129,2×80, границы нод `0, 0, 1100×290`, зум миникарты 0,1174. По горизонтали граф занимает canvas целиком, запаса нет.

| Шаг                                                               | viewport flow          | Прямоугольник на canvas (x, ширина)     | Видимая доля     | Непрозрачных пикселей |
| ----------------------------------------------------------------- | ---------------------- | --------------------------------------- | ---------------- | --------------------- |
| Начало                                                            | `x -227, zoom 1`       | 26,7; 75,9                              | 100 %            | 39,5 %                |
| Пан панели на 300 px влево                                        | `x -527`               | 61,9; 75,9                              | 88,7 %           | 36,2 %                |
| На 600 px                                                         | `x -827`               | 97,1; 75,9                              | 42,3 %           | 21,1 %                |
| **На 900 px**                                                     | `x -1127`              | 132,4; 75,9 (canvas кончается на 129,2) | **0 %**          | **8,9 %**             |
| Дальше, до `x -4427`                                              | `x -4427`              | 519,9; 75,9                             | 0 %              | 8,9 %                 |
| Зум колесом до минимума (0,5) над центром графа                   | `x 48, y 98, zoom 0.5` | 151,7×94 при canvas 129,2×80            | покрывает canvas | **100 %**             |
| Перетаскивание за прямоугольник в миникарте на 150 px выше canvas | `y 1673, zoom 1`       | —                                       | 0 %              | 8,9 %                 |

Когда именно viewport теряется:

1. **Viewport не пересекает область, которую показывает миникарта.** Она показывает `canvas / зум` flow-единиц вокруг центра границ нод; на демо это `x ∈ [0, 1100]`, `y ∈ [−196, 486]`. Как только прямоугольник viewport целиком вне её, на миникарте только ноды и маска. На демо — после пана на 900 px. Частично он обрезается сразу, как только выходит за границы нод.
2. **Viewport больше этой области.** При отдалении прямоугольник покрывает весь canvas: маски не остаётся, миникарта целиком цвета фона, индикатора нет. На демо — уже на минимальном зуме 0,5.
3. **Перетаскивание в самой миникарте.** Указатель захвачен, отображение абсолютное: увёл указатель за canvas — центр viewport ушёл за показываемую область. Существующий e2e («captures mouse drags outside the overview») именно это и делает.
4. **Пустой граф**: трансформация `{0, 0, 0.2}` при canvas в 20 % от flow показывает ровно первый экран; любой пан дальше экрана теряет viewport.
5. **Большой граф при сильном приближении** (расчёт, не запускали): прямоугольник `canvas × viewport / границы`; при графе 50 000 единиц шириной и viewport 400 это 1–2 пикселя — он на месте, но найти его нельзя.

Вернуться можно только кликом по миникарте (если она `pannable`) или `fitView()`.

Суть скрипта (запускался из временной папки, в репозиторий не положен; `require` разрешается от `apps/docs-e2e/`):

```js
const { chromium } = require('@playwright/test');
const page = await (await chromium.launch()).newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4200/docs/viewport/minimap');
const graph = page.locator('vflow').first();

const state = () =>
  graph.evaluate((element) => {
    const pane = element.querySelector('.v-pane').getBoundingClientRect();
    const canvasElement = element.querySelector('canvas');
    const canvas = canvasElement.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(element.querySelector('.v-viewport')).transform);
    const rects = Array.from(element.querySelectorAll('[data-v-node]'), (node) => node.getBoundingClientRect());
    const toFlow = (value, origin, shift) => (value - origin - shift) / m.a;
    const left = toFlow(Math.min(...rects.map((r) => r.left)), pane.left, m.e);
    const right = toFlow(Math.max(...rects.map((r) => r.right)), pane.left, m.e);
    const top = toFlow(Math.min(...rects.map((r) => r.top)), pane.top, m.f);
    const bottom = toFlow(Math.max(...rects.map((r) => r.bottom)), pane.top, m.f);
    // The transform of minimap-canvas.directive.ts: node bounds only, zoom capped at 0.3.
    const zoom = Math.min(canvas.width / (right - left), canvas.height / (bottom - top), 0.3);
    const x = canvas.width / 2 - ((left + right) / 2) * zoom + (-m.e / m.a) * zoom;
    const y = canvas.height / 2 - ((top + bottom) / 2) * zoom + (-m.f / m.a) * zoom;
    const data = canvasElement.getContext('2d').getImageData(0, 0, canvasElement.width, canvasElement.height).data;
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 255) opaque++;
    return { x, y, width: (pane.width / m.a) * zoom, height: (pane.height / m.a) * zoom, opaque: opaque / (data.length / 4) };
  });

// Pan: press an empty corner of the pane, move by -300 px, release, read state(); repeat.
// Zoom out: 40 × page.mouse.wheel(0, 200) above the centre of the graph.
// Minimap drag: press the centre of the canvas, move 150 px above its top edge, release.
```

## 5. Предложение

### 5.1. Блок

Разметка:

```html
<v-minimap class="v-minimap" data-v-position="bottom-right" role="img" aria-label="Graph minimap">
  <canvas aria-hidden="true"></canvas>
</v-minimap>
```

Стили компонента (эмулированная инкапсуляция остаётся):

```scss
// Zero specificity: any selector of the application wins, `v-minimap { … }` included.
:where(:host) {
  position: absolute;
  z-index: 2;
  margin: 10px;
  width: clamp(120px, 20%, 240px);
  aspect-ratio: 4 / 3;
  background: var(--v-background);
  // Clips the canvas to a border radius set by the application.
  overflow: hidden;
  pointer-events: none;
}

:where(:host[data-v-position^='top']) {
  top: 0;
}
:where(:host[data-v-position^='bottom']) {
  bottom: 0;
}
:where(:host[data-v-position$='left']) {
  left: 0;
}
:where(:host[data-v-position$='right']) {
  right: 0;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

- `:where(:host)` компилятор Angular 20.3.30 превращает в `:where([_nghost-…])` — проверено через `encapsulateStyle` из `@angular/compiler`. Специфичность (0,0,0).
- Рамки нет, `strokeRect` удаляется. Фон — CSS: canvas прозрачный, очищается и ничего не заливает под нодами.
- Размер canvas директива берёт у `ResizeObserver` на самом canvas (один наблюдатель на миникарту, не на ноду), а не из размеров flow. Inline `width`/`height`/`left`/`top` исчезают.
- `pointer-events` остаётся как сейчас: `none` у блока, `auto` у canvas при `pannable` или `zoomable`.
- Вход `position` остаётся и пишет `data-v-position`; приложение может переопределить `inset` или `margin`.

Приложение:

```css
v-minimap {
  width: 240px;
  height: 160px;
  margin: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.12);
}
```

Это работает и в глобальных стилях, и в стилях компонента с `<v-minimap>` в шаблоне: элемент принадлежит шаблону приложения.

### 5.2. Границы, маска, жесты

Трансформация миникарты на каждый кадр камеры:

```ts
const view = getViewportBounds(viewport, flowWidth, flowHeight);
const bounds = nodes.length ? unionOfRects(nodesBounds, view) : view;
const zoom = Math.min((width - 2 * PADDING) / bounds.width, (height - 2 * PADDING) / bounds.height);
const x = width / 2 - (bounds.x + bounds.width / 2) * zoom;
const y = height / 2 - (bounds.y + bounds.height / 2) * zoom;
```

`PADDING` — 5 CSS-пикселей, как `offsetScale` у React Flow. Предел зума 0,3 убирается: масштаб и так ограничен viewport (`zoom ≤ width / (flowWidth / viewport.zoom)`).

Рисование кадра:

```ts
context.clearRect(0, 0, width, height);
context.drawImage(nodesBitmap, dx, dy, dw, dh); // the cached nodes, scaled into the current transform
context.beginPath();
context.rect(0, 0, width, height);
context.rect(hole.x, hole.y, hole.width, hole.height); // the viewport, at least 8×8 CSS px around its centre
context.fillStyle = mask;
context.fill('evenodd');
if (viewportStroke) context.strokeRect(/* hole, on half pixels */);
```

- Маска поверх нод, как у React Flow: ноды вне viewport приглушены. `--v-minimap-mask` становится полным цветом с альфой (сейчас непрозрачный цвет, который код берёт на 35 %).
- Минимальный размер дырки 8×8 px закрывает случай 5 из раздела 4. У React Flow его нет.
- Контур viewport — новый токен `--v-minimap-viewport`, по умолчанию `transparent`, как у React Flow.

**Кэш нод остаётся независимым от камеры.** Он растеризуется в «своей» трансформации — вписывание одних границ нод, как сейчас. Границы объединения всегда не меньше границ нод, значит зум кадра не больше зума кэша: кэш только уменьшается при `drawImage`, никогда не растягивается и не мылится. Плата — контуры нод становятся тоньше, когда viewport далеко от графа (при уменьшении вдвое контур 1 px рисуется как 0,5 px). Перерастеризацию на остановке камеры не предлагаю: это второй путь рисования ради состояния, в котором пользователь смотрит на пустое место.

**Перетаскивание — относительное.** При границах, зависящих от камеры, нынешнее абсолютное отображение неустойчиво: указатель у края → viewport выходит за ноды → границы растут → той же точке canvas соответствует более дальняя flow-точка → следующее движение уносит viewport ещё дальше. Поэтому:

- клик (нажатие без движения дальше `paneClickDistance`) — центрирует на точке, как сейчас: одно событие, обратной связи нет;
- перетаскивание — сдвиг viewport на `дельта указателя / зум миникарты`, зум читается на каждое событие, как `getViewScale()` у React Flow; нажатие вне прямоугольника сначала центрирует, потом тянет;
- смещение захвата больше не хранится: пока масштаб не меняется, относительное движение сохраняет его само.

Следствие, одинаковое с React Flow: если тянуть прямоугольник к краю миникарты, он остаётся у края, а ноды отъезжают и сжимаются. Альтернатива — заморозить масштаб на время перетаскивания — в открытом вопросе 4.

Пан колесом уже относительный и не меняется. Зум колесом остаётся вокруг центра панели.

### 5.3. Стиль ноды: типы

```ts
/**
 * How the minimap draws a node: a rectangle with one corner radius. A color is any CSS color, `var(--token)`
 * included; it is resolved on the `v-minimap` element. A key left out falls through to the level below.
 */
export interface MinimapNodeStyle {
  /** Fill. */
  background?: string;
  /** Color of the outline, drawn when `borderWidth` is above zero. */
  borderColor?: string;
  /** Width of the outline in CSS pixels of the minimap: it does not shrink with the graph. */
  borderWidth?: number;
  /**
   * Corner radius in flow units, the number of the `border-radius` of the node itself. It is limited to half the
   * shorter side, so a large value draws a pill or a circle.
   */
  borderRadius?: number;
  /** Keys that replace the ones above while the node is selected. */
  selected?: Omit<MinimapNodeStyle, 'selected'>;
}

/** App-wide minimap settings, see `withMinimapSettings()`. */
export interface MinimapSettings {
  /** Style of the nodes of a component, by the key it is registered under with `withNodeComponents()`. */
  nodeStyles?: Partial<Record<NodeComponentKey, MinimapNodeStyle>>;
}

export function withMinimapSettings(settings: FeatureValue<MinimapSettings>): VflowFeature<'minimap'>;
```

На ноде:

```ts
export interface Node<T = unknown> {
  // …
  /** How the minimap draws this node, over the style of its component and of the minimap. */
  minimap?: WritableSignal<MinimapNodeStyle>;
}
```

`createNode()` заворачивает значение в сигнал, `toStaticNode()` читает его — как `domAttributes`. Значение — строки и числа, оно сериализуется.

Входы `<v-minimap>`:

| Вход         | Умолчание                                                                                                                                                      | Назначение                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `position`   | `bottom-right`                                                                                                                                                 | Угол; пишет `data-v-position`           |
| `pannable`   | `false`                                                                                                                                                        | Как сейчас                              |
| `zoomable`   | `false`                                                                                                                                                        | Как сейчас                              |
| `nodeStyle`  | `{ background: 'var(--v-minimap-node)', borderWidth: 0, borderRadius: 2, selected: { background: 'var(--v-minimap-selected)' } }`                              | Стиль всех нод без детей                |
| `groupStyle` | `{ background: 'transparent', borderColor: 'var(--v-minimap-node)', borderWidth: 1, borderRadius: 5, selected: { borderColor: 'var(--v-minimap-selected)' } }` | Стиль нод, у которых есть дети (группы) |

Оба входа — объектные настройки с принятой семантикой «умолчания плюс переданные ключи»: `[nodeStyle]="{ borderRadius: 8 }"` меняет только радиус.

Зачем `groupStyle`: группа рисуется под своими детьми, и при одинаковой заливке дети в ней не видны (у React Flow именно так — группа в миникарте сплошной блок). Сегодня ядро уже рисует группы иначе ([#L125-L135](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L125-L135)); вход делает это отличие настраиваемым. Открытый вопрос 3.

Токены (ADR-0005: по токену на часть, которую рисует ядро):

| Токен                  | Умолчание                | Часть                                                    |
| ---------------------- | ------------------------ | -------------------------------------------------------- |
| `--v-minimap-node`     | `rgb(226, 226, 226)`     | Заливка нод и контур групп по умолчанию — новый          |
| `--v-minimap-selected` | `#0f4c75`                | Заливка выделенных нод по умолчанию — был цветом контура |
| `--v-minimap-mask`     | `rgb(240 240 240 / 0.6)` | Маска вне viewport — теперь цвет с альфой                |
| `--v-minimap-viewport` | `transparent`            | Контур viewport, 1 px — новый                            |

Фон блока — не токен, а `background` на `v-minimap` (по умолчанию `var(--v-background)`). В `@media (forced-colors: active)` и в отображении `@vflow/ui` (`libs/ui/src/vflow-ui.css`, шаблон в `libs/cli`) добавляются новые токены.

### 5.4. Уровни и приоритет

От слабого к сильному, слияние по ключам (`undefined` и пропущенный ключ уходят на уровень ниже):

1. умолчание библиотеки — для обычной ноды или для группы;
2. вход `[nodeStyle]` или `[groupStyle]` этой миникарты;
3. `withMinimapSettings().nodeStyles[key]`, где `key` — строка в `node.component`;
4. `node.minimap()`.

Если нода выделена, поверх результата кладётся `selected`, слитый по тем же четырём уровням. Состояние сильнее базового стиля любого уровня: нода с `minimap: { background: 'red' }` при выделении рисуется с `selected.background` умолчания, пока сама не задаст `minimap.selected`.

Аналогия с CSS: универсальный селектор → селектор типа → inline-стиль → псевдокласс состояния.

Ключи `nodeStyles` — только строки, зарегистрированные через `withNodeComponents()`. Нода, у которой `component` — класс или фабрика, ключа не имеет: для неё работают уровни 1, 2 и 4. Шаблонные ноды (`*vNode`) — так же. `nodeStyles` типизирован `NodeComponentKey`, поэтому приложение, которое дополнило `VflowNodeComponents`, получает ошибку компиляции на опечатке; в dev-режиме ключ, которого нет в реестре компонентов, даёт предупреждение. `withMinimapSettings()` ближе к flow добавляет свои ключи к уровню выше (слияние `nodeStyles` по ключам через параметр `merge` у `provideMergedFeatureValue`).

Использование:

```ts
// app.config.ts
provideVflow(
  withNodeComponents({ task: TaskNode, decision: DecisionNode, group: GroupNode }),
  withMinimapSettings({
    nodeStyles: {
      task: { background: 'var(--task)' },
      decision: { background: 'var(--decision)', borderRadius: 999 },
      group: { borderColor: 'var(--border)' },
    },
  }),
);
```

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap [pannable]="true" [zoomable]="true" [nodeStyle]="{ borderRadius: 8 }" />
</vflow>
```

```ts
createNodes([
  { id: 'draft', component: 'task', point: { x: 0, y: 0 }, data: { title: 'Draft' } },
  {
    id: 'failed',
    component: 'task',
    point: { x: 240, y: 0 },
    data: { title: 'Publish' },
    minimap: { background: 'var(--danger)', borderColor: 'var(--danger-strong)', borderWidth: 1 },
  },
]);

// Later: the node is a signal like every other field.
node.minimap?.set({ background: 'var(--success)' });
```

```css
v-minimap {
  border: 1px solid var(--border);
  border-radius: 8px;
  --v-minimap-mask: rgb(0 0 0 / 0.08);
  --v-minimap-viewport: var(--accent);
}
```

### 5.5. Цвета, тема и стоимость

**Значение цвета — любая строка CSS-цвета**, включая `var(--token)`, `var(--token, #ccc)`, `light-dark()`, `color-mix()`, `currentColor`, системные цвета. Голое имя `--token` без `var()` не принимается: `var()` уже даёт запасное значение и не требует второго синтаксиса.

Canvas таких строк не понимает: `fillStyle = 'var(--a)'` и `'color-mix(…, var(--a))'` молча игнорируются (проверено в Chromium). Поэтому значения разрешаются через **пробу** — скрытый элемент внутри `v-minimap`: `probe.style.color = value`, затем `getComputedStyle(probe).color`. Проверено в Chromium: `var(--a)` при `--a: light-dark(#fff, #000)` → `rgb(255, 255, 255)`; `color-mix(in oklch, red 30%, var(--a))` → `oklch(0.888 0.077 29.2)`; `Highlight`, `currentColor`, `rgb(1 2 3 / 0.5)` — тоже; все полученные строки canvas принимает как `fillStyle`.

Проба заменяет нынешнее чтение `getPropertyValue('--v-…')`, которое работает только для зарегистрированных через `@property` токенов, и служит одним путём для токенов маски, контура viewport и значений нод. Разрешение идёт на `v-minimap`, поэтому токен можно задать на самой миникарте, на `vflow` или на любом предке, а `currentColor` — это `color` миникарты.

Когда пересчитывается: кэш `строка → разрешённый цвет` сбрасывается (а) при появлении новой строки в стилях и (б) при смене темы — тем же сигналом, что и сейчас: `MutationObserver` на атрибутах предков и `prefers-color-scheme` ([#L148-L158](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L148-L158)). Различных строк в приложении единицы или десятки — по числу типов нод, а не нод. Ограничение то же, что и сегодня: правка одного лишь stylesheet не наблюдается.

Стоимость, замеры в headless Chromium на этой машине, синтетика вне директивы (canvas 400×300 пикселей, то есть 200×150 при DPR 2):

| Операция                                                                         | Время                |
| -------------------------------------------------------------------------------- | -------------------- |
| Разрешение одного цвета через пробу                                              | ~0,003 мс            |
| Кадр камеры: `clearRect` + `drawImage` кэша + маска `evenodd` + контур           | 0,2 мс               |
| Растеризация нод, как сейчас (`fill` и `stroke` на каждую), 1000 / 5000 / 20 000 | 3,0 / 14,4 / 54,8 мс |
| Растеризация пакетами: один путь и одна заливка на стиль, 4 стиля                | 0,6 / 2,4 / 8,9 мс   |

Бюджет кадра при 144 Гц — 6,9 мс. Выводы:

- На кадр камеры разрешение цветов не стоит ничего, рисование — около 0,2 мс и не зависит от числа нод. Перерисовывать ноды на каждый кадр камеры (вариант «без кэша») нельзя: 5000 нод — уже 14 мс.
- Растеризация должна группировать ноды по итоговому стилю и рисовать группу одним путём: это в шесть раз дешевле и важно при перетаскивании ноды, когда кэш пересчитывается каждый кадр. Итоговый стиль для ключа компонента считается один раз (`computed` от входов и фичи), а не на ноду; объединение на ноду нужно только тем, у кого есть `minimap`.
- Ноды читаются в одном `computed`, как сейчас; хуков после рендера на ноду и чтений сигналов в host-привязках сущностей не появляется.

### 5.6. Что ещё стоит починить заодно

По убыванию пользы, отдельно от пяти требований:

1. **Пакетная растеризация по стилю** (таблица выше). Сегодня перетаскивание одной ноды перерисовывает все ноды поштучно каждый кадр; на 5000 нодах это вдвое больше бюджета.
2. **DPR.** Коэффициент обновляется только по `window.resize` ([#L144](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L144), [#L159](../../libs/ngx-vflow/src/lib/vflow/public-components/minimap/minimap-canvas.directive.ts#L159)); перенос окна на монитор с другой плотностью без изменения размера оставляет старый. `ResizeObserver` с `device-pixel-content-box`, который и так нужен для раздела 5.1, даёт точный размер в пикселях устройства и реагирует на смену плотности.
3. **До первой раскладки.** Эффект рисует, пока хост скрыт `data-v-pending`, причём с заглушками размеров 100×50 у ещё не измеренных нод. Рисовать после `flowInitialized`.
4. **Зум колесом** — фиксированный множитель на событие, скорость на трекпаде зависит от частоты событий. Сделать шаг пропорциональным `deltaY`, как у панели flow и у React Flow.
5. **Доступность.** `role="img"` с `aria-label` на блоке и `aria-hidden` на canvas — корректно, менять не надо. Навигации с клавиатуры в миникарте нет; она дублировала бы клавиши самого flow, поэтому оставить и продолжать указывать в справочнике.

## 6. Отвергнутые варианты

- **SVG или DOM-ноды.** Исключено требованием 4.
- **Ограничивать пан, чтобы viewport не уходил от нод (`translateExtent`).** Меняет поведение самого flow ради миникарты и не закрывает отдаление.
- **Прижимать прямоугольник viewport к краю миникарты, не меняя границ.** Не теряется, но врёт о положении и ничего не даёт при отдалении, когда viewport больше графа.
- **Функция `(node) => MinimapNodeStyle` на входе, как `nodeColor` у React Flow.** Третий механизм рядом с двумя заказанными; функция не сериализуется и вызывается на каждую ноду при каждой растеризации. Если понадобится стиль от данных, приложение пишет `node.minimap`. Добавить позже можно без поломок.
- **Стиль на классе компонента ноды (статическое поле или декоратор).** Не работает с ленивыми фабриками `() => import(…)`: класс неизвестен, пока нода не дошла до viewport.
- **Ключи `nodeStyles` — классы компонентов.** Тот же довод, плюс второй способ адресации рядом с ключами; автор разрешил только ключи.
- **Функция рисования `(context, node) => void` (аналог `nodeComponent`).** Ломает пакетную растеризацию и отдаёт наружу трансформацию и DPR. Требование — минимальная стилизация.
- **Входы `maskColor`, `maskStrokeColor`, `bgColor`.** Это цвета темы; токены и CSS уже следуют теме, вход дублировал бы их.
- **Голые имена токенов (`'--task'`) вместо `var(--task)`.** Второй синтаксис без выгоды.
- **Цветовые «тона» в ядре** (`tone: 'accent'`). Уже откатывали: цветом владеет дизайн-система приложения.
- **`ViewEncapsulation.None` для миникарты.** Не нужен: `:where(:host)` даёт нулевую специфичность при обычной инкапсуляции.

## 7. План по тикетам

Все тикеты правят `minimap-canvas.directive.ts`, поэтому идут по очереди.

1. **Блок.** Хост — блок, стили `:where(:host)`, `data-v-position`, `ResizeObserver` на canvas, прозрачный canvas, удаление рамки и inline-геометрии; пункты 2 и 3 раздела 5.6. Тесты: `minimap-navigation.spec.ts`, `stacking-context.spec.ts`, `node-dom/flow.spec.ts`, `server/flow.spec.ts`; e2e `minimap-navigation.spec.ts` (геометрия считается от canvas — формулы останутся, изменятся размеры).
2. **Границы и жесты.** Объединение с viewport, отступ, маска `evenodd` поверх нод, минимальный размер дырки, масштабируемый `drawImage` кэша, относительное перетаскивание. Тесты: юнит «preserves the grab offset…» и все три e2e выводят ожидаемую геометрию из `min(canvas / границы нод, 0.3)` — переписать на объединение; новый e2e «viewport остаётся на миникарте» по таблице раздела 4.
3. **Стиль нод.** `MinimapNodeStyle`, входы `nodeStyle` и `groupStyle`, проба и кэш цветов, пакетная растеризация, порядок «родители раньше детей», токены `--v-minimap-node`, `--v-minimap-viewport`, альфа в `--v-minimap-mask`; `forced-colors`; `libs/ui/src/vflow-ui.css` и `libs/cli/src/steps/templates/vflow-ui.css`.
4. **Уровни.** `Node.minimap` (`createNode`, `toStaticNode`), `withMinimapSettings()` (`features/with-minimap-settings.ts`, токен, слияние `nodeStyles`, dev-предупреждение о неизвестном ключе), экспорт в `public-api.ts`.
5. **Документация.** Страница `docs/viewport/minimap` (стилизация блока, стиль нод, демо с типами), `reference/viewport#minimap`, `reference/styling` (токены), `getting-started/configuration` (фича), `getting-started/migration` (рамка убрана, размер по умолчанию, `--v-minimap-mask` с альфой, `--v-minimap-selected` — заливка), таблица токенов в `packages/ui/overview`.
6. **По желанию:** зум колесом пропорционально `deltaY` (пункт 4 раздела 5.6).

## 8. Открытые вопросы

1. **Размер блока по умолчанию.** Предлагаю `width: clamp(120px, 20%, 240px); aspect-ratio: 4 / 3`. Варианты: фиксированные 200×150, как у React Flow; 20 % × 20 % flow, как сейчас (пропорции flow, на узком flow блок крошечный).
2. **Имена.** (а) `background` против `color` для заливки: `background` — имя из CSS, `color` в CSS — цвет текста. (б) Форма фичи: `withMinimapSettings({ nodeStyles: { task: … } })` оставляет место для других настроек; буквальное прочтение вашей формулировки — отображение сразу аргументом, `withMinimapSettings({ task: … })`.
3. **Группы.** Оставить отдельный вход `groupStyle` с умолчанием «только контур» или убрать особый случай: тогда группа рисуется как обычная нода, а отличие задаётся ключом её компонента.
4. **Перетаскивание в миникарте.** Живой пересчёт масштаба, как у React Flow (прямоугольник упирается в край, ноды отъезжают), или заморозить масштаб на время перетаскивания и пересчитать на отпускании (прямоугольник остаётся под указателем, но при отпускании картинка перестраивается скачком).
5. **Контур viewport по умолчанию.** `transparent`, как у React Flow, или видимый цвет. И подходит ли минимальный размер дырки 8×8 px.
6. **Умолчания цветов.** Значения `--v-minimap-node` и `--v-minimap-mask` в таблице взяты у React Flow как отправная точка; выделение по умолчанию — заливка `--v-minimap-selected`. Подтвердить или дать свои.
7. **Вход `position`.** Оставить (предлагаю) или убрать в пользу чистого CSS.

## 9. Что не проверено

- Предложение не реализовано и не прототипировано в директиве. Замеры раздела 5.5 — синтетика в headless Chromium, а не профиль flow с миникартой; под нагрузкой 144 Гц с включённой миникартой не мерили.
- React Flow прочитан по исходникам на `29ab9e00`, не запускался. Из документации прочитана только страница API `MiniMap`.
- Только Chromium. В Safari и Firefox не проверены: `device-pixel-content-box` у `ResizeObserver` (в Safari его нет, нужен запасной путь `contentRect × devicePixelRatio`), приём canvas-ом строк `oklch(…)` из `getComputedStyle`, `roundRect`.
- `:where(:host)` проверен вызовом `encapsulateStyle` компилятора 20.3.30, а не в собранном приложении; на Angular 21 и 22 не проверен.
- Невалидное значение цвета: проба молча наследует `color`. Как отличать это от валидного значения для dev-предупреждения, не проработано.
- Порядок `FlowEntitiesService.nodes()` относительно родителей и детей не смотрели; для групп нужен порядок «родители раньше».
- Поведение с виртуализацией: ноды, которые ни разу не измерены, имеют размер-заглушку 100×50 и так же попадут в границы. Это есть и сегодня.
- Случай 5 раздела 4 (большой граф, прямоугольник в 1–2 px) — расчёт, не запуск.
- Два теста `apps/docs-e2e/minimap-navigation.spec.ts`, падающие на текущей базе, не перезапускались.

## 10. Дополнение после ответов автора

### 10.1. Группы без отдельного входа

Группа рисуется под своими детьми. Если у неё та же заливка, что у детей, детей не видно, поэтому умолчание для группы — контур без заливки. Чтобы один вход `nodeStyle` не превращал группы в сплошные блоки, группа — **контурный вариант того же стиля**:

```ts
// After the library default and [nodeStyle] are merged, for a node with children:
const group = {
  ...style,
  background: 'transparent',
  borderColor: style.background,
  borderWidth: Math.max(style.borderWidth ?? 0, 1),
  selected: { borderColor: style.selected?.background },
};
```

Уровни для группы: умолчание библиотеки → `[nodeStyle]` → контурное преобразование → `nodeStyles[key]` → `node.minimap`. Следствия:

- `[nodeStyle]="{ background: 'var(--muted)' }"` красит обычные ноды заливкой, а группы — контуром того же цвета; токен `--v-minimap-node` работает так же.
- Приложение, которому нужна группа с заливкой, задаёт её явно по ключу компонента группы или на ноде: `nodeStyles: { group: { background: 'rgb(0 0 0 / 0.05)' } }`. Явные уровни преобразование не трогает.
- Порядок рисования — родители раньше детей (в разделе 9 отмечено, что порядок `nodes()` не проверен).

Более простой вариант — отдельное умолчание библиотеки для группы ниже входа — отвергнут: тогда `[nodeStyle]="{ background }"` заливает и группы, и дети в них пропадают.

### 10.2. Выделение: что значит «заливка»

Сегодня у каждой ноды в миникарте есть контур, и выделение меняет его цвет на `--v-minimap-selected`. В предложении у ноды по умолчанию контура нет (только цвет, рамка — по желанию), поэтому выделение надо показать иначе. Два варианта умолчания для `selected`:

| Вариант                  | `selected` по умолчанию                                        | Как выглядит                                                               |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Заливка** (предложено) | `{ background: 'var(--v-minimap-selected)' }`                  | Выделенная нода целиком цвета акцента                                      |
| Контур                   | `{ borderColor: 'var(--v-minimap-selected)', borderWidth: 2 }` | Нода сохраняет свой цвет (тип остаётся виден), вокруг — рамка акцента 2 px |

Довод за заливку: нода в миникарте — 10–15 пикселей, залитый прямоугольник заметнее рамки. Довод за контур: при цветах по типу ноды выделение не стирает цвет типа. Приложение меняет это одним ключом на любом уровне; вопрос только в умолчании.

### 10.3. Размещение у края flow: `vPanel`

**Что есть сегодня.** Всё содержимое `<vflow>`, кроме шаблонов, попадает в `.v-content-layer` — слой на весь flow над панелью ([vflow.component.html#L91-L92](../../libs/ngx-vflow/src/lib/vflow/components/vflow/vflow.component.html#L91-L92)). Положение элемента — дело приложения: в документации каждое демо пишет `<vui-controls class="absolute bottom-2.5 left-2.5" />` (10 мест), страница «Controlling the viewport» — `host: { class: 'absolute top-2 right-2' }`. Миникарта считает свой угол сама.

**Предложение.** Одна директива-атрибут на любой элемент внутри `<vflow>`:

```ts
export type PanelPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Places the element against a corner or a side of the flow, above the pane. It only positions: the look, the size
 * and the content are the element's own.
 */
@Directive({ selector: '[vPanel]', host: { '[attr.data-v-panel]': 'vPanel()' } })
export class VflowPanelDirective {
  public readonly vPanel = input.required<PanelPosition | null>();
}
```

```html
<vflow [nodes]="nodes" [edges]="edges">
  <v-minimap vPanel="bottom-right" [pannable]="true" />
  <vui-controls vPanel="bottom-left" />
  <div vPanel="top-center" vuiToolbar>…</div>
  <app-legend [vPanel]="legendCorner()" />
</vflow>
```

Стили — в стилях `vflow`, с нулевой специфичностью, чтобы CSS приложения побеждал:

```scss
::ng-deep :where([data-v-panel]) {
  position: absolute;
  margin: var(--v-panel-offset, 10px);
}
::ng-deep :where([data-v-panel^='top']) {
  top: 0;
}
::ng-deep :where([data-v-panel^='bottom']) {
  bottom: 0;
}
::ng-deep :where([data-v-panel$='left']) {
  left: 0;
}
::ng-deep :where([data-v-panel$='right']) {
  right: 0;
}
::ng-deep :where([data-v-panel$='-center']) {
  left: 50%;
  translate: -50% 0;
}
::ng-deep :where([data-v-panel^='center-']) {
  top: 50%;
  translate: 0 -50%;
}
```

- Директива ничего не считает в JS: один атрибут и CSS. Отступ от края — токен `--v-panel-offset` (10 px, как `--v-node-toolbar-offset`); приложение может переопределить и `margin`, и `inset` обычным CSS.
- `null` снимает размещение: элемент остаётся в потоке своего контейнера.
- Работает для элемента, чей содержащий блок — flow: прямой ребёнок `<vflow>` или элемент внутри обёртки без собственного позиционирования. Внутри ноды директива не нужна и в dev-режиме должна об этом сказать.
- Два элемента в одном углу накладываются, как панели React Flow ([`init.css#L289-L325`][xy-css-panel-all]). Чтобы поставить их рядом, приложение оборачивает их в один элемент с `vPanel` и раскладывает своим CSS.

**Миникарта.** Входа `position` нет, из стилей хоста уходят `position: absolute` и углы: `v-minimap` — обычный блок. Отдельный слот `<ng-content select="v-minimap" />` в шаблоне `vflow` становится не нужен, миникарта идёт в общий слой содержимого. Остаётся один выбор:

- (а) **`<v-minimap />` без атрибута стоит в правом нижнем углу** (предлагаю): компонент несёт `VflowPanelDirective` как host-директиву с умолчанием `bottom-right`, `vPanel="top-left"` меняет угол, `[vPanel]="null"` отдаёт размещение приложению. Так же устроены `MiniMap` и `Controls` у React Flow: панель внутри, угол по умолчанию.
- (б) без `vPanel` миникарта не размещается вовсе: один механизм без скрытого умолчания, но `<v-minimap />` из каждого примера оказывается в левом верхнем углу без отступа.

`vui-controls` умолчания не получает («positioning is yours» остаётся), в демо `class="absolute bottom-2.5 left-2.5"` заменяется на `vPanel="bottom-left"`.

**Имя.** Кандидаты:

| Имя                              | За                                                                                                                       | Против                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **`vPanel`** (предлагаю)         | То же слово у React Flow и Svelte Flow (`<Panel position>`); пара к `*vPortal`: портал — на холсте, панель — поверх flow | «Панель» звучит как контейнер с оформлением, а директива только размещает                                              |
| `vOverlay`                       | Слово автора; точно описывает слой                                                                                       | В Angular «overlay» — это CDK Overlay (всплывающие слои); в ядре уже есть внутренний `.v-overlay-svg` с другим смыслом |
| `vDock`                          | Говорит ровно «прижать к краю»                                                                                           | Не встречается в библиотеках этого жанра                                                                               |
| `vOverlayBottomRight` и ещё семь | Читается без значения                                                                                                    | Восемь директив вместо одной; угол нельзя привязать к сигналу                                                          |

Значения позиций — как у React Flow (`top-center`, `center-left`), чтобы не вводить второй словарь; тип `MinimapPosition` удаляется.

**Тикеты.** В плане раздела 7 перед тикетом 1 появляется тикет 0 «`vPanel`»: директива, стили, токен `--v-panel-offset`, экспорт, страница документации, замена `absolute …` в демо. В тикете 1 у миникарты убираются `position`, `data-v-position` и слот проекции.

**Не проверено:** `::ng-deep :where(…)` в стилях `vflow` через компилятор не прогоняли (проверен только `:where(:host)`); правило `.v-content-layer > * { pointer-events: auto }` сильнее `pointer-events: none` из `:where(:host)` миникарты — для миникарты только для чтения это надо развести при реализации.

## 11. Предложение: стиль по данным и для шаблонных нод

Оба случая закрывает одно добавление в `withMinimapSettings()`. Два варианта.

### Вариант Б (рекомендую): именованные стили и функция, которая их выбирает

```ts
export interface MinimapSettings<N extends Node = Node> {
  /** Styles by name: the key of a node component, or a name the application returns from `nodeStyleKeys`. */
  nodeStyles?: Partial<Record<string, MinimapNodeStyle>>;
  /**
   * The names of the styles of a node besides the one of its component, later over earlier. Signals read here are
   * followed: the minimap repaints when they change.
   */
  nodeStyleKeys?: (node: N) => string | readonly string[] | undefined;
}
```

```ts
withMinimapSettings<Node<StepData>>({
  nodeStyles: {
    task: { background: 'var(--task)' }, // a component key, as today
    input: { background: 'var(--input)' }, // names of the application
    output: { background: 'var(--output)' },
    failed: { borderColor: 'var(--danger)', borderWidth: 2 },
  },
  // Template nodes by their kind; any node by its state.
  nodeStyleKeys: (node) => [node.data?.().kind, node.data?.().failed ? 'failed' : undefined].filter(Boolean),
});
```

Порядок: умолчание (нода или группа) → стиль ключа компонента → стили возвращённых имён по порядку. Это аналог CSS-классов (и `nodeClassName` у React Flow): стили остаются статичными объектами в конфигурации, функция только называет их.

- Набор стилей конечен по построению: число проб цветов и путей ограничено числом имён, слабое место 4 не открывается.
- Дёшево: строка на ноду при перестройке путей, слитый стиль запоминается на сочетание имён.
- Ограничение: стиль нельзя вычислить из непрерывного значения (тепловая карта) — только выбрать из названных.
- Предупреждение dev-режима меняется: не «ключ не зарегистрирован как компонент», а «функция вернула имя, которого нет в `nodeStyles`».

### Вариант А: правило-функция, возвращающая стиль

```ts
type MinimapNodeStyleRule<N> = MinimapNodeStyle | ((node: N) => MinimapNodeStyle | undefined);

export interface MinimapSettings<N extends Node = Node> {
  /** Every node, under the styles by component. */
  nodeStyle?: MinimapNodeStyleRule<N>;
  nodeStyles?: Partial<Record<NodeComponentKey, MinimapNodeStyleRule<N>>>;
}
```

```ts
withMinimapSettings<Node<StepData>>({
  nodeStyle: (node) => KIND_STYLES[node.data?.().kind],
  nodeStyles: {
    job: (node) => ({ background: node.data?.().failed ? 'var(--danger)' : 'var(--job)' }),
  },
});
```

Гибче (любой стиль из любых данных, включая общий стиль всех нод объектом), но: объект на ноду при каждой перестройке путей, число различных цветов ничем не ограничено, два почти одинаковых имени `nodeStyle` / `nodeStyles`, а функции разных уровней инжектора нельзя слить по ключам, только заменить.

### Общее для обоих

- Функция получает объект `Node` приложения (как концы в валидаторе соединений), тип данных задаётся параметром `withMinimapSettings<N>()`.
- Любой сигнал, прочитанный в функции, становится зависимостью всех путей: изменение `data` одной ноды перестраивает пути всех (около 0,8 мс на 5000 нод по синтетике).
- Выделение снова можно показать, если приложение держит сигнал `selected` на ноде: функция читает его сама.

[xy-commit]: https://github.com/xyflow/xyflow/tree/29ab9e001c2ba320c9d84b00c729c745132d9145
[xy-css-panel-all]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/styles/init.css#L289-L325
[rf-minimap]: https://reactflow.dev/api-reference/components/minimap
[xy-minimap-bounds]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L27-L57
[xy-minimap-viewbox]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L114-L125
[xy-minimap-mask]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L224-L230
[xy-minimap-stroke]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L193-L194
[xy-minimap-click]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L162-L167
[xy-minimap-zoomstep]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L95
[xy-minimap-panel]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMap.tsx#L185-L202
[xy-nodes]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMapNodes.tsx#L86-L93
[xy-node]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/MiniMapNode.tsx#L22-L41
[xy-types]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/react/src/additional-components/MiniMap/types.ts
[xy-xyminimap]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xyminimap/index.ts
[xy-xyminimap-zoom]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xyminimap/index.ts#L43-L57
[xy-xyminimap-pan]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xyminimap/index.ts#L73-L104
[xy-constrained]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xypanzoom/XYPanZoom.ts#L249-L262
[xy-scaleto]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/xypanzoom/XYPanZoom.ts#L292-L302
[xy-bounds-of-rects]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/utils/general.ts#L80-L128
[xy-css-vars]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/styles/init.css#L16-L22
[xy-css-panel]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/styles/init.css#L289-L293
[xy-css-minimap]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/system/src/styles/init.css#L364-L403
[sv-minimap]: https://github.com/xyflow/xyflow/blob/29ab9e001c2ba320c9d84b00c729c745132d9145/packages/svelte/src/lib/plugins/Minimap/Minimap.svelte#L49-L76
