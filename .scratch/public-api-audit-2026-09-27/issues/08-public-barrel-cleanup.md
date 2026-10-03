# 08. Публичный баррель: убрать внутреннее, добавить недостающее

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 3.3, 4.8. Файлы: `libs/ngx-vflow/src/public-api.ts`, `libs/ngx-vflow/src/lib/vflow/vflow.ts`; остальные пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Убрать (предложение)

- **`ChangesControllerDirective`** (селектор `[changesController]`, вне `vflow` падает по DI) и **`NodeDragControllerDirective`** (без селектора). Экспортировать только типы событий, а три одинаковых `{ node }` (`NodeDragStartEvent`, `NodeDragEvent`, `NodeDragEndEvent`, `directives/node-drag-controller.directive.ts:7-18`) свести к одному `NodeDragEvent`.
- **`NodeResizeControlComponent`** (`[nodeResizeControl]`): экспортирован, но не входит в `Vflow`, без мока, API на callback-inputs. Решить:
  - внутренний (рекомендую);
  - или публичный примитив для собственных ручек — тогда в `Vflow`, с outputs вместо callback-inputs и с моком.
- **Из `public-components/resizable/resizer-types.ts`:**
  - `CoordinateExtent`, `NodeOrigin` (всегда `[0, 0]`);
  - `RESIZER_HANDLE_POSITIONS`, `RESIZER_LINE_POSITIONS`;
  - `ResizeControlVariant` — единственный `enum` в API;
  - `OnResizeStart`, `OnResize`, `OnResizeEnd`;
  - `ControlPosition`/`ControlLinePosition` — если `NodeResizeControlComponent` становится внутренним.
- **Константы:** `NODE_DEFAULTS` (`width: 100, height: 50` с 3.0 к данным не применяются), `EDGE_DEFAULTS`, `MARKER_DEFAULT_TYPE` — внутренние.
- **`isComponentNode`** — однострочник без пары для рёбер.
- **Двойной `export * from connection.interface`** (`public-api.ts:20-21`).
- ~~**`ConnectionControllerDirective`**~~ — убрана в тикете 05 (2026-10-03).

## Добавить

- `ConnectionForValidation` — тип параметра validator'а.
- `NodeContext`, `EdgeContext`, `ConnectionContext`.
- Тип handle из событий соединения (`interface Handle`, `interfaces/connection-events.interface.ts:67-71`) под публичным именем, например `ConnectionEventHandle`.

## Проверки

- `nx build ngx-vflow` (включая `ngx-vflow/testing`).
- Поиск удалённых имён по `apps` и `libs`.
- Migration guide: раздел Removed APIs.

## Answer

Решения (2026-10-03): `NodeResizeControlComponent` — внутренний; `isComponentNode` убран; все константы с дефолтами внутренние; тип handle — `ConnectionEventHandle`.

- **Host-директивы.** `ChangesControllerDirective` и `NodeDragControllerDirective` убрать из `public-api.ts` нельзя: компилятор требует host directive в entry point (NG3001). Экспорт остался под `ɵChangesControllerDirective` и `ɵNodeDragControllerDirective`, как у `ɵConnectionControllerDirective` в тикете 05. Селектор `[changesController]` удалён.
- **События drag.** Один `NodeDragEvent`; `NodeDragStartEvent` и `NodeDragEndEvent` удалены.
- **Resizer.** `NodeResizeControlComponent` и `CoordinateExtent`, `NodeOrigin`, `ControlPosition`, `ControlLinePosition`, `ResizeControlVariant`, `RESIZER_HANDLE_POSITIONS`, `RESIZER_LINE_POSITIONS`, `OnResizeStart`, `OnResize`, `OnResizeEnd` больше не экспортируются. Публичными остались `ResizeParams`, `ResizeParamsWithDirection`, `ResizeControlDirection`, `ResizeDragEvent`, `ShouldResize`. Сам код resizer'а не менялся, `enum` остался внутри.
- **Константы.** Не экспортируются `NODE_DEFAULTS`, `EDGE_DEFAULTS`, `MARKER_DEFAULT_TYPE`, а также `DEFAULT_OPTIMIZATION` и `DEFAULT_ARIA_LABEL_CONFIG` (в тикете их не было). `VflowMockComponent.optimization` — литерал с типом `Optimization` вместо `Required<Optimization>`, как у input'а настоящего компонента.
- **`isComponentNode`** удалён из кода.
- **Добавлено:** `ConnectionForValidation`, `NodeContext`, `EdgeContext`, `ConnectionContext`, `ConnectionEventHandle` (бывший неэкспортированный `interface Handle`). По собранному `index.d.ts` других неэкспортированных типов в пользовательских сигнатурах нет.
- **Баррель.** Файлы с внутренними именами экспортируются поимённо вместо `export *`; двойной экспорт `connection.interface` убран; `gesture-exclusions` и `auto-pan-settings` перенесены из секции `Internals`.
- **Migration guide.** Четыре строки в «Removed APIs» (в v2 существовали только host-директивы, `NodeDragStartEvent`/`NodeDragEndEvent`, `isComponentNode`, `NODE_DEFAULTS`/`EDGE_DEFAULTS`/`DEFAULT_OPTIMIZATION`); убраны «`isComponentNode` stays» и упоминание resize control callbacks.
- **Проверки:** `nx build ngx-vflow` (с `ngx-vflow/testing`), `nx build ui`, `nx build docs`, lint `ngx-vflow` и `ui` — проходят. `nx test ngx-vflow`: 410 из 410 в двух прогонах из трёх; в одном упал `stacking-context.spec.ts` — известный order-flaky spec, к баррелю не относится. Specs `ngx-vflow/testing` не запускались (тикет 16).
- **Следствия для других тикетов:** `[nodeResizeControl]` выпадает из тикета 09; мок для него в тикете 17 не нужен.
