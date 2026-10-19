# Аудит токенов `vflow-ui.css`: что отдавать потребителю

Дата: 2026-10-19. Объект: `libs/ui/src/vflow-ui.css` и его использование в `libs/ui/src/lib/*.ts`.

## Вывод

Набор в целом устроен по общепринятой схеме «несколько ключевых значений → всё остальное выводится», и большая часть уже на своём месте. Менять стоит немного:

1. **`--vui-separator` вывести из `--vui-border`.** Сейчас это буквально border с 50% прозрачности в обеих темах, но объявлено как самостоятельное значение темы.
2. **Motion (`--vui-duration`, `--vui-ease`) не объявлять.** `--vui-ease` — это ровно ключевое слово `ease`, а Tailwind в приложении уже задаёт длительность и кривую переходов по умолчанию.
3. **`--tracking-vui-normal` убрать.** Шрифт мы берём у приложения, а вот letter-spacing, подобранный под этот шрифт, сбрасываем — это непоследовательно.
4. **Семь цветов имеют два публичных имени** (`--vui-surface` и `--v-surface` и т.д.), и локальное переопределение одного не доходит до другого. Это главный структурный вопрос, ниже два варианта решения.
5. **«Полагаться на приложение» стоит через генератор, а не через сами токены:** шаг `ensureUiTokens` может найти токены shadcn/spartan в stylesheet и записать `--vui-accent: var(--primary)` вместо литералов. Так делают Clerk (тема `shadcn`) и React Flow UI (сразу пишет `bg-card`).

Остальное — шкалы, производные цвета, part-константы — оставить как есть.

## Как понимать «отдавать потребителю» при copy-in

Файл копируется в репозиторий, поэтому отредактировать потребитель может что угодно. Вопрос на самом деле в том, **какой механизм у значения**. Вариантов четыре:

| Категория                | Механизм в нашем файле                                                     | Что получает потребитель                                                                 |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Публичная ручка**      | `--vui-*` в `:root` / `[data-vui-theme]`                                   | Переопределение в runtime и на любом поддереве (`@theme inline` пересчитывает utilities) |
| **Берётся у приложения** | Наследование (`font-family`, `color-scheme`), defaults Tailwind приложения | Ничего настраивать не нужно: части следуют настройкам приложения                         |
| **Внутренняя константа** | Литерал или выражение в `@theme inline`; в runtime переменной нет          | Только правка файла; документировать как контракт не нужно                               |
| **Не объявлять**         | Токена нет                                                                 | Браузерный или Tailwind default                                                          |

Каждая публичная ручка — это обещание: её надо документировать, держать совместимой и проверять в обеих темах. Поэтому все практики ниже сходятся в одном: ручек мало, выводов много.

## Практики

### Общие ДС на токенах

- **Три уровня: primitive → semantic → component** (DTCG, Material 3, Spectrum, Primer). Потребителю отдают semantic, component-токены — только в больших системах (Material `*-overrides` mixins, PrimeNG presets). ADR-0005 уже отказался от каталога component-токенов, и встраиваемые системы ниже поступают так же.
- **Несколько ключевых значений + вывод остальных.** AG Grid: «a few key colour parameters that most applications will set», остальное — mix из `backgroundColor`/`foregroundColor`/`accentColor` (`{ ref, mix, onto }`). Clerk строит оттенки через `color-mix()` и relative color syntax. Наши `accent-hover`, `fill-*`, `tone-ink`, `halo` — та же идея.
- **Pseudo-private (`--_x`)** у Lea Verou: публичное `--x` читается один раз во внутреннее `--_x`, а список публичных `--` и есть styling API компонента. У нас эту роль играет `@theme inline`: публичное — только то, что лежит в `:root`/тема.

### Встраиваемые специализированные ДС (самое близкое к нам)

