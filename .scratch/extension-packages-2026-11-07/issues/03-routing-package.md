# 03. `@vflow/routing` и каркас пакета-расширения

Status: ready-for-agent
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
