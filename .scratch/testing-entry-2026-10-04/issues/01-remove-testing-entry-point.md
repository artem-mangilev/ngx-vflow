# 01. Убрать `ngx-vflow/testing`

Status: resolved
Type: task
Blocked by: —

Решение (2026-10-04): моки убираем сразу в 3.0, без deprecated-периода.

## Answer

- Удалён `libs/ngx-vflow/testing` целиком: `VflowMocks`, 13 мок-компонентов и директив, `provideCustomNodeMocks`, три spec-файла (22 теста).
- Убраны path `ngx-vflow/testing` из `tsconfig.json`, include `testing/**` из `vitest.config.mts`, упоминание в `README.md`.
- Из `public-api.ts` убраны `ɵ`-экспорты, которые нужны были только testing: три модели, десять сервисов, `ɵRootPointerDirective`, `ɵSpacePointContextDirective`. Остались четыре host-директивы `vflow` (NG3001).
- ADR-0009 фиксирует решение. Тикет 17 аудита публичного API закрыт как `wontfix`.
