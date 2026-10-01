# 08. Публичный баррель: убрать внутреннее, добавить недостающее

Status: needs-triage
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
- **`ConnectionControllerDirective`** — по решению тикета 05.

## Добавить

- `ConnectionForValidation` — тип параметра validator'а.
- `NodeContext`, `EdgeContext`, `ConnectionContext`.
- Тип handle из событий соединения (`interface Handle`, `interfaces/connection-events.interface.ts:67-71`) под публичным именем, например `ConnectionEventHandle`.

## Проверки

- `nx build ngx-vflow` (включая `ngx-vflow/testing`).
- Поиск удалённых имён по `apps` и `libs`.
- Migration guide: раздел Removed APIs.
