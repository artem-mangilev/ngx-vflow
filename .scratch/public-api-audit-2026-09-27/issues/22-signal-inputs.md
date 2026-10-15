# 22. `<vflow>`: перевести `@Input` setter'ы на signal `input()`

Status: resolved
Type: task
Priority: P2 (до 3.0: ломает чтение `minZoom`/`maxZoom` и запись свойств из кода)
Blocked by: —

Выделено из [13](13-object-settings-semantics.md). Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

`components/vflow/vflow.component.ts` держит ~30 `@Input()` setter'ов, каждый пишет в сигнал `FlowSettingsService` (или `FlowEntitiesService`, `KeyboardService`). Единственный signal `input()` — `alignmentHelper`, он синхронизируется в сервис через `effect` в конструкторе. Два стиля в одном компоненте; императивная запись `flow.minZoom = 2` из кода работает с setter'ами, но не с `input()`.

## Решить

- **Куда перенести источник правды:** (а) оставить сигналы в `FlowSettingsService`, добавить по `effect` на input (как сейчас у `alignmentHelper`); (б) сделать сервисные сигналы `computed` от inputs компонента — сервис получает ссылку на компонент или на объект inputs; (в) не переводить, а наоборот перевести `alignmentHelper`/`markerShapes` на setter'ы ради единообразия.
- **Императивная запись из спеков:** спеки (`viewport-gestures.spec.ts`, `keyboard-navigation.spec.ts`, `minimap-navigation.spec.ts`) пишут `flow.keyboardShortcuts = ...` напрямую. С `input()` это станет `fixture.componentRef.setInput(...)`.
- **Нормализация значений:** `paneClickDistance`, `nodeDragThreshold`, `connectionDragThreshold` клампят в setter'е; `connection` использует `transform`. С `input()` это `input(0, { transform })`.

## Решение (2026-10-15)

- **Вариант (б), без `effect` на каждый input.** Поля настроек в `FlowSettingsService` — `bindableSignal`: read-only сигнал со значением по умолчанию, которому можно подставить источник. `<vflow>` объявляет каждую настройку как `input()`; конструктор вызывает `bindVflowInputs(this)` (`components/vflow/bind-vflow-inputs.ts`), которая один раз делает `settings.bind({ minZoom: flow.minZoom, … })` и держит effect'ы `nodes`/`edges`. Сервис видит настоящие сигналы до создания дочерних элементов, поэтому нет запаздывания на тик. Ссылки на поля сервиса, взятые до `bind`, остаются живыми: поле — `computed` от текущего источника. Юнит-тесты директив без компонента делают `settings.bind({ nodeDragThreshold: signal(10) })`.
- **Нормализация — в `transform`:** клампы порогов, `withDefaults` для `ariaLabelConfig`, `optimization`, `selectionBox`. Чтение `flow.optimization()` отдаёт уже дополненный объект.
- **`connection`:** `input<ConnectionSettings>({})`, `FlowEntitiesService.connection` — `computed` от привязанных настроек. Внутренний `ConnectionModel` не попадает в публичный тип.
- **`keyboardShortcuts`:** `KeyboardService` привязывает сигнал настроек, разбор — `computed`. Активность модификаторов считается при чтении из нажатых клавиш, поэтому смена настроек действует сразу без `updateActive()`; неиспользуемый `modifiersActive$` удалён.
- **`nodes`/`edges`:** `input.required<Node[]>()` и `input<Edge[]>([])` + по одному `effect`, который сверяет модели (`ReferenceIdentityChecker`) и пишет в `FlowEntitiesService`. `computed`/`linkedSignal` не подходят: сверка пишет в модели рёбер и в `NodeRenderingService`.
- **`minZoom`/`maxZoom`** — signal inputs, геттеры удалены; `vui-controls` читает `flow().minZoom()`.
- **Запись из кода** (`flow.x = …`) больше не работает. Спеки задают настройки через host-шаблон или `componentRef.setInput`.
