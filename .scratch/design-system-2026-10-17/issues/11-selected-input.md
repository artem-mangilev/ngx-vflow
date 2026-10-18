# 11. Вход `selected` вместо `VuiSelected`, атрибут темы вместо `VuiTheme`

Status: resolved
Type: task
Blocked by: —

Спецификация: [spec.md](../spec.md), «Решения» → «Выделение — вход части».

## Что сделать

- `VuiNode`, `VuiContainer`, `VuiEdge`: вход `selected = input(false, { transform: booleanAttribute })`, host `[attr.data-vui-selected]`. Стили `data-[vui-selected=true]:` и reveal порта по `[data-vui-selected=true]` предка не меняются.
- Удалить `VuiSelected`, `VuiTheme` и `theme.directive.ts`; убрать их из `public-api.ts` и массива `Vui`.
- Docs, e2e, `apps/consumer`: `[vuiSelected]="…"` → `[selected]="…"`, `[vuiTheme]="x"` → `[attr.data-vui-theme]="x"` (статичное — `data-vui-theme="dark"`).
- Docs: тема ставится атрибутом на любой элемент, включая `<html>` в `index.html`.

## Готово, когда

- lint, `ui:check-styles`, docs-e2e design-system зелёные; поиск `vuiSelected|vuiTheme|VuiTheme|VuiSelected` по репозиторию пуст (кроме migration guide).

## Answer

2026-10-18: сделано. `theme.directive.ts` удалён; `VuiNode`, `VuiContainer`, `VuiEdge` получили вход `selected` → `[attr.data-vui-selected]`. Docs, consumer, README и комментарий в `vflow.component.scss` переведены на `[selected]` и `data-vui-theme`. Проверено: lint ui/docs, `ui:check-styles`, сборки ui/consumer/docs, e2e design-system, design-system-acceptance, accessibility, markers, pointer-interactions, viewport-gestures (31 тест).
