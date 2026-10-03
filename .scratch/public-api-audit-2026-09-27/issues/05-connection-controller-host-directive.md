# 05. Соединения не зависят от подписки на output

Status: resolved
Type: task
Priority: P1 (до 3.0)
Blocked by: —

Отчёт: 2.1. Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

Селектор `ConnectionControllerDirective` — это имена её outputs: `[connectStart], [connect], [connectEnd], [reconnectStart], [reconnect], [reconnectEnd]` (`directives/connection-controller.directive.ts:30-31`). Её инжектят как optional и без неё молча ничего не делают:

- `directives/handle.directive.ts:47,116-134`;
- `components/node/node.component.ts:176-186`;
- `components/edge/edge.component.ts`, reconnect.

Следствия:

- Импортирован `VflowComponent` вместо массива `Vflow` → `(connect)` компилируется как DOM-событие, handles не работают, ошибки нет.
- Не подписан ни один connection-output → соединения невозможны, хотя handles выглядят рабочими.
- `ChangesControllerDirective` и `NodeDragControllerDirective` при этом подключены как host directives `vflow` (`components/vflow/vflow.component.ts:97-117,147`). Однотипные outputs подключены двумя разными механизмами.

## Решить

- **Host directive (рекомендую):** сделать `ConnectionControllerDirective` host directive `vflow` и пробросить все шесть outputs.
- **Как тогда выключать соединения:**
  - ничего нового не вводить — выключают `canStart`/`canAccept` на handle;
  - или глобальный `[nodesConnectable]` по образцу `[nodesSelectable]`.
- **Экспорт:** убрать директиву из массива `Vflow` и из публичного экспорта (связано с 08).

## Сделать после решения

- `components/vflow/vflow.component.ts`, `vflow.ts`, `public-api.ts`; optional-inject в handle, node и edge заменить на обязательный.
- Мок: `VflowMockComponent` с теми же outputs; `libs/ngx-vflow/testing/src/directive-mocks/connection-controller-mock.directive.ts` удалить.
- Docs: `apps/docs/src/app/categories/edges/connections/index.md`, migration guide.
- spec:
  - flow без подписок на connection-outputs: жест от handle к handle рисует линию и завершается;
  - при подписке только на `(connectEnd)` событие приходит;
  - если выбран `[nodesConnectable]="false"`, жест не начинается.

## Answer

- `ConnectionControllerDirective` — host directive `vflow`, все шесть outputs проброшены; селектора у директивы больше нет.
- `[nodesConnectable]` не вводится: соединения выключают `canStart`/`canAccept` на handle.
- Директива убрана из массива `Vflow`; optional-инжекты в handle, node и edge стали обязательными.
- Полностью убрать её из `public-api.ts` нельзя: компилятор требует host directive в entry point (NG3001). Экспорт остался под внутренним именем `ɵConnectionControllerDirective`. Так же экспортирован `ɵViewportCullingDirective` — без него `nx build ngx-vflow` падал ещё до этого тикета.
- `ConnectionControllerMockDirective` удалён, шесть outputs объявлены в `VflowMockComponent`.
- spec в `directives/handle.directive.spec.ts`: жест без подписок рисует линию и завершается; подписка только на `(connectEnd)` получает событие.
