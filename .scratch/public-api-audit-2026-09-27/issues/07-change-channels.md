# 07. Каналы уведомлений об изменениях

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.6, 3.1, 4.4. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Изменения узлов доступны тремя путями (`components/vflow/vflow.component.ts:105-121,569-611`, `directives/changes-controller.directive.ts`):

- output `(nodesChanges)` и пять подканалов `(nodesChanges.position|size|add|remove|select)`;
- сигнал `nodesChange`;
- observable `nodesChange$`.

У рёбер так же, подканалы — `detached|add|remove|select`.

Детали:

- **Сигнал теряет события.** Позиции эмитятся по пачке на узел (`services/node-changes.service.ts:16-29`), а сигнал хранит только последнюю. Проба: две позиции в одном тике → observable дал 2 пачки, сигнал — 1. В `apps` и `libs` сигналы не используются.
- **`NodeChange[]` для позиций, размеров и выделения — не пачка.** Каждый узел эмитит массив из одного элемента, и каждый массив проходит через `observeOn(asyncScheduler, 25)` (`services/node-changes.service.ts:83-87`). Перетаскивание 50 выделенных узлов — 50 эмиссий и 50 таймеров на каждое движение указателя, на каждого слушателя. Найдено чтением кода, не замерено.
- **Подканал подписывается на весь поток.** Подканалы — это `filter(type)` поверх полного `merge` (`directives/changes-controller.directive.ts:76-88`), а `changes$` не расшарен. Один `(nodesChanges.add)` заводит на каждый узел observable для `point`, `width`, `height` и `selected`; каждый из них — effect (`models/node.model.ts:254`).
- **Outputs недоступны программно.** `nodesChanges`/`edgesChanges` объявлены в host directive, поэтому через ссылку на `VflowComponent` их нет. Отсюда пара `nodesChange$`/`edgesChange$` с другим именем (единственное число).
- **У viewport и готовности два канала для состояния:** `viewport`/`viewportChange$` и `initialized`/`initialized$`. Observables дублируют сигналы; в `apps` не используются.

## Решено (2026-10-03)

Правило: событие — output, состояние — сигнал, третьей формы нет.

- **Сигналы `nodesChange`/`edgesChange`** — удалить.
- **Outputs `nodesChanges`/`edgesChanges`** — перенести из `ChangesControllerDirective` в `VflowComponent`. Программная подписка: `flow.nodesChanges.subscribe(...)`, для rx — `outputToObservable(flow.nodesChanges)`.
- **Observables `nodesChange$`/`edgesChange$`** — удалить, их заменяют outputs компонента.
- **Подканалы** — оставить в `ChangesControllerDirective` (host directive). Каждый подканал подписывается только на свой источник, а не фильтрует общий поток.
- **Одна пачка за тик.** Все изменения, возникшие в одном синхронном проходе effects, слушатель получает одним массивом:
  - `(nodesChanges)`/`(edgesChanges)` — один массив со всеми типами;
  - подканал — один массив своего типа.
  - Задержки доставки не меняются: узлы — 25 мс, рёбра — следующая макрозадача. На тик — один таймер, а не по таймеру на узел.
- **`viewportChange$` и `initialized$`** — удалить. Замена: `toObservable(flow.viewport)` и `toObservable(flow.initialized)`.
- **Output `(viewportChange)`** — не добавлять: viewport — состояние, а имя обещает `[(viewport)]`. Событие конца жеста `(viewportChangeEnd)` — в тикете 15.

## Сделать

Сервисы (`services/node-changes.service.ts`, `services/edge-changes.service.ts`):

- Открыть потоки по типам (`position`, `size`, `add`, `remove`, `select`; у рёбер — `detached`, `add`, `remove`, `select`).
- Склейка за тик: собирать эмиссии до конца синхронного прохода (например, до микрозадачи) и доставлять одним массивом через текущую задержку.
- `changes$` и потоки по типам — `share()`: несколько слушателей не дублируют pipeline.

Компонент и директива:

- `components/vflow/vflow.component.ts`:
  - объявить `nodesChanges` и `edgesChanges` через `outputFromObservable`;
  - убрать их из списка outputs host directive (107-120);
  - удалить `nodesChange`, `edgesChange`, `nodesChange$`, `edgesChange$`, `viewportChange$`, `initialized$` (573-611).
