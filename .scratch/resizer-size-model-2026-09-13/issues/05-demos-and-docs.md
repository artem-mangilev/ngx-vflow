# 05. Демо и документация

Status: resolved
Type: task
Blocked by: 03, 04

- Overview: transform-нода остаётся без `width/height` в данных; `Output` читает размер из состояния, которое store обновляет по `(nodesChanges.size)`, а не из `sourceNode.width?.()`.
- Nodes → Resizer: демо template-node без изменений данных; демо template-group убирает ручной `[style.width.px]`, если стоит `[resizable]`, либо документация объясняет, что значения совпадают.
- Страница Resizer: разделы «Режим размера» (auto/explicit, как приложение фиксирует размер через `nodesChanges.size` и `width/height`), «Один бокс» (`[resizable]` на верхнем элементе, border-box, min/max CSS), обновить фразу «библиотека меняет только размер контейнера».
- `CONTEXT.md`: добавить термин «Размер ноды» / «Режим размера».
- Migration guide: `NodeWithDefaults`, поле `mode` в size change, стили хоста.

## Comments

- `Output` в Overview показывает `W: 0 H: 0`: `connectedNodeWidth` читает `sourceNode.width?.()`, которого у auto-ноды после тикета 02 нет.
- `.transform-node` в режиме `auto` растягивается до 371px: `width: 100%` внутри `max-content` обёртки берёт ширину самой длинной строки текста. Заменить на `width: 240px` (или убрать `width/height: 100%`, полагаясь на `min-*`), так как явный размер после ресайза теперь приходит inline.

## Answer

- Overview: `FlowStoreService.sizes` заполняется из `(nodesChanges.size)`, `Output` читает размер оттуда. У transform-ноды `width: 240px` вместо `width/height: 100%`.
- Nodes → Resizer: у `.custom-node` убран `height: 100%`; у демо группы убраны ручные `[style.width.px]`/`[style.height.px]`, размер ставит `[resizable]`.
- Страница Resizer переписана: разделы «Node size modes» и «Where the size is applied» (верхний элемент, border-box, CSS min/max, без процентов, `[resizable]="false"`), событие `size` с правилом «сохранять только `explicit`». Фраза «библиотека меняет только размер контейнера» удалена.
- `CONTEXT.md`: термин «Node size mode».
- Migration guide: пример «After» для групп без биндингов размера и абзац про `[resizable]` как носитель размера. Внутристраничная ссылка `#node-size-modes` заменена упоминанием раздела: ng-doc отрисовывает её как `/#node-size-modes`, то есть на главную.

Проверки в браузере docs: transform-нода 240x320 без inline стилей, `Output` показывает `W: 240px H: 320px`; после жеста +60/+40 карточка 300x360 и `Output` `W: 300px H: 360px`. Resizer: группа 170x70 на своём элементе без ручных биндингов, ноды 150x100 без inline размера. Typecheck docs чистый.

Не относится к тикету: в демо accessibility `data.resizable` нигде не читается.