| Система                                      | Публичные ручки                                                                                                                                                                    | Что выводится / берётся у приложения                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Stripe Elements** (Appearance)             | «Commonly used»: `fontFamily`, `fontSizeBase`, `spacingUnit`, `borderRadius`, `colorPrimary`, `colorBackground`, `colorText`, `colorDanger`; длинный хвост «less common» + `rules` | Размеры шрифта — от `fontSizeBase`, отступы — от `spacingUnit`, кнопки по умолчанию от `colorPrimary`                                     |
| **Clerk** (`variables`)                      | 24 ключа: primary/+foreground, background, foreground, muted/+foreground, neutral, danger/success/warning, ring, shadow, `fontSize`, `borderRadius`, `spacing`                     | Оттенки нейтрали из `colorNeutral`; принимает `var(--brand)`; есть готовая тема `shadcn`, маппящая на переменные shadcn                   |
| **Liveblocks** (`--lb-*`, 21 шт.)            | `--lb-radius`, `--lb-spacing` (шкалы), accent/destructive/background/foreground + `-foreground` пары, transition duration/easing, 3 тени                                           | Оттенки через `--lb-*-contrast`; `--lb-button-radius` = 0.75 × radius; тёмная тема — отдельный файл: media query **или** атрибуты/`.dark` |
| **React Flow** (`--xy-*`)                    | Компонентные: `--xy-node-background-color`, `--xy-handle-border-color`, `--xy-controls-button-*`…                                                                                  | Пара `--xy-x` (пользователь) → `--xy-x-default` (библиотека), тёмная тема переопределяет `-default`                                       |
| **React Flow UI** (copy-in, shadcn registry) | Своих токенов нет                                                                                                                                                                  | Пишет прямо на токенах shadcn приложения: `bg-card text-card-foreground border rounded-md`                                                |
| **shadcn/ui**                                | `--background`…`--ring`, `--radius`; для специализированных областей — свои пространства `--sidebar-*`, `--chart-*`                                                                | Новый токен: `:root` + `.dark` + `@theme inline` — ровно наша схема                                                                       |
| **Web Awesome**                              | `--wa-space-scale` — глобальный множитель всех отступов                                                                                                                            | Шкала отступов выводится из множителя                                                                                                     |

Что из этого следует для нас:

- **Шкалы-множители** (`spacingUnit`, `--lb-spacing`, `--wa-space-scale`, `borderRadius`, `fontSizeBase`) есть у всех встраиваемых систем. Наши `--vui-space`, `--vui-radius`, `--vui-font-size` — то же самое, оставляем.
- **Цветовое ядро** у всех почти одинаковое: accent + текст на нём, background/surface, foreground, muted, danger; success/warning есть у Stripe и Clerk. Наш набор того же размера.
- **Есть две стратегии.** React Flow UI и вся экосистема shadcn-registry (AI Elements и т.п.) своих токенов не объявляют и предполагают, что в приложении стоит тема shadcn. Stripe, Clerk и Liveblocks держат своё маленькое пространство и дают **адаптер** к теме приложения (Clerk: `@clerk/ui/themes` → `shadcn`). Мы уже выбрали своё пространство `vui` (спека, раздел про `@theme inline`: не всякое приложение на shadcn-именах). Значит, нам подходит вторая стратегия, и адаптер естественно делать в генераторе — файл всё равно пишет он.
- **Тёмную тему** встраиваемые системы подключают к механизму приложения (Liveblocks: media query или `.dark`/`data-theme`; React Flow: `colorMode="system"`). У нас — только собственный атрибут `data-vui-theme`.
- **Motion** публичным делает только Liveblocks. shadcn-компоненты пишут `transition-*` без длительности и полагаются на Tailwind default приложения.

## По каждому токену

Легенда: **П** — публичная ручка, **А** — берётся у приложения, **В** — внутренняя константа/вывод, **—** — не объявлять.

### Базовые значения (`:root`)

