# 01. `VflowFeature`, `vflowFeature`, `provideVflow`

Status: resolved
Type: task
Blocked by: —

Спецификация: [spec.md](../spec.md), решение 1.

## Что сделать

- Новая папка `libs/ngx-vflow/src/lib/vflow/features/`. Перенести из ветки `plugin-system` (`git show 5695d10da:libs/ngx-vflow/src/lib/vflow/features/feature.ts`) класс `VflowFeature<K extends string = string>` (приватный конструктор, `declare private readonly brand: never`, `@internal static create`), функцию `vflowFeature(kind, providers)` и `provideVflow(...features: VflowFeature[]): Provider[]`. Реестр, `VflowContext`, токены transform/policy и сентинел `VFLOW_PROVIDE_MARKER` не переносить.
- Dev-проверки за `typeof ngDevMode === 'undefined' || ngDevMode`: аргумент не `VflowFeature`; один `kind` дважды в одном вызове. Тексты ошибок с префиксом `[ngx-vflow]` и подсказкой («features are built with a with*() function or vflowFeature()»).
- Хелпер `features/merged-feature-value.ts` для фабрик `with*()`: `provideMerged(token, value)` возвращает `{ provide: token, useFactory }`, где фабрика берёт `inject(token, { skipSelf: true, optional: true })`, вызывает `value`, если это функция (в контексте инжектора), и возвращает `Signal<Partial<T>>`: `computed(() => withDefaults(parent?.() ?? {}, own()))`, где `own` — сигнал, если фабрика вернула сигнал, иначе константа. Один хелпер на три фичи (02–04), чтобы семантика слияния не разъехалась.
- Экспорт из `public-api.ts`: `VflowFeature`, `vflowFeature`, `provideVflow`. Хелпер слияния не экспортировать.

## Готово, когда

- `features/provide-vflow.spec.ts`: пустой вызов даёт `[]`; фича с провайдером видна компоненту-хосту и `<vflow>` внутри; не-фича и дубликат `kind` бросают в dev; `vflowFeature('acme:x', [...])` проходит.
- `features/merged-feature-value.spec.ts`: родительский уровень + свой — ключи сливаются, ближайший побеждает; фабрика видит `inject()`; возвращённый сигнал читается реактивно.
- Ничего нового под `ɵ`; ESLint и Prettier чистые.

## Comments

2026-11-08, сделано:

- `libs/ngx-vflow/src/lib/vflow/features/feature.ts`: `VflowFeature<K>` (readonly `kind`, `providers`, `declare private brand` для номинальности), `vflowFeature(kind, providers)`, `provideVflow(...features): Provider[]` — сплющивает провайдеры фич; в dev (`typeof ngDevMode === 'undefined' || ngDevMode`, глобал объявлен в `@angular/core`) бросает на не-фиче и на дубликате `kind` в одном вызове.
- Отличие от ветки `plugin-system`: конструктор публичный, а не приватный с `@internal static create` — `tsconfig.lib.json` намеренно держит `stripInternal: false`, и статик всё равно попадал бы в `index.d.ts`. Сентинел «provideVflow дважды» не перенесён (per-feature токены, last-wins).
- `features/merged-feature-value.ts`: `provideMergedFeatureValue(token, value)` и тип `FeatureValue<T> = Partial<T> | Signal<Partial<T>> | (() => Partial<T> | Signal<Partial<T>>)`; фабрика берёт `inject(token, { skipSelf: true, optional: true })` и отдаёт `computed(() => withDefaults(parent?.() ?? {}, own()))`. Не экспортируется из `public-api`.
- Экспорт: `VflowFeature`, `provideVflow`, `vflowFeature` (секция «Features» в `public-api.ts`).
- Проверено: `tsc -p tsconfig.spec.json` чистый; `vitest run src/lib/vflow/features` — 9 тестов зелёные (хост-компонент и флоу видят фичу с хоста; фича с корня; дубликат/не-фича бросают; слияние уровней по ключам, `undefined` проваливается наверх; фабрика с `inject()` и сигнал реактивны); ESLint и Prettier чистые; `nx build ngx-vflow` — в `index.d.ts` три новых символа, ничего нового под `ɵ`. Полный `nx test ngx-vflow` не гонялся — изменения не трогают существующие пути, прогон в тикете 06.
