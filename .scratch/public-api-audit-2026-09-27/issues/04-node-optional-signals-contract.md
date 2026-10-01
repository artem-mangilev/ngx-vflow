# 04. Контракт опциональных сигналов узла: размер и состояние

Status: needs-triage
Type: grilling
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 1.4, 2.4, 3.4. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

1. **Размер некуда сохранить.**
   - Resizer переводит `auto`-узел в `explicit` и пишет размер во внутренние сигналы модели.
   - Docs велят сохранять размер при `mode: 'explicit'` (`apps/docs/src/app/categories/nodes/resizer/index.md:47`).
   - Но `NodeModel` читает `rawNode.width`/`height` только в конструкторе (`models/node.model.ts:219-225`).
   - Проба: `node.width = signal(300); node.height = signal(150)` и новый массив → узел остаётся 200×100.
   - Работает только замена объекта узла, а это новая модель, пересоздание view и `remove`+`add` в изменениях.
2. **JSDoc `NodeSizeChange` неверен.** «Already been written to the node's size signals» (`types/node-change.type.ts:17`) не выполняется для узла без сигналов.
3. **Опциональные сигналы значат разное.**
   - `width` вместе с `height` переключают режим размера (`models/node.model.ts:124-128`).
   - `selected`, `draggable` и `extent` лишь решают, видит ли приложение состояние. Без `selected` выделение хранится внутри модели, и `getNode(id).selected` равен `undefined`.
4. **`useDefaults` влияет не на поведение.** Фабрики `createNode(s)`/`createEdge(s)` имеют overload'ы с этим флагом (`interfaces/node.interface.ts:72-118`, `interfaces/edge.interface.ts:58-122`). Дефолты модель подставит сама; флаг решает только, какие сигналы получит приложение.

## Вопросы

- **Как приложение получает explicit-размер после resize:**
  - a) при первом explicit-изменении библиотека дописывает в объект узла `width`/`height`, привязанные к сигналам модели. Так `reparentNodes` уже дописывает `parentId` (`utils/graph-operations.ts:175-176`);
  - b) модель подхватывает сигналы, появившиеся на объекте, при следующей передаче массива — как `parent` через `nodeByIdMap` (`models/node.model.ts:192-199`);
  - c) оставить замену объекта и честно описать это в docs.
- **Недостающие сигналы состояния.** Создаёт ли модель `selected`, `draggable` и остальные на объекте приложения, чтобы состояние всегда было наблюдаемым? Глоссарий допускает: «ngx-vflow may update the application's writable signals».
- **Нужен ли `useDefaults`** после ответа на предыдущий вопрос? Можно ли свести фабрики к `createNode`/`createEdge` + `map`?

## Выход

Решения записать в `## Answer`, обновить `CONTEXT.md` (Node size mode, Application-owned state), при необходимости добавить ADR к ADR-0002. Затем завести task-тикет на реализацию; вместе с ним поправить `apps/docs/src/app/categories/nodes/resizer/index.md` и `interactions/pages/handling-changes/index.md`.
