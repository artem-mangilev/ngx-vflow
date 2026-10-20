# Ревью токенов core и UI, схема разделения ответственности

Дата: 2026-10-20. Статус: реализовано 2026-10-20 (core, UI, docs, ADR-0005).
Основание: запрос пользователя — accent должен быть уровнем темы, а в core должны быть токены встроенных частей (selection, resize handle и т. д.). Затрагивает [ADR-0005](../../docs/adr/0005-independent-core-theme-contract.md).

## Что есть сейчас

### Core (`libs/ngx-vflow`)

Core объявляет 12 токенов через `@property` (дефолт без объявления на элементе, поэтому значение с любого предка наследуется). Семь из них — общая палитра, а core рисует ими всего несколько своих частей:

| Токен                                                     | Кто в core читает                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--v-background`                                          | фон `.v-root`; окно viewport в миникарте (через computed background `.v-root`)                  |
| `--v-surface`                                             | рамка ручки ресайзера; заливка ноды в миникарте                                                 |
| `--v-foreground`                                          | `.v-alignment-guides` (50%); обводка ноды в миникарте                                           |
| `--v-muted`                                               | `.v-background-pattern` (точки и сетка); линия connection без шаблона; маска и группы миникарты |
| `--v-border`                                              | рамка миникарты; обводка группы в миникарте                                                     |
| `--v-accent`                                              | `.v-selection-box`; `.v-resize-control` (ручки и линии); выделенная нода в миникарте            |
| `--v-focus`                                               | кольцо фокуса ноды, ребра, `.v-root`                                                            |
| `--v-focus-width`, `--v-focus-offset`, `--v-focus-radius` | геометрия кольца фокуса                                                                         |
| `--v-toolbar-offset`                                      | отступ `<v-node-toolbar>` (не зарегистрирован, fallback 10px)                                   |
| `--v-zoom`                                                | только чтение: core пишет текущий zoom на элемент flow                                          |

### UI (`libs/ui`, `vflow-ui.css`)

- Тема задаёт **core-имена** для общих цветов (`--v-background`, `--v-surface`, `--v-foreground`, `--v-muted`, `--v-border`, `--v-accent`, `--v-focus`) и `--vui-*` для остального: `--vui-surface-muted`, `--vui-success`, `--vui-danger`, тени, `--vui-space`, `--vui-radius`.
- Части читают и те и другие: `bg-vui-surface` → `var(--v-surface)`, `bg-vui-accent` → `var(--v-accent)`, порт напрямую `var(--v-accent)`.
- Так решила поправка ADR-0005 от 2026-10-19: одно публичное имя на понятие, override `--v-surface` на любом элементе красит и flow, и части.

### Docs

Демо core-страниц (не design system) пишут свой CSS на `--v-muted`, `--v-border`, `--v-foreground` и т. д. в 10 файлах; `demo.css` — на `--v-background`, `--v-border`.

## Проблемы

1. **Палитра в core — это тема.** `--v-surface`, `--v-foreground`, `--v-muted`, `--v-border`, `--v-accent` — роли дизайн-системы. Core после ADR-0006 headless и рисует только обратную связь: selection box, ресайзер, кольцо фокуса, alignment guides, паттерн фона, линию connection по умолчанию, миникарту. Каждой из этих частей приходится брать «ближайший по смыслу» общий цвет: ручка ресайзера = accent + surface, alignment guides = foreground, паттерн фона = muted.
2. **Нельзя покрасить одну часть core.** Сменить цвет ручек ресайзера, не задев selection box и миникарту, можно только CSS-правилом на `.v-resize-control`. Для миникарты (canvas) нельзя никак: она читает общие токены.
3. **UI владеет чужими именами.** Тема UI задаёт значения токенам core, а части UI читают токены core. Акцент темы получается core-токеном (`--v-accent`), хотя core про акцент ничего не знает — именно на это указал пользователь.
4. **Имена не следуют одному правилу.** `--v-toolbar-offset` относится к `<v-node-toolbar>`. `--v-focus-*` — семейство про кольцо. Остальные токены — роли палитры.

## Ограничение, из-за которого маппинг уже откатывали

Кастомное свойство со ссылкой `var()` вычисляется на элементе, где оно объявлено, а потомки наследуют уже вычисленное значение. Если тема объявит на `:root` `--v-selection-box: var(--vui-accent)`, то `.my-editor { --vui-accent: teal }` перекрасит части UI (их утилиты читают `var(--vui-accent)` на месте) и **не** перекрасит selection box: значение core-токена уже вычислено на `:root`. Это ровно причина поправки ADR-0005 от 2026-10-19.

Где объявить маппинг:

| Где                                | Override токена темы на `.my-editor`                 | Override токена core на предке flow  | Override токена core на `vflow` и внутри |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| `:root, [data-vui-theme]`          | только если `.my-editor` — scope темы                | да                                   | да                                       |
| **элемент `vflow`** (предлагается) | да, с любого предка flow                             | нет: побеждает объявление на `vflow` | да (неслойный CSS бьёт слой `base`)      |
| use-site fallback в core           | невозможно без знания core об UI (нарушает ADR-0005) | —                                    | —                                        |

Вариант `vflow`: тема и потребитель красят с любого предка, core-токены с UI переопределяются на `vflow` или внутри. Без UI core-токены работают как сейчас: с любого предка. Override темы внутри flow (например, на ноде) не доходит до частей core внутри этой ноды (ручки ресайзера) — редкий случай, документируем.

## Предлагаемая схема

Три уровня, у каждого один владелец и одно правило именования.

### 1. Тема — `--vui-*`, в `vflow-ui.css` (код приложения)

Роли дизайн-системы, как у shadcn (`--background`, `--card`, `--primary`, `--border`, `--ring`). Части UI читают только этот уровень.

| Токен                                        | Сейчас           | Роль                         |
| -------------------------------------------- | ---------------- | ---------------------------- |
| `--vui-background`                           | `--v-background` | фон canvas                   |
| `--vui-surface`                              | `--v-surface`    | ноды, лейблы, плавающие слои |
| `--vui-surface-muted`                        | без изменений    | группы, hover                |
| `--vui-foreground`                           | `--v-foreground` | основной текст               |
| `--vui-muted`                                | `--v-muted`      | вторичный текст, линии рёбер |
| `--vui-border`                               | `--v-border`     | hairline-рамки               |
| `--vui-accent`                               | `--v-accent`     | единственный акцент          |
| `--vui-success`, `--vui-danger`              | без изменений    | валидность порта             |
| `--vui-shadow-node`, `--vui-shadow-floating` | без изменений    | elevation                    |
| `--vui-space`, `--vui-radius`                | без изменений    | шкалы                        |

Tailwind-ключи `--color-vui-*` смотрят только на этот уровень (и производные: `separator`, part-local `tone`).

Бонус: приложение на shadcn или spartan связывает темы одной строкой на элемент: `--vui-accent: var(--primary); --vui-surface: var(--card); …`.

### 2. Core — `--v-<часть>[-<аспект>]`, имя части = публичный класс

Только то, что core рисует сам. Дефолты остаются в `@property`, core-only интеграция работает как раньше.

| Токен                                   | Часть (класс)                             | Дефолт core        | Тема UI ставит          |
| --------------------------------------- | ----------------------------------------- | ------------------ | ----------------------- |
| `--v-background`                        | `.v-root`                                 | `#fff`             | `--vui-background`      |
| `--v-background-pattern`                | `.v-background-pattern` (точки, сетка)    | `rgb(177 177 183)` | `--vui-border`?¹        |
| `--v-selection-box`                     | `.v-selection-box` (обводка; заливка 12%) | `#0f4c75`          | `--vui-accent`          |
| `--v-resize-control`                    | `.v-resize-control` (ручки и линии)       | `#0f4c75`          | `--vui-accent`          |
| `--v-resize-control-border`             | рамка ручки, отделяет её от ноды          | `#fff`             | `--vui-surface`         |
| `--v-alignment-guides`                  | `.v-alignment-guides` (50%)               | `#1b262c`          | `--vui-foreground`      |
| `--v-connection`                        | линия connection без шаблона              | `rgb(177 177 183)` | `--vui-muted`           |
| `--v-focus`                             | кольцо фокуса ноды, ребра, `.v-root`      | `#005fcc`          | `--vui-accent`          |
| `--v-focus-width`, `-offset`, `-radius` | геометрия кольца                          | 2px, 3px, 0        | radius = surface radius |
| `--v-minimap-mask`                      | маска вне viewport (35%)                  | muted              | `--vui-muted`           |
| `--v-minimap-node`                      | заливка ноды                              | `#fff`             | `--vui-surface`         |
| `--v-minimap-node-border`               | обводка ноды                              | `#1b262c`          | `--vui-foreground`      |
| `--v-minimap-group`                     | заливка (8%) и обводка группы             | border             | `--vui-border`          |
| `--v-minimap-selected`                  | обводка выделенной                        | `#0f4c75`          | `--vui-accent`          |
| `--v-minimap-border`                    | рамка миникарты                           | `rgb(200 200 200)` | `--vui-border`          |
| `--v-node-toolbar-offset`               | `<v-node-toolbar>`                        | 10px               | —                       |
| `--v-zoom`                              | только чтение                             | —                  | —                       |

