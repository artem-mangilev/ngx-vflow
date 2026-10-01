# 16. `ngx-vflow/testing`: specs в CI и явные поломки

Status: ready-for-agent
Type: task
Priority: P2
Blocked by: —

Отчёт: 1.7. Пути — от `libs/ngx-vflow/`.

## Проблема

- **Specs не запускаются.** `sourceRoot` проекта — `libs/ngx-vflow/src` (`project.json:3`), поэтому ни karma, ни CI (`.github/workflows/ci.yml:30`) не видят specs из `testing/src`. `--include=**/all-mocks.spec.ts` находит 0 из 0.
- **`all-mocks.spec.ts` падает при запуске:** `provideZonelessChangeDetection()` стоит в `imports` (`testing/src/all-mocks.spec.ts:156`).
- **Пример из docs падает.** Страница `apps/docs/src/app/categories/testing/pages/unit-testing-component-nodes/index.md` использует `provideCustomNodeMocks` с реальным `Vflow` и `<div resizable>`. Ошибка — NG0201 `RequestAnimationFrameBatchingService`: сервис даёт только `VflowComponent` (`src/lib/vflow/components/vflow/vflow.component.ts:144`), а `testing/src/provide-custom-node-mocks.ts` его не даёт.
- **Сигнатуры мока расходятся с реальными:**
  - `getNodesAtPoint()` без `point` (`testing/src/component-mocks/vflow-mock.component.ts:228`);
  - `getIntersectingNodes` не generic (`:233`);
  - `startConnection`/`startReconnection` без параметров (`testing/src/directive-mocks/connection-controller-mock.directive.ts`);
  - мок-`viewportChange$` эмитит начальное значение, реальный — `skip(1)`.
- **Мёртвые провайдеры** в `testing/src/provide-custom-node-mocks.ts`:
  - `ComponentEventBusService` (25-30);
  - `RootPointerDirective` и `SpacePointContextDirective` (52-72);
  - `NodeRenderingService` (83);
  - TODO «remove after the major release» (43).

## Сделать

- Включить specs `testing` в `nx test ngx-vflow` (include в karma-конфиге или отдельный target) и убедиться, что CI их гоняет.
- Исправить `all-mocks.spec.ts`.
- Провайдить `RequestAnimationFrameBatchingService` в `provideCustomNodeMocks`; добавить spec на пример из docs.
- Выровнять сигнатуры мока и поведение `viewportChange$`.
- Удалить мёртвые провайдеры, если specs остаются зелёными.
