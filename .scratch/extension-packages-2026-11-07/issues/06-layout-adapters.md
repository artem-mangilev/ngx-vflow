# 06. `@vflow/layout`: адаптеры dagre, elk, d3-force

Status: ready-for-agent
Type: task
Blocked by: 05

Спецификация: [spec.md](../spec.md), «Адаптеры». Источники: `DagreLayoutDirective` (Studio), `layout-flow.ts` в mermaid-clone (dagre с `minlen`/`width` для лейблов), cookbook `force`.

## Что сделать

- Secondary entry points: `libs/layout/dagre/ng-package.json`, `libs/layout/elk/ng-package.json`, `libs/layout/d3-force/ng-package.json` (+ `src/public-api.ts` каждому). В `libs/layout/package.json`: `peerDependencies` `@dagrejs/dagre`, `elkjs`, `d3-force` с `peerDependenciesMeta.optional: true`; в корневой `package.json` — devDependencies для сборки и docs (`@dagrejs/dagre` ещё не установлен; `elkjs` и `d3-force` есть).
- `dagreLayout(options)`: `rankdir`, `nodesep`, `ranksep`, `align`, `ranker`, `marginx/y`; центр dagre → левый верх; `parentId` → `setParent` (compound graph); результат во flow space.
- `elkLayout(options)`: `layoutOptions` как есть; `LayoutGraph` → ELK graph с `children` по `parentId`; ELK считает в worker (`elkjs/lib/elk.bundled.js` в main thread как fallback; решить, как поставлять worker без настройки бандлера у потребителя — вероятно, bundled в main thread по умолчанию, `{ worker: true }` опция); абсолютные позиции из вложенных `x/y`.
- `forceLayout(options)`: Observable; `tick` → `LayoutResult`; `alphaDecay`/`distance`/`strength`; сим-ноды с `x/y` копиями, без прокси в `point` (это делает хост). Остановка по `unsubscribe`.
- Проверить, что `@vflow/layout` без импорта `/elk` не тянет `elkjs` в бандл docs (анализ `stats.json` или `source-map-explorer`).

## Docs (демо-компоненты здесь, страницы в 07)

- `Packages → Layout`: три демо (dagre, elk, force), переключатель направления, `animate`.
- Cookbook `expand-collapse` — рецепт поверх `@vflow/layout/dagre` с `getVisibleNodes()` в коде демо (не в пакете).
- Cookbook `force` и `vizdom-layout` — переписать на `VxLayout` (vizdom — инлайн-алгоритм, wasm как сейчас).

## Тесты

- Unit: каждый адаптер даёт позиции для простого графа; dagre `rankdir: 'LR'` располагает target правее source; ELK compound: ребёнок внутри родителя; force: несколько `tick`, `unsubscribe` останавливает симуляцию.