| Токен             | Сейчас | Вердикт   | Почему                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--vui-font-size` | П      | **П**     | Аналог `fontSizeBase`/`fontSize`. В приложении body обычно 16px, а узлам на канвасе нужно плотнее, поэтому брать у приложения нельзя. Шрифт при этом уже наследуется (А) — так и должно быть.                                                                                                                                                                                               |
| `--vui-space`     | П      | **П**     | Аналог `spacingUnit`/`--lb-spacing`/`--wa-space-scale`. Оговорка: порт `size-vui-2` и `border-vui-port` 1.5px подобраны под 4px; при `--vui-space: 2px` кольцо 4px с рамкой 1.5px почти закрашено. Достаточно написать про это в документации.                                                                                                                                              |
| `--vui-radius`    | П      | **П**     | Есть у всех. Маппинг на `--radius` shadcn — семантически не 1:1 (у shadcn `--radius` — это `rounded-lg` карточки, а наш — радиус контрола, ≈ `rounded-md` = `--radius - 2px`). Это решает адаптер в генераторе, не сам токен.                                                                                                                                                               |
| `--vui-duration`  | П      | **— / А** | Используется в двух частях (button, port). Tailwind в приложении уже задаёт `--default-transition-duration: 150ms` — то же значение. Без `duration-(--vui-duration)` части следуют настройке приложения, как в shadcn. В workspace дефолтной темы нет (Tailwind подставит `0s`), поэтому `--default-transition-duration` нужно задать в `libs/ui/src/styles.css` — этот файл не копируется. |
| `--vui-ease`      | П      | **—**     | `cubic-bezier(0.25, 0.1, 0.25, 1)` — это ровно ключевое слово `ease`, то есть токен объявляет браузерный default. Для переходов — как с duration (А). Для `vui-pulse` — литерал `ease` в `@theme`.                                                                                                                                                                                          |

### Цвета темы

| Токен                                                              | Сейчас | Вердикт            | Почему                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------ | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--vui-accent`, `--vui-on-accent`                                  | П      | **П**              | Главная брендовая ручка у всех (`colorPrimary`, `--lb-accent`, `--primary`). Пару с foreground держат Liveblocks, shadcn и Clerk: `contrast-color()` ещё не baseline. Значение одинаково в обеих темах — можно объявить один раз, но ради симметрии блоков можно и оставить.                                 |
| `--vui-selection`                                                  | П      | **П**              | В редакторах выделение отделено от бренда (React Flow `--xy-selection-*`, Figma). Отдельно от accent ещё и из-за контраста (спека: `#0A84FF` под белым 3.65).                                                                                                                                                |
| `--vui-surface`, `--vui-foreground`, `--vui-muted`, `--vui-border` | П      | **П**              | Семантическое ядро. Но это ещё и дубли core `--v-*`, см. «Два имени для одного цвета».                                                                                                                                                                                                                       |
| `--vui-canvas`                                                     | П      | **П**              | Ни одна часть его не использует, он нужен только для `--v-background`. Если выбрать вариант Б ниже, превращается в `--v-background` напрямую.                                                                                                                                                                |
| `--vui-surface-muted`                                              | П      | **П**              | Отдельное дизайн-решение (fill в духе Apple; группа, secondary-кнопка). Из foreground выводится лишь приблизительно, а у shadcn есть прямой аналог `--muted`. Оставить.                                                                                                                                      |
| `--vui-separator`                                                  | П      | **В**              | В обеих темах это ровно `--vui-border` с альфой 0.5 (`#c6c6c8` → `rgb(198 198 200 / .5)`, `#545458` → `rgb(84 84 88 / .5)`), и комментарий в файле говорит то же. Вывести: `--color-vui-separator: color-mix(in oklab, var(--vui-border) 50%, transparent)`. Тогда смена border не оставит separator старым. |
| `--vui-success`, `--vui-warning`, `--vui-danger`                   | П      | **П**              | Есть у Stripe и Clerk; используются в status и в состояниях порта. У shadcn есть только `--destructive`, так что адаптер замапит danger, а success/warning оставит литералами.                                                                                                                               |
| `--vui-info`                                                       | П      | **П**              | Проверил гипотезу «info = alias selection/accent» — она отклоняется. Контраст текста tone-ink на тинте в dark: `#409cff` 4.78, `#0a84ff` (selection) 4.22, `#0071e3` (accent) 3.65. Caption 11px требует 4.5, так что нужен третий синий. В light info = accent, 4.95.                                       |
| `--vui-shadow-node`, `--vui-shadow-floating`                       | П      | **П** (второй ряд) | Тени зависят от темы, Liveblocks отдаёт свои три. Это не первая ручка, которую будут крутить, но значение темы: дешевле оставить публичным, чем прятать.                                                                                                                                                     |

### Выводы в `@theme inline`