¹ Сейчас паттерн рисуется `--v-muted`. Отдельный токен позволит теме сделать точки тише, чем текст.

Окно viewport в миникарте остаётся цветом фона `.v-root` (computed), без своего токена.

`--v-surface`, `--v-foreground`, `--v-muted`, `--v-border`, `--v-accent` из core уходят.

### 3. Маппинг — один блок в `vflow-ui.css`, на `vflow`

```css
@layer base {
  vflow {
    --v-background: var(--vui-background);
    --v-selection-box: var(--vui-accent);
    --v-resize-control: var(--vui-accent);
    --v-resize-control-border: var(--vui-surface);
    --v-focus: var(--vui-accent);
    --v-focus-radius: --theme(--radius-vui-surface);
    /* … остальные строки таблицы */
  }
}
```

Forced colors не ломаются: core переопределяет свои токены в `@media (forced-colors: active)` неслойным `:host`, а это сильнее слоя `base` на том же элементе.

### Правила

- Части UI читают только `--vui-*`; core читает только `--v-*`. Ни core, ни части не читают чужой уровень, кроме блока маппинга.
- Новый токен core появляется только для части, которую рисует core, и называется по её публичному классу. Детали (толщина, размер ручки) — обычный CSS на классе, как сейчас.
- Тему и свои цвета приложения задают на любом предке flow; core-токены при подключённой теме — на `vflow` или внутри.

