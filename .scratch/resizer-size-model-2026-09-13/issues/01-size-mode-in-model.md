# 01. Режим размера в NodeModel

Status: resolved
Type: task
Blocked by: —

Ввести `sizeMode` в `NodeModel` по решению D1 из `spec.md`.

- `resizedExplicitly = signal(false)` (внутренний), `sizeMode = computed(...)`.
- В `node.component.html` заменить `controlledByResizer()` на `sizeMode() === 'explicit'` как временный шаг; окончательно inline размер уедет с `.wrapper` в тикете 03.
- Расширить `NodeSizeChange` полем `mode`, заполнять в `NodesChangeService`.
- Спеки: `node.model.spec` (три источника режима), `node-changes` (поле `mode`).

Файлы: `libs/ngx-vflow/src/lib/vflow/models/node.model.ts`, `types/node-change.type.ts`, `services/node-changes.service.ts`, `components/node/node.component.html`.

## Answer

Сделано: `NodeModel.resizedExplicitly` + `sizeMode`, `NodeSizeMode` и поле `mode` в `NodeSizeChange`, `NodesChangeService` заполняет режим, `node.component.html` использует `sizeMode() === 'explicit'`. Переключение режима на первом принятом изменении уже добавлено в `NodeResizeControlComponent.onChange` (часть тикета 04). Спеки: `node.model.spec.ts` (sizeMode), новый `node-changes.service.spec.ts`. Документация handling-changes дополнена.