| Ключ                                         | Вердикт                           | Почему                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accent-hover/pressed`, `fill-hover/pressed` | **В**                             | Практика AG Grid, Clerk и Liveblocks: состояния взаимодействия выводятся, а не настраиваются. Так правильно.                                                                                                                                                                                                                                         |
| `--vui-tone`, `tone`, `tone-ink`             | **В**, но решить про `--vui-tone` | Это part-local переменная в публичном пространстве `--vui-*`. Inline-стиль `style="--vui-tone: …"` на `vuiStatus` уже перебивает класс, то есть «свой цвет статуса» де-факто работает. Либо документировать как ручку экземпляра (категории нод по цвету — частая задача flow-редакторов), либо явно назвать внутренней. Сейчас это ни то ни другое. |
| `font-weight-vui-*`                          | **В**                             | Литералы, переменных в runtime нет — правильно. Начертания зависят от шрифта приложения, но наборы 400/500/600 есть почти у всех UI-шрифтов.                                                                                                                                                                                                         |
| `--tracking-vui-normal`                      | **—**                             | Части наследуют `font-family` приложения, но сбрасывают его `letter-spacing`. Приложение подбирает tracking под свой шрифт (например, Inter с −0.011em), и сброс ломает именно эту настройку. Если сброс нужен только docs-сайту, его место в docs. Это решение по вкусу, проверьте на docs.                                                         |
| Type scale (`caption`, `body` + line-height) | **В**                             | Вывод из `--vui-font-size`, как `fontSizeXs` от `fontSizeBase` у Stripe.                                                                                                                                                                                                                                                                             |
| `spacing-vui-0…8`                            | **В**                             | Вывод из `--vui-space`. `0` нужен только потому, что в workspace нет дефолтной темы.                                                                                                                                                                                                                                                                 |
| `radius-vui-control/surface`                 | **В**                             | Концентричность выводится — как `--lb-button-radius = 0.75 × --lb-radius`.                                                                                                                                                                                                                                                                           |
| `shadow-vui-halo`                            | **В**                             | Рецепт от тона, правильно.                                                                                                                                                                                                                                                                                                                           |
| `border-width-vui-port`, `blur-vui-material` | **В**                             | Константы частей. По ADR-0005 деталь части — обычный CSS, поэтому в `@theme` они только потому, что правило запрещает arbitrary values. Терпимо; ключ для одной части менее находим, чем значение в самой части.                                                                                                                                     |
| `animate-vui-pulse`, `content-vui-strut`     | **В**                             | Внутреннее.                                                                                                                                                                                                                                                                                                                                          |

### Маппинг на core

`color-scheme` и `accent-color` — правильный способ опереться на платформу (А). `--v-focus-radius` от surface — тоже правильно.

## Структурные находки

### Два имени для одного цвета

`surface`, `foreground`, `muted`, `border`, `selection` (+`focus`), `canvas`→`background` существуют дважды: `--vui-*` (читают части) и `--v-*` (читает core: resizer, selection box, alignment helper, minimap). Маппинг `[data-vui-theme] { --v-surface: var(--vui-surface) }` вычисляется **на элементе с атрибутом**. Отсюда два эффекта:

- `--vui-surface` на одной ноде перекрашивает части, но не core на этом поддереве.
- `--v-selection` на поддереве внутри vui-темы меняет обратную связь core, а outline частей остаётся прежним.

Из документации непонятно, какое из двух имён переопределять.

Есть два варианта:

- **А. Оставить и задокументировать** (минимум изменений). Правило: «для поддерева ставьте `data-vui-theme` + `--vui-*`» — тогда маппинг пересчитается на этом элементе. Опирается на ADR-0005 как он есть.
- **Б. Части читают core-токены напрямую.** `--color-vui-surface: var(--v-surface)`, тема задаёт `--v-*` в `[data-vui-theme]`, а `--vui-*` остаются только для того, чего в core нет: accent/on-accent, surface-muted, tones, тени. Зависимость UI → core уже есть (части существуют только для ngx-vflow), core остаётся независимым. Core регистрирует `--v-*` через `@property` с `initial-value`, поэтому без темы части получат дефолты core. Получится одно имя на понятие и согласованное переопределение на поддереве. Цена: без `data-vui-theme` части выглядят как core-default, а не как светлая vui-тема (сейчас `:root` несёт светлую палитру), а формулировку ADR-0005 придётся уточнить.

Рекомендую Б: это убирает класс ошибок, а не документирует его. Но это изменение ADR, решать вам.

### Адаптер к теме приложения в генераторе

«Полагаться на приложение» напрямую (как React Flow UI → `bg-card`) мы уже отвергли, а через адаптер это дёшево. `ensureUiTokens` знает stylesheet приложения и проверяет Tailwind. Если в нём есть `--primary`, `--card`, `--border`, `--muted-foreground`, `--ring`, `--destructive` (shadcn и spartan-ng используют одни имена, а spartan — наш прямой прототип), можно записать:

```css
:root,
[data-vui-theme='light'],
[data-vui-theme='dark'] {
  --vui-accent: var(--primary);
  --vui-on-accent: var(--primary-foreground);
  --vui-surface: var(--card);
  --vui-foreground: var(--card-foreground);
  --vui-muted: var(--muted-foreground);
  --vui-surface-muted: var(--muted);
  --vui-border: var(--border);
  --vui-selection: var(--ring);
  --vui-danger: var(--destructive);
  --vui-canvas: var(--background);
  /* success / warning / info, тени — литералы vui: у shadcn их нет */
}
```

Тёмная тема тогда приходит из `.dark` приложения сама. Прецедент — тема `shadcn` у Clerk. Отдельно нужно проверить контраст `--muted-foreground` на `--card` для caption и проверить, что `--ring` у shadcn (нейтрально-серый в дефолтной теме) годится как цвет выделения. Скорее всего, нет: тогда selection остаётся литералом vui.

### Подключение к dark mode приложения

Сейчас тёмная тема — только `data-vui-theme='dark'`. Liveblocks поставляет два варианта (media query или `.dark`/`data-theme`), React Flow — `colorMode="system"`. Варианты для нас:

- генератор находит `@custom-variant dark` в stylesheet и пишет селектор тёмной темы под него;
- значения в `light-dark()` (baseline с 2024), а `data-vui-theme` только ставит `color-scheme`; тогда тема следует `color-scheme`, который задаёт приложение. `light-dark()` работает и внутри `box-shadow`, поэтому тени тоже подходят. Блок значений сокращается вдвое.

## Итоговый публичный контракт (если принять рекомендации)

- **Шкалы:** `--vui-font-size`, `--vui-space`, `--vui-radius`.
- **Цвета:** `--vui-canvas`, `--vui-surface`, `--vui-surface-muted`, `--vui-foreground`, `--vui-muted`, `--vui-border`, `--vui-accent`, `--vui-on-accent`, `--vui-selection`, `--vui-success`, `--vui-warning`, `--vui-danger`, `--vui-info` (при варианте Б первые пять + selection становятся `--v-*`).
- **Тени:** `--vui-shadow-node`, `--vui-shadow-floating`.
- **На экземпляре** (если решите): `--vui-tone` у status/port.
- **От приложения:** шрифт, letter-spacing, длительность и кривая переходов, `color-scheme` (и, опционально, dark mode).
- **Внутреннее:** всё остальное в `@theme inline`, включая separator.

Это 3 шкалы + 13 цветов + 2 тени. Сейчас ручек 5 + 15 + 2, то есть набор сокращается на `--vui-duration`, `--vui-ease` и `--vui-separator`. По размеру это между Stripe «commonly used» (8) и Liveblocks (21).

## Что не проверено

- Как выглядят docs без `--tracking-vui-normal` и с Tailwind default duration — визуально не смотрел.
- Контраст при маппинге на дефолтную тему shadcn — не считал.
- Исходник React Flow UI `BaseNode` видел в копии внутри `xyflow/strudel-flow` (`relative rounded-md border bg-card p-3 text-card-foreground`), а не в registry напрямую.

## Источники

- [Stripe Elements Appearance API](https://docs.stripe.com/elements/appearance-api)
- [Clerk appearance variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables), [Clerk themes (shadcn)](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/themes)
- [Liveblocks React UI: CSS variables](https://liveblocks.io/docs/api-reference/liveblocks-react-ui), [styling](https://liveblocks.io/docs/ready-made-features/comments/styling-and-customization)
- [xyflow system styles](https://github.com/xyflow/xyflow/blob/main/packages/system/src/styles/style.css), [React Flow UI](https://reactflow.dev/ui), [strudel-flow base-node](https://github.com/xyflow/strudel-flow/blob/258344197a92bfdd14b5bdfcad0bfe2b28d870d8/src/components/base-node.tsx)
- [AG Grid theming colors](https://www.ag-grid.com/javascript-data-grid/theming-colors/)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [Web Awesome space tokens](https://webawesome.com/docs/tokens/space)
- [Lea Verou: custom properties with defaults](https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/)

## Решение 2026-10-19

Принят вариант Б: части читают `--v-*` напрямую; ADR-0005 дополнен. Применены separator (вывод из border), motion (Tailwind defaults приложения), tracking (сброс удалён). docs-демо, рисующие vui-части без области темы, получили `data-vui-theme="light"`: без неё части берут дефолты core (у `--v-muted` контраст текста ~2:1).
