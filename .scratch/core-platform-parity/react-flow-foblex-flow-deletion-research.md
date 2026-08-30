# Удаление из custom UI: React Flow и Foblex Flow

Дата: 2026-08-29

## Вопрос

Как библиотеки обрабатывают нажатие на произвольную кнопку внутри custom node и как оно соотносится с удалением по хоткею?

## React Flow

- Публичный instance API `deleteElements({ nodes, edges })` принимает id сущностей, добавляет связанные edges и дочерние nodes, а затем возвращает фактически удалённый набор. [Документация](https://reactflow.dev/api-reference/types/delete-elements), [реализация](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useReactFlow.ts#L163-L203).
- Встроенный обработчик `Backspace` вызывает именно `deleteElements` для выбранных nodes и edges. Поэтому кнопка custom node может получить instance через `useReactFlow()` и вызвать тот же метод. [Реализация хоткея](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useGlobalKeyHandler.ts#L18-L37).
- Перед удалением общий расчёт исключает `deletable: false`; затем `onBeforeDelete` может отменить запрос или подменить набор nodes/edges. [Реализация расчёта](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts#L483-L544), [API callback](https://reactflow.dev/api-reference/react-flow#on-before-delete).
- После этого React Flow применяет изменения к своему store / controlled callbacks (`onNodesChange`, `onEdgesChange`) и вызывает post-factum callbacks. Это отличается от требуемой для ngx-vflow модели, где структурными коллекциями владеет приложение.

## Foblex Flow

- В обычном stateless режиме `Delete`/`Backspace` эмитит `(fDeleteSelected)` с выбранными `nodeIds`, `groupIds` и `connectionIds`. Библиотека сама данные не меняет: обработчик приложения удаляет записи из своих коллекций. [Документация](https://flow.foblex.com/docs/f-draggable-directive), [тип события](https://github.com/Foblex/f-flow/blob/main/libs/f-flow/src/f-draggable/f-delete-selected-event.ts).
- `FFlowComponent` не публикует метод удаления: его imperative API ограничен запросами состояния и selection. Значит custom-кнопка — обычный Angular `(click)`, который вызывает обработчик приложения; библиотека не пытается обнаруживать такие кнопки. [Документация FFlowComponent](https://flow.foblex.com/docs/f-flow-component).
- В opt-in `withFlowState()` есть `removeNodes` / `removeGroups` / `removeConnections`; они каскадируют связанные connections и создают undo step. Это отдельный store, не поведение stateless core. [Документация](https://flow.foblex.com/examples/state), [реализация](https://github.com/Foblex/f-flow/blob/main/libs/f-flow/src/plugins/state/f-flow-state.ts#L288-L357).

## Вывод для ngx-vflow

Не следует распознавать DOM-клик, добавлять CRUD-метод во facade или вводить отдельный deletion lifecycle. В application-owned модели custom-кнопки и другой прикладной UI напрямую используют существующие `removeNodes` и `removeEdges`; игнорирование результата уже является veto, а иное обновление коллекций — application-defined transformation.

Issue 11 добавит только keyboard-событие с выбранными node и edge ids. Приложение обработает их теми же pure helpers. Это покрывает оба источника без нового request helper, второго state store или imperative CRUD API.
