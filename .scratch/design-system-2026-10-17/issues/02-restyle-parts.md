# 02. Перевести все части на шкалы

Status: resolved
Type: task
Blocked by: 01

## Что сделать

- Все директивы `libs/ui/src/lib` и `libs/ui/bpmn/src` используют только utilities токенов `vui` и целые шаги сетки. Убрать `rounded-[7px]`, `text-[13px]`, `py-1.75`, `px-2.25`, `min-h-9.5`, захардкоженные тени.
- Концентричность: controls/toolbar `radius-surface` с отступом 4px, кнопки внутри `radius-control`.
- Кнопка и control button — `md` 28px; иконки в toolbar — `sm` 24px; строка поля 32px; порт 10px.
- Нода: без заливки заголовка, только hairline-разделитель; плоская тень `shadow-vui-node`. Controls/toolbar: `shadow-vui-floating` + материал.
- Единое кольцо выделения/фокуса (`selection`, 2px, offset 2px) во всех частях, включая BPMN.
- Классы в `host.class` сгруппированы по назначению (layout / цвет / состояния / forced-colors).
- `check-styles.mjs`: запрет arbitrary values в классах частей, кроме помеченных комментарием исключений.

## Готово, когда

- `nx run ui:check-styles`, lint и docs-e2e design-system зелёные; скриншоты пяти reference-страниц в обеих темах просмотрены.
