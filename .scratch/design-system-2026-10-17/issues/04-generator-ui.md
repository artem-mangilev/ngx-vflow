# 04. Генератор `ui`

Status: resolved
Type: task
Blocked by: 03, 10

Спецификация: [spec.md](../spec.md), «Генераторы» → `ui`. Образец — spartan `libs/cli/src/generators/ui`, `base`, `utils/config.ts`.

## Что сделать

- `vflow.json`, раздел `ui`: создаётся первым `ui` с вопросами `componentsPath` (`libs/ui`; без вопроса при `--directory`), `importAlias` (`@vflow/ui`), в Nx `buildable`; валидация схемой только своего раздела, ошибки таблицей; чужие разделы сохраняются.
- Копирование всего набора в `<componentsPath>/src`: Angular CLI — tsconfig path `<importAlias>` и include в `tsconfig.app.json`; Nx — одна Angular-библиотека с import path `<importAlias>`.
- Повторный запуск создаёт только недостающие файлы, `index.ts` не переписывает и печатает неэкспортированные части.
- `ngx-vflow` — в `package.json` и задача установки.

## Тесты

Unit: создание и чтение раздела `ui`, невалидный раздел, `vflow.json` с другим разделом, Angular CLI path и include, Nx-библиотека buildable и нет, повторный запуск с изменённым и удалённым файлом, npm-зависимости.

## Answer

2026-10-18: сделано.

- `utils/config.ts`: раздел `ui` в `vflow.json` — чтение с валидацией (дефолты для пропущенных полей, `console.table` ошибок, alias без `/` в конце) или вопросы enquirer (`componentsPath` пропускается при `--directory`, `buildable` только в Nx); другие разделы файла сохраняются.
- `generators/ui`: признак установки — alias в paths корневого tsconfig. Первый запуск: Angular CLI — `addTsConfigPath` и glob в `tsconfig.app.json` (с сохранением `src/**/*.ts`); Nx — `@nx/angular` `libraryGenerator` (`importPath` = alias, prefix `vui`), его `src/lib/*` и `index.ts` заменяются набором. Повторный: только недостающие файлы, `index.ts` не трогается, предупреждение о неэкспортированных частях.
- `utils/dependencies.ts`: `ngx-vflow` `^<версия CLI>`, общий с `init`.
- 10 unit-тестов `ui` (всего 24). Проверено вне vitest: CLI, транспилированный esbuild в раскладку пакета, на scratch-приложении Angular CLI — `init` + `ui` пишут зависимость, пресет под комментарием `ng new` после `@import 'tailwindcss'`, тему, path и include; части совпадают с `libs/ui`, `tsc` проходит, Tailwind с автопоиском генерирует utilities частей. `cli:lint`, prettier, `ui:check-cli` зелёные.
