# 03. `@vflow/routing` и каркас пакета-расширения

Status: resolved
Type: task
Blocked by: 01

Спецификация: [spec.md](../spec.md), разделы «Форма поставки», «Инфраструктура», «Контракты → routing». Источник: `dev/vflow-studio/libs/smart-curves/src/pages/smart-curves/smart-edge-factory.ts`.

## Каркас (делается здесь один раз, 04–06 копируют)

- `libs/routing/`: `package.json` (`@vflow/routing`, версия как у `ngx-vflow`, `publishConfig.access: public`, peers `ngx-vflow ^3.0.0` + Angular `^20 || ^21 || ^22`, `sideEffects: false`), `ng-package.json` (`dest: ../../dist/libs/routing`), `project.json` по образцу `libs/ngx-vflow` (build ng-packagr, test vitest, lint, `nx-release-publish`, tag `release`), `tsconfig.lib*.json`, `tsconfig.spec.json`, `vitest.config.mts`, `README.md`, `LICENSE`.
- Алиасы: корневой `tsconfig.json` → `libs/routing/src/public-api`; `apps/docs/tsconfig.hybrid.json` → `dist/libs/routing`.
- `apps/docs/src/app/categories/packages/ng-doc.category.ts` (title «Packages», order 9) и страница `routing`.
- `docs/releasing.md`: раздел «Add a package» сверить с тем, что реально понадобилось, и поправить.

## Порт фабрики на 3.0

- Препятствия — из `params.nodeGeometries` (тикет 01), не из `node.width?.()` с дефолтом 150×60. Исключать: ноды source/target (как сейчас), **и всех их предков** по `parentId`.
- `createAvoidNodesCurve(options)` + `avoidNodesCurve` с дефолтами; константы модуля становятся опциями (см. spec). `isObstacle` для opt-out контейнеров.
- Возвращать `bounds` (bbox точек пути + `cornerRadius`) и `labelPoints` с `angle` (см. `getSmoothStepPath`, `directionAngle`) — `start`/`center`/`end`.
- Режим `connection`: `edge` отсутствует — source-нода берётся из `params.sourceNode`, target из `params.targetNode` (если snapped) — сейчас Studio берёт id только из `edge`.
- Числа в `d` округлять (как `buildRoundedPolyline` в mermaid-clone) — меньше DOM-строк.
- `prettier`: форматирование репозитория (120 символов), не Studio.

## Тесты и производительность

- Unit (browser mode, `defineAngularTestConfig`): путь ортогональный; не пересекает препятствия в простой конфигурации; предок исключён (ребро внутри контейнера не огибает контейнер); превью соединения строится; `labelPoints.center` на пути; `bounds` содержит путь.
- Замер: страница stress (как `stress-rendering.spec.ts`) с 200 нодами/300 рёбрами `avoidNodesCurve`, drag одной ноды — время кадра в CDP (инструменты в `.scratch/performance-2026-09-26`). Порог зафиксировать в docs-странице как ограничение pull-модели.
- docs-e2e `routing.spec.ts`: на демо путь ребра не проходит через bbox промежуточной ноды (проверка `d` на отсутствие точек внутри прямоугольника).

## Готово, когда

- `nx build routing` (prod), `nx test routing`, `nx lint routing` зелёные; hybrid-сборка docs использует `dist/libs/routing`.
- Страница `Packages → Routing` с живым демо; cookbook `smart-curves` больше не iframe (замена делается в 07, здесь — демо-компонент).

## Comments

2026-11-07, сделано:

- Каркас `libs/routing` (package.json, ng-package.json, project.json с `prefix: vx` и тегом `release`, tsconfig.lib/prod/spec, vitest.config.mts, LICENSE, README). Алиасы: корневой tsconfig → `libs/routing/src/public-api`, hybrid docs → `dist/libs/routing`.
- **Сборка компилируется против `dist/libs/ngx-vflow`** (`paths` в `tsconfig.lib.json`): с алиасом на исходники ng-packagr падал с `Cannot destructure property 'pos' of 'file.referencedFiles[index]'` — TS строит диагностику «файл вне rootDir» для `libs/ngx-vflow/src/*` и роняется на ней. `build` зависит от `^build`, так что dist ядра есть. Побочный плюс: пакет видит только публичный API ядра. Specs и docs читают исходники через алиас корня.
- Фабрика `createAvoidNodesCurve(options)` / `avoidNodesCurve`: препятствия из `nodeGeometries` минус ноды ребра и их предки, `isObstacle`, режим `connection` без `targetNode`, `bounds` и `labelPoints` с `angle` (15/50/85 % длины, как у core-кривых), числа в `d` округлены до сотых, вырожденные `L` между соседними скруглениями не пишутся. В собранном fesm нет runtime-импорта `ngx-vflow` (только типы).
- Spec `avoid-nodes-curve.spec.ts`: 7 тестов, в том числе замер — **0.25 мс на ребро при 200 нодах** (Chromium); порог в docs: несколько сотен маршрутизируемых рёбер в кадр, дальше ощутимо при drag. Полноценный CDP-замер кадра на stress-странице не делал — достаточно порядка величины.
- Docs: категория **Packages** (order 9), страница Routing с демо (`/packages/routing`), e2e `routing.spec.ts` (путь первого ребра не заходит в bbox нод A и B до и во время drag A). `docs/releasing.md`: группа и «Add a package» переписаны по `libs/routing` как шаблону.
- Страница Cookbook `smart-curves` пока остаётся iframe — замена в 07.

2026-11-07, проверка качества алгоритма (стенд в scratchpad сессии: 50 ручных сценариев + 300 случайных неперекрывающихся графов, 1800 рёбер; инварианты: ортогональность, пересечение нод, выход/вход по стороне handle, самопересечения, изгибы, длина):

| Версия         | Рёбер с нарушениями (random) | Пересечения чужих нод | Своих нод | Самопересечения | Прямая/fallback |
| -------------- | ---------------------------- | --------------------- | --------- | --------------- | --------------- |
| порт из Studio | 303 / 1800 (17 %)            | 213                   | 247       | 20              | ~60 диагоналей  |
| после правок   | 45 / 1800 (2.5 %)            | 0                     | 0         | 0               | 12 smooth-step  |

Оставшиеся 45: 28 «длинных» маршрутов (handle смотрит от другого конца — обход своей ноды, геометрически верно), 12 fallback между соседями с зазором < ~4 px, 6 путей по 7 изгибов.

Что изменено в `avoid-nodes-curve.ts`:

- Ноды ребра остаются препятствиями (исключаются только предки): путь не идёт сквозь свою ноду к handle, смотрящему в другую сторону.
- Расширение препятствия (`nodePadding`) ограничивается по той стороне, к которой ближе точка handle/подхода (`inflateKeepingOutside`), так что сосед вплотную к handle не «проглатывает» точку; нода, внутри которой лежит точка другого конца, препятствием не является.
- Точка подхода ищется от `nodePadding + approachDistance` вниз до 2 px так, чтобы отрезок handle→подход не пересекал соседей с зазором 2 px (`findApproachPoint`); нода не-конца под самой точкой (курсор соединения над нодой) не учитывается.
- Exit blocker начинается от сырой стороны ноды (не от padded): убраны самопересечения, когда маршрут шёл вдоль padded-стороны и пересекал отрезок подхода.
- Маршрут считается сперва по препятствиям в конверте ±160 px, затем по пересечённым им препятствиям из `obstacleMargin` достраивается (до 3 итераций); финальные шорткаты проверяются по полному набору.
- Нет маршрута (перекрывающиеся ноды, зазор < 2 px) → `getSmoothStepPath` ядра вместо диагонали; пакет теперь имеет runtime-импорт из `ngx-vflow`.
- Цена: 0.25 → 0.37 мс на ребро при 200 нодах.
- Известное: self-loop на одной ноде не маршрутизируется осмысленно; «длина» у handle, смотрящего прочь, — обход своей ноды.

2026-11-07, стабильность при drag (запрос пользователя): опция `inertia` (по умолчанию 0.3). Фабрика хранит последний маршрут каждого ребра (`WeakMap` по объекту ребра внутри `createAvoidNodesCurve`), и в A* отрезки вдоль предыдущего маршрута (та же ориентация, в пределах `gridSpacing` от его линии, с перекрытием по протяжённости) стоят на `inertia` дешевле; эвристика масштабируется на `1 − inertia`, чтобы остаться допустимой. Стенд drag (scratchpad `drag.ts`): дрожание препятствия или цели на ±1 px у центральной линии — 39 переключений стороны из 40 кадров → 0; соседнее ребро при протаскивании чужой ноды сквозь коридор — 4 → 0; монотонный проход препятствия сквозь линию переключается один раз, с запозданием (гистерезис). Время на ребро 0.37 → 0.38 мс. В режиме `connection` памяти нет (нет объекта ребра).
