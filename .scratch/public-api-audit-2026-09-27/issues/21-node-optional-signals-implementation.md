# 21. Опциональные сигналы узла: поздние сигналы, без `useDefaults`

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Решения — в тикете 04 (`## Answer`). Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

- Сигнал `width`/`height`, дописанный приложением в существующий объект узла, модель не читает: `explicitWidth` обращается к `rawNode.width?.()` внутри `computed`, а появление свойства не реактивно (`models/node.model.ts:109-110`). Модель переиспользуется по ссылке на объект (`utils/identity-checker/reference-identity-checker.ts:15`).
- После такого дописывания `setExplicitSize` пишет в сигнал приложения (`models/node.model.ts:294-297`), который модель не читает: ресайзер перестаёт менять бокс.
- Флаг `useDefaults` у `createNode(s)`/`createEdge(s)` не меняет поведение, а даёт 8 лишних overload'ов (`interfaces/node.interface.ts:76-121`, `interfaces/edge.interface.ts:58-122`).
- Docs не говорят, как вернуть размер после ресайза в `Node`, и не различают виды опциональных сигналов.

## Сделать

- **Поздние сигналы: одно правило для всех опциональных сигналов узла.** Приложение дописало (или заменило) сигнал в объекте узла и передало новый массив — модель его читает.
  - `models/node.model.ts`: модель перечитывает свойства объекта при смене массива узлов; зависимые вычисления перезапускаются, только если свойство объекта действительно сменилось.
  - Размер: сигнал приложения побеждает `resizedWidth`/`resizedHeight`. `setExplicitSize` пишет в тот же сигнал, который читает модель.
  - `selected`: модель пишет в сигнал приложения, а без него — во внутренний. Сигнал приложения побеждает внутреннее значение.
  - `draggable`, `extent`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription`, `domAttributes`, `data` читаются по тому же правилу. `draggable` и `extent` в модели становятся read-only: библиотека их не пишет.
  - Без роста сложности: одна дополнительная зависимость на узел, никаких обходов всех узлов из узла.
- **Библиотека не создаёт сигналы на объектах приложения.** Поведение уже такое; закрепить spec'ом.
- **`useDefaults`.**
  - Удалить флаг, `CreateNodeOptions`/`CreateEdgeOptions` и overload'ы. `createNode(s)` возвращают `NodeWithDefaults`, `createEdge(s)` — `EdgeWithDefaults`.
  - Specs с `{ useDefaults: false }` перевести на литералы с `signal()`: `models/node.model.spec.ts`, `services/node-changes.service.spec.ts`, `components/vflow/accessibility.spec.ts`, `interfaces/node.interface.spec.ts`.
  - Migration guide (`apps/docs/src/app/categories/introduction/pages/migration/index.md`): строка в Removed APIs. Флаг был в 2.7.0.
- **JSDoc `Node` и `Edge`.** `selected`: без сигнала выделение держит flow, приложение узнаёт о нём из `nodesChanges.select` / `edgesChanges.select`. `width`/`height`: сигнал можно дописать позже и передать новый массив.
- **Docs.**
  - `apps/docs/src/app/categories/nodes/resizer/index.md`, раздел Resize event: пример обработчика `nodesChanges.size`, который дописывает `width`/`height` для осей `explicit` и обновляет массив.
  - `apps/docs/src/app/categories/interactions/pages/handling-changes/index.md`: три вида опциональных сигналов:
    - пишет библиотека — `selected`, `width`/`height` (только ресайзер), обязательный `point`;
    - библиотека только читает — `draggable`, `extent`, `data`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription`, `domAttributes`, `parentId`;
    - `width`/`height` ещё и делают ось `explicit`.

## Вне тикета

- Рёбра — сделаны позже тем же правилом, см. `## Answer`.
- `point` обязателен и берётся в конструкторе; замена сигнала `point` на том же объекте не поддерживается.

## Проверки

