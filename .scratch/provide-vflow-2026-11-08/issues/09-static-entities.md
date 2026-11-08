# 09. `toStaticNodes` / `toStaticEdges` и рецепт «Persisting a graph»

Status: resolved
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

## Comments

2026-11-08, сделано:

- `toStaticNode` / `toStaticNodes` в `node.interface.ts`, `toStaticEdge` / `toStaticEdges` в `edge.interface.ts` — зеркало фабрик: сигналы читаются в `untracked`, поле без сигнала не появляется (auto-ось остаётся без размера), `component` / `curve` копируются как есть; класс, lazy-фабрика или функция кривой в dev-режиме — `console.warn` с id и подсказкой про `with*()`. Общий хелпер `read(key, signal)` живёт в `node.interface.ts` (внутренний экспорт модуля). `data` не трогается.
- Типы: `toStaticNodes<T>(nodes: readonly Node<T>[]): StaticNode<T>[]` — `T` выводится из нод, для union-данных из `createNodes` получается union.
- Спек `node-dom/static-entities.spec.ts` (jsdom и happy-dom, с zone и без — 16 прогонов): круг нод (явный/неявный размер, ключ компонента, parentId, extent), круг рёбер (ключ кривой, встроенная кривая, маркеры, sourceHandle), `JSON.parse(JSON.stringify(...))` без потерь, предупреждения для класса/фабрики, эффект со снимком не следит за сигналами нод.
- Docs: Cookbook «Persisting a graph» (order 1) с демо Save / Restore / Reset в `localStorage` и печатью снимка; абзацы-ссылки на Default nodes и Custom nodes (Component keys).
- Проверено в dev-сервере: драг → Save пишет новую точку в снимок и `localStorage`; Reset возвращает граф и чистит хранилище; Restore с изменённым в хранилище снимком переставляет ноду (`translate(200px, 20px)`), рёбра на месте, консоль без ошибок. `nx lint ngx-vflow`, `nx lint docs`; `nx build ngx-vflow` (четыре функции в `index.d.ts`, `ɵ` не прибавилось); `nx build docs`. e2e страницы — тикет 06.

2026-11-08, правка по замечаниям: в демо осталась одна кнопка Save, граф восстанавливается из `localStorage` при загрузке страницы (проверка — перезагрузка); JSON стоит в колонке справа от флоу, обе колонки фиксированной высоты со своей прокруткой, `:host` на всю ширину панели, при ширине контейнера до 560px колонки складываются. Проверено: относительные размеры и положение флоу внутри демо до и после Save идентичны, после перезагрузки нода на сохранённом месте, консоль чистая. Попутно: порт 4200 держал зависший процесс прошлого dev-сервера, снят вручную.
