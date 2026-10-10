# 22. `<vflow>`: перевести `@Input` setter'ы на signal `input()`

Status: needs-triage
Type: task
Priority: P3 (не ломающее для шаблонной привязки)
Blocked by: —

Выделено из [13](13-object-settings-semantics.md). Пути — от `libs/ngx-vflow/src/lib/vflow/`.

## Проблема

`components/vflow/vflow.component.ts` держит ~30 `@Input()` setter'ов, каждый пишет в сигнал `FlowSettingsService` (или `FlowEntitiesService`, `KeyboardService`). Единственные signal `input()` — `alignmentHelper` и `markerShapes`, и они синхронизируются в сервис через `effect` в конструкторе. Два стиля в одном компоненте; императивная запись `flow.minZoom = 2` из кода работает с setter'ами, но не с `input()`.

## Решить

- **Куда перенести источник правды:** (а) оставить сигналы в `FlowSettingsService`, добавить по `effect` на input (как сейчас у `alignmentHelper`); (б) сделать сервисные сигналы `computed` от inputs компонента — сервис получает ссылку на компонент или на объект inputs; (в) не переводить, а наоборот перевести `alignmentHelper`/`markerShapes` на setter'ы ради единообразия.
- **Императивная запись из спеков:** спеки (`viewport-gestures.spec.ts`, `keyboard-navigation.spec.ts`, `minimap-navigation.spec.ts`) пишут `flow.keyboardShortcuts = ...` напрямую. С `input()` это станет `fixture.componentRef.setInput(...)`.
- **Нормализация значений:** `paneClickDistance`, `nodeDragThreshold`, `connectionDragThreshold` клампят в setter'е; `connection` использует `transform`. С `input()` это `input(0, { transform })`.