- spec: `auto`-узел, `setExplicitSize({ width: 300 })`, затем `node.width = signal(300)` и новый массив → `node.width.set(500)` даёт `explicitWidth() === 500`; следующий `setExplicitSize({ width: 400 })` пишет в `node.width`.
- spec: для `selected`, `draggable`, `extent`, `selectable`, `focusable`, `data`: сигнал дописан в объект и передан новый массив → модель читает его; без нового массива — нет.
- spec: ресайз и выделение узла без сигналов → в объекте узла не появилось `width`, `height`, `selected`.
- spec: `createNode({ id, point })` возвращает сигналы `data`, `draggable`, `parentId`, `extent`, `selected` с дефолтами и без `width`/`height`.
- `apps/docs-e2e/resizer.spec.ts` остаётся зелёным.
- eslint `ngx-vflow` чистый; unit-набор `ngx-vflow` проходит.

## Answer

Сделано 2026-10-03, без коммита.

- **Поздние сигналы.** `NodeModel` читает опциональные сигналы через снимок объекта приложения (`utils/signals/entity-snapshot.ts`): снимок берётся заново при смене массива узлов, а зависимые вычисления перезапускаются, только если свойство объекта добавили, убрали или заменили. Через снимок идут `width`, `height`, `selected`, `draggable`, `extent`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription`, `domAttributes`, `data`.
- **`selected`** — `forwardSignal` (`utils/signals/forward-signal.ts`): читает и пишет сигнал приложения, а без него внутренний. Сигнал приложения побеждает внутреннее значение.
- **`draggable`, `extent`** в модели стали `computed`: библиотека их не пишет. `extent() === null` — значение сигнала, а не его отсутствие.
- **`data`** в контексте шаблона — `computed` поверх сигнала приложения, а не сам сигнал. Тип `NodeRef.data` (`Signal<T>`) не изменился.
- **`setExplicitSize`** пишет в тот сигнал, который читает модель: сигнал, дописанный в объект, но ещё не переданный новым массивом, не трогает.
- **`useDefaults`** удалён вместе с overload'ами; `createNode(s)` возвращают `NodeWithDefaults`, `createEdge(s)` — `EdgeWithDefaults`. В specs опция просто убрана: литералы не понадобились, `width`/`height` и без неё остаются опциональными.
- **JSDoc**: `Node` (сигналы можно дописать позже, библиотека их не создаёт), `Node.selected`, `Edge.selected`.
- **Docs**: пример `keepResizedSize` на странице ресайзера, раздел «Which node signals the flow writes» в handling-changes, строка в Removed APIs migration guide.

- **Рёбра** (по просьбе пользователя, 2026-10-03). `EdgeModel` читает опциональные сигналы через тот же снимок, взятый при смене массива рёбер: `curve`, `markers`, `reconnectable`, `interactionWidth`, `data`, `selectable`, `focusable`, `ariaLabel`, `ariaDescription`, `domAttributes`. `selected` — `forwardSignal`. `curve`, `markers`, `reconnectable`, `interactionWidth` в модели стали `computed`; specs, писавшие в них через модель, пишут в сигналы ребра. `data` в контексте шаблона — `computed`.

Тесты рёбер: `models/edge.model.spec.ts` — 2 новых (чтение поздних сигналов, `selected`).

Тесты: `models/node.model.spec.ts` — 5 новых (размер, запись до нового массива, `selected`, возможности + `extent` + `data`, отсутствие новых ключей на объекте); `components/vflow/vflow.component.spec.ts` — 1 новый через `<vflow>` (сигнал размера дописан, новый массив, view тот же). Набор `ngx-vflow` — 396 SUCCESS (с рёбрами); eslint `ngx-vflow` чистый; docs e2e 50/50, включая `resizer.spec.ts`. `nx build` не запускался.

Попутно: два теста зависят от порядка запуска и падают и на базовом коммите — `stacking-context.spec.ts` (minimap под overlay; фикстура уезжает за нижний край окна, когда над ней вырос jasmine-репортёр) и `draggable.service.spec.ts` (suppresses the click; подавитель click из предыдущего теста живёт до `setTimeout`). Сравнивать прогоны нужно с `--skip-nx-cache`: успешный прогон nx отдаёт из кеша.
