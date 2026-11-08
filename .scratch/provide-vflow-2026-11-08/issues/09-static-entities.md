# 09. `toStaticNodes` / `toStaticEdges` и рецепт «Persisting a graph»

Status: ready-for-agent
Type: task
Blocked by: 08

Решение пользователя 2026-11-08: полный круг сериализации без импорта классов. Спецификация: [spec.md](../spec.md), раздел «Сериализуемость».

## Что сделать

- `interfaces/node.interface.ts`: `toStaticNode(node: Node<T>): StaticNode<T>` и `toStaticNodes(nodes)` — зеркало `createNode(s)`: каждый сигнал читается (`untracked`), необязательные поля без сигнала не появляются (так `auto`-ось не превращается в `width`), `component` остаётся как есть (строка-ключ сериализуется; класс или lazy-фабрика — в dev-режиме `console.warn` с id ноды: «в JSON это поле пропадёт, зарегистрируйте компонент под ключом»). `selected` разворачивается как состояние; приложение само решает, хранить ли его.
- `interfaces/edge.interface.ts`: `toStaticEdge` / `toStaticEdges` симметрично; `curve` с фабрикой предупреждает так же (после тикета 08 у неё есть ключ); `markers` копируются как есть — они уже данные.
- Чтение `untracked`, чтобы вызов внутри `effect` не подписывал его на весь граф.
- `data` не трогается и не проверяется: это объект приложения; документируется правило «держите `data` JSON-совместимым, без сигналов и функций».
- Типы: `StaticNode<T>` / `StaticEdge<T>` остаются; `toStaticNodes<N extends Node>(nodes: readonly N[]): StaticNode<DataOf<N>>[]` — тип данных выводится из `N`, как в `createNodes`.
- Docs: страница Cookbook «Persisting a graph»: демо с сохранением в `localStorage` и восстановлением через `createNodes(JSON.parse(...))`, компоненты и кривая по ключам, правило про `nodesChanges.size` с `mode: 'auto'` (ссылка на Resizer). Страница Nodes → «Node» (или где описаны `createNodes`) — абзац про обратный путь.
- Экспорт четырёх функций из `public-api`.

## Готово, когда

- Спек в `node-dom` (без DOM-зависимостей): `toStaticNodes(createNodes(static))` даёт глубоко равный `static` для нод с явным и без явного размера, с `component`-ключом, с `parentId`; то же для рёбер с `curve`-ключом и маркерами; класс в `component` — предупреждение в dev и поле на месте; вызов внутри `effect` не создаёт зависимостей (счётчик запусков эффекта).
- `JSON.parse(JSON.stringify(toStaticNodes(nodes)))` проходит через `createNodes` без потерь в демо.
- `nx test ngx-vflow`, lint, builds зелёные; e2e на странице рецепта: сохранить, перезагрузить, граф на месте.
