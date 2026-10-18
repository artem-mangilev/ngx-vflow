# 07. Smoke-проверка генераторов на чистых проектах

Status: resolved
Type: task
Blocked by: 05, 06

## Что сделать

- Скрипт: свежий проект Angular CLI и свежий Nx-workspace, установка Tailwind v4 и собранного `@vflow/cli`, `init` + `ui`, `build`.
- Проверить в Chromium, что flow с нодой, портом, ребром, controls и badge рендерится в обеих темах.
- Заявленная совместимость Angular 20/21.

## Answer

2026-10-18: сделано. `apps/consumer/scripts/smoke-generators.mjs` (`nx run consumer:smoke`, не в CI: сеть и минуты): `ng new` на Angular 20 и 21, `create-nx-workspace@21` (Angular 20), Tailwind v4 по гайду, локальные тарболы `ngx-vflow` и `@vflow/cli`, `vflow.json` заранее (вопросы покрыты unit-тестами), `init` + `ui`, production-сборка, проверка в Chromium (Playwright из репозитория): по две ноды, порты, ребро с path, три кнопки controls, статус, фон ноды светлой и тёмной темы, радиус из шкалы `vui`, маппинг на `--v-*`, без ошибок консоли; скриншоты в папке прогона.

Найдено и исправлено:

- `public-api.ts` частей реэкспортировал типы без `type` — TS1205 при `isolatedModules`, который включает `ng new`. Исправлено; `ui:check-cli` (CI) компилирует части с `isolatedModules` и диагностикой только по `libs/ui`.
- `ngx-vflow` импортирует `@angular/cdk/a11y`, но не объявлял `@angular/cdk` в peer — сборка свежего проекта не находила модуль. Peer добавлен (`^20.0.0 || ^21.0.0`).
- npm сам ставит этот peer в последней версии (cdk 21 требует Angular 21) — ERESOLVE на Angular 20. `init`/`ui` добавляют `@angular/cdk` `^<мажор @angular/core>.0.0`, как spartan.
- `@nx/angular` в зависимостях `@vflow/cli` ломал установку на npm 10 (`Cannot read properties of null (reading 'edgesOut')`) в проекте Angular CLI. Теперь это optional peer (нужен только для Nx-библиотеки, в Nx Angular он есть), хелперы `@nx/js` заменены своими; зависимости CLI — `nx`, `@nx/devkit`, `enquirer`.
- npm 10 не может установить и сами свежие проекты Angular 21 / Nx 22 (та же ошибка арбориста, без vflow) — смоук создаёт проекты через npm 11.
- `create-nx-workspace@22` уже создаёт воркспейс на Angular 22, куда `ngx-vflow` (`^20 || ^21`) не ставится; смоук использует Nx 21. Поддержка Angular 22 — отдельное решение.