## Последствия

- ADR-0005: поправка 2026-10-19 («одно имя на понятие, части читают core-токены») заменяется схемой трёх уровней; пункт «part-specific details use ordinary CSS instead of a component-token catalogue» смягчается: токены есть у частей core, детали по-прежнему CSS.
- Core: `vflow.component.scss` (`@property`, forced colors), selection box, ресайзер, alignment helper, background, connection (`defaultColor`), миникарта (`theme()` читает новые имена), node toolbar.
- UI: `vflow-ui.css` (значения под `--vui-*`, блок маппинга, `@theme inline`), порт (`var(--v-accent)` → `var(--vui-accent)`).
- Docs: страницы Overview, Tokens, Resizer, Minimap, Migration (таблица removed inputs: `resizerColor` → `--v-resize-control`, `selectionBox.color` → `--v-selection-box`, `maskColor`/`strokeColor` → `--v-minimap-mask`/`--v-minimap-border`, `alignmentHelper.lineColor` → `--v-alignment-guides`, цвет точек фона → `--v-background-pattern`); ~10 демо core-страниц переходят с `--v-*` палитры на `--vui-*`.
- e2e: проверки computed-цветов остаются, меняются только имена в стилях.

## Решения

1. Схема трёх уровней — **да** (2026-10-20).
2. Место маппинга — **scope темы, модель shadcn**: `:root, [data-vui-theme]`; роли переопределяются на scope, core-токены — на любом элементе внутри scope. Вариант scope + `vflow` (закрывал ловушку override без атрибута) отклонён пользователем.
3. Миникарта — **два токена**: `--v-minimap-mask` и `--v-minimap-selected`; заливка и обводки нод, группы и рамка берутся от других токенов core (см. ниже).
4. Паттерн фона — **тише**: тема ставит `--v-background-pattern: var(--vui-border)`.
5. `--vui-ring` — **нет**, фокус = акцент.

### Миникарта с двумя токенами

| Что рисуется                 | Цвет                                  |
| ---------------------------- | ------------------------------------- |
| маска вне viewport           | `--v-minimap-mask` при 35%            |
| окно viewport                | computed-фон `.v-root`, как сейчас    |
| нода: заливка / обводка      | `--v-background` / `--v-minimap-mask` |
| группа: заливка 8% / обводка | `--v-minimap-mask`                    |
| выделенная нода: обводка     | `--v-minimap-selected`                |
| рамка миникарты              | `--v-minimap-mask`                    |

Тема: `--v-minimap-mask: var(--vui-muted)`, `--v-minimap-selected: var(--vui-accent)`. Проверить вид в обеих темах на реализации.

## Место маппинга: обсуждение

| Сценарий                                                                   | scope `:root, [data-vui-theme]`    | `vflow`    | scope + `vflow` |
| -------------------------------------------------------------------------- | ---------------------------------- | ---------- | --------------- |
| `.my-editor { --vui-accent: teal }` без атрибута                           | части teal, части core нет         | всё teal   | всё teal        |
| `<div data-vui-theme="light" class="my-editor">` + тот же override         | всё teal                           | всё teal   | всё teal        |
| локальная тема на ноде (`data-vui-theme="dark"` на ноде) — ручки ресайзера | следуют                            | не следуют | следуют         |
| `.my-editor { --v-selection-box: red }` на предке flow                     | да, если `.my-editor` внутри scope | нет        | нет             |
| `vflow { --v-selection-box: red }`                                         | да                                 | да         | да              |
