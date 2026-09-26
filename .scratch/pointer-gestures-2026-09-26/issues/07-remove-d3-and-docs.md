# 07. Удаление d3 из зависимостей, документация, миграция

Status: resolved
Type: task
Blocked by: 04, 05, 06

- `libs/ngx-vflow/package.json`: удалить `d3-drag`, `d3-selection`, `d3-zoom`, `@types/d3-*` из `peerDependencies`.
- Корневой `package.json`: удалить `d3-drag`, `d3-selection`, `d3-zoom` и их `@types`; оставить `d3-force`/`@types/d3-force` (cookbook `force`). `npm install`, проверить `package-lock.json`; `npm ls d3-zoom d3-drag d3-selection` пуст.
- `grep -rn "d3" libs/ apps/docs/src --include=*.ts --include=*.md`: остаются только cookbook force и easy-connect demo (проверить, что там за использование).
- JSDoc `panTo` в `vflow.component.ts` («D3 zoom translation»); `viewport.service.ts` («default value used by d3»); `allow-root-zoom-for-node-target.ts`.
- Дока `interactions/viewport-gestures`: абзац «An already-started D3 mouse drag finishes normally…» → без d3; раздел «Page scrolling» дополнить правилами `touch-action` из D3 по результату тикета 01.
- Дока `introduction/migration`: пункт «удалите d3-пакеты», `ResizeDragEvent`, синтетические события в тестах приложений.
- `ctxbrew`-контекст библиотеки (`libs/ngx-vflow/ctxbrew`), если там перечислены зависимости или жесты.
- `CONTEXT.md`: при необходимости термин «Жест»/«Pointer gesture» (через `/domain-modeling`, не вручную).
- Коммит: `feat(core)!: replace d3 zoom and drag with pointer gestures` + `BREAKING CHANGE:` футер (см. `docs/releasing.md`).

## Answer

Сделано: d3-drag/-selection/-zoom и их `@types` удалены из peer-зависимостей библиотеки и из корня; `d3-force` оставлен для cookbook. d3 остаётся в `node_modules` транзитивно через `@ng-doc/app` → mermaid, это инструментарий docs. `dist/libs/ngx-vflow/fesm2022/ngx-vflow.mjs` импортирует только Angular и rxjs. Размер: использованный стек d3 ≈ 51 КБ min / 17 КБ gzip, вспомогательный модуль жестов ≈ 5 КБ / 2 КБ. Дока `viewport-gestures`: демо с переключателями, таблица `touch-action`, без упоминания D3; миграция 3.0: раздел «Gestures without d3». JSDoc `panTo` и `ViewportService` без d3. Термин в `CONTEXT.md` не добавлялся: он не понадобился.