- `directives/changes-controller.directive.ts`:
  - оставить девять подканалов, каждый — от своего потока сервиса;
  - `NodeChangeMap`/`EdgeChangeMap` заменить на `Extract<NodeChange, { type: T }>` (TODO в файле).
- `utils/signals/to-lazy-signal.ts` остаётся: его использует `components/background/background.component.ts`.

Мок (`libs/ngx-vflow/testing/src/component-mocks/vflow-mock.component.ts:213-220`):

- удалить те же шесть членов;
- добавить outputs `nodesChanges`, `edgesChanges` и девять подканалов с теми же alias;
- обновить `testing/src/all-mocks.spec.ts:99-107`. Specs `testing` не запускаются до тикета 16 — проверить сборкой `nx build ngx-vflow`.

Существующие specs на удаляемых API:

- `audit-regressions.spec.ts:239` — `edgesChange$`;
- `components/vflow/keyboard-navigation.spec.ts:175` — `nodesChange$`;
- `public-components/resizable/resizable.component.spec.ts:207` — `viewportChange$`.

Docs:

- `apps/docs/src/app/categories/interactions/pages/handling-changes/index.md`:
  - раздел «From componenet itself» — на `flow.nodesChanges.subscribe(...)` и `outputToObservable`;
  - описать пачку: один массив на тик.
- `apps/docs/src/app/categories/introduction/pages/migration/index.md`:
  - таблица «Removed APIs» — шесть удалённых членов с заменами;
  - отдельная заметка о пачках: слушатель позиций получает один массив на тик вместо массива на узел.

## Проверка

Новые specs:

- Два узла меняют позицию в одном тике → `(nodesChanges)` срабатывает один раз с двумя изменениями; `(nodesChanges.position)` — так же.
- Позиция и выделение в одном тике → `(nodesChanges)` отдаёт один массив с обоими типами; `(nodesChanges.position)` — только позицию.
- Слушатель только `(nodesChanges.add)` → у моделей узлов не создано ни одного observable (приватная карта `observables` в `NodeModel` пуста).
- `flow.nodesChanges.subscribe(...)` через `viewChild` получает те же пачки, что и слушатель в шаблоне; оба слушателя работают одновременно.
- Удаление узла с рёбрами → `(edgesChanges.detached)` приходит одной пачкой, как сейчас.

Прогон: `nx test ngx-vflow --skip-nx-cache`, `nx build ngx-vflow`, сборка docs. Если сборка потребует экспорт host directive (NG3001) — экспортировать как `ɵChangesControllerDirective`, по образцу тикета 05.

Связано: 15 (`(viewportChangeEnd)`, `(initialized)`), 17 (после этого тикета в моке не хватает только `(nodeDrag*)`), 20 (имена типов изменений).

## Answer

- `nodesChanges` и `edgesChanges` — outputs самого `VflowComponent`; программная подписка — `flow.nodesChanges.subscribe(...)` или `outputToObservable`.
- Удалены `nodesChange`, `edgesChange`, `nodesChange$`, `edgesChange$`, `viewportChange$`, `initialized$`.
- Пачка за тик — оператор `utils/batch-changes.ts`: эмиссии одного синхронного прохода собираются до микрозадачи и уходят одним массивом через прежнюю задержку (узлы — 25 мс, рёбра — следующая макрозадача).
- Сервисы отдают `changes$` и `changesOfType(type)`, оба с `share()`. Девять подканалов в `ChangesControllerDirective` читают `changesOfType`, поэтому `(nodesChanges.add)` и `(nodesChanges.remove)` не создают observables узлов.
- `NodeChangeMap`/`EdgeChangeMap` заменены на `Extract<…, { type: T }>`.
- Мок: шесть членов удалены, добавлены `nodesChanges`, `edgesChanges` и девять подканалов. `all-mocks.spec.ts` обновлён, но не запускался — specs `testing` вне karma до тикета 16.
- `ChangesControllerDirective` по-прежнему экспортируется из `public-api.ts` под своим именем — это вопрос тикета 08.
- Specs: `components/vflow/changes-outputs.spec.ts` (шаблон, код, подканал, `detached`), три новых в `services/node-changes.service.spec.ts`.
- Начальные узлы как `add` не приходят — так было и раньше (`pairwise` по списку).
- Под zone.js не проверялось: все specs библиотеки zoneless.
- Docs: `handling-changes/index.md`, раздел «Change notifications» и четыре строки «Removed APIs» в migration guide.
