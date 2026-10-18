# 04. Генератор `ui`

Status: needs-triage
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
