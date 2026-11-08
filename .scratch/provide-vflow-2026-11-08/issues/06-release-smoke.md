# 06. Release smoke

Status: ready-for-agent
Type: task
Blocked by: 05, 08, 09

## Что сделать

- `nx build ngx-vflow`; проверить в `dist/libs/ngx-vflow/index.d.ts` экспорт `provideVflow`, `vflowFeature`, `VflowFeature`, `withSettings`, `withAccessibility`, `withNodeComponents`, `withEdgeComponents`, токены и типы ключей; `grep ɵ` не выросло.
- `nx test ngx-vflow --skip-nx-cache` (jsdom и browser mode), `nx test` для `node-dom`; `nx lint`.
- Playwright: `apps/docs-e2e` на страницах accessibility, custom nodes, configuration (новый спек: второй флоу на странице видит компонентное переопределение).
- Пакеты `@vflow/layout`, `@vflow/routing`, `@vflow/auto-size` собираются против новой сборки без изменений.

## Готово, когда

- Всё зелёное, результаты записаны в Comments этого тикета.
