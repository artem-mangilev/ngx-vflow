# 06. Меньше DOM-обёрток на узел и ребро

Status: needs-triage
Type: task
Blocked by: —

На узел приходится 13 элементов: `div[node]` → `.selectable` → `.wrapper` → `docs-node` → `.card` → текст + два порта; на ребро 5: `svg[edge]` → `path.focus-indicator` + `g` презентации → интеракционный `path` + видимый `path`. Итого ~64 700 элементов на 4900 узлов. Полный recalc style стоит ~0.55 с при загрузке (prod), и любое наследуемое свойство на корне снова заставит пересчитать всё; при zoom-out p90 кадра 37 мс (prod) в основном из-за style/layout возвращаемых в layout узлов.

Направления:

- Слить `.selectable` и `.wrapper` (клик-обработчик и `nodeHandlesController`/`nodeResizeController` могут жить на одном элементе).
- `path.focus-indicator` создавать только у сфокусированного ребра (как магниты создаются только во время соединения).
- Для документации: у `docs-node` host `display:block` плюс `.card` — можно свести к одному элементу.

Метрика: `dom` в `profile.mjs load` и `recalcMs` при загрузке; p90 кадра в `zoomout`.
