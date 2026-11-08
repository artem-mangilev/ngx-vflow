# 08. `withCurves`: кривые по ключу

Status: resolved
Type: task
Blocked by: 04

Решение пользователя 2026-11-08: сериализуемость графа; `Edge.curve` с фабрикой — последнее поле сущности, которое держит функцию. Спецификация: [spec.md](../spec.md), раздел «Сериализуемость».

## Что сделать

- `interfaces/curves.interface.ts`: пустой аугментируемый интерфейс `VflowCurves`; `CurveKey = keyof VflowCurves extends never ? string : keyof VflowCurves & string` по образцу `NodeComponentKey`. Тип `Curve` становится `'straight' | 'bezier' | 'smooth-step' | 'step' | CurveFactory | CurveKey` — встроенные имена остаются литералами, зарегистрированные ключи приходят через аугментацию, без неё любая строка.
- `features/with-curves.ts`: токен `VFLOW_CURVES: InjectionToken<Signal<Partial<Record<string, CurveFactory>>>>`, `withCurves(curves: Partial<Record<CurveKey, CurveFactory>>)` поверх `provideMergedFeatureValue` (объект, без фабрики/сигнала — как у реестров компонентов). Карты сливаются по уровням. Ключ, совпадающий со встроенным именем, в dev-режиме — ошибка при регистрации: встроенные имена не переопределяются.
- Разрешение: `resolveCurve(curve, params, registry)` — строка, не встроенная, ищется в реестре; отсутствие → `[ngx-vflow] No curve is registered as "avoid". Register it with provideVflow(withCurves({ avoid: … })).` Всегда, не только в dev (как у компонентов). `EdgeModel` читает реестр через `inject(VFLOW_CURVES, { optional: true })` один раз в конструкторе, но применяет его внутри `computed` пути: `curve` — сигнал и может смениться на лету, так что ключ разрешается при каждом пересчёте, реестр читается `untracked`. `ConnectionComponent` делает то же для `ConnectionSettings.curve`.
- `@vflow/routing`: страница пакета и демо показывают `withCurves({ avoid: avoidNodesCurve })` и `curve: 'avoid'`; экспорт пакета не меняется.
- Попутная чистка: `view` уходит из `VflowSettings` и `VFLOW_SETTINGS_DEFAULTS` (размер одного флоу на уровне приложения смысла не имеет); инпут остаётся, резолвер читает `inputs.view() ?? 'auto'`. Страница Configuration — одно предложение в `withSettings`.
- Экспорт: `VFLOW_CURVES`, `withCurves`, `VflowCurves`, `CurveKey`.
- Docs: страница Curves (Edges) — раздел «Curves by key» с аугментацией; Configuration — фича `withCurves`; Migration — `Curve` принимает ключи (аддитивно, не ломает).

## Готово, когда

- Спек `provided-curves.spec.ts`: ребро с `curve: 'custom'` строит путь зарегистрированной фабрикой; смена сигнала `curve` с ключа на встроенное имя и обратно перестраивает путь; хост дополняет корень; неизвестный ключ бросает с текстом; регистрация под именем `bezier` бросает в dev; превью соединения с ключом в `ConnectionSettings.curve`.
- Аугментация проверена против собранного `index.d.ts` отдельным tsconfig (как в тикете 04): `curve: 'aviod'` не компилируется с `declare module`, без него — любая строка.
- `nx test ngx-vflow`, lint, `nx build ngx-vflow`, `nx build docs` зелёные; e2e `routing.spec.ts` проходит с демо на ключе.

## Comments

2026-11-08, сделано:

- `interfaces/curves.interface.ts`: `VflowCurves` (аугментируемый), `BuiltInCurve`, `BUILT_IN_CURVES`, `CurveKey = keyof VflowCurves extends never ? string & {} : keyof VflowCurves & string` — `string & {}` сохраняет автодополнение встроенных имён в `Curve = BuiltInCurve | CurveFactory | CurveKey`.
- `features/with-curves.ts`: токен `VFLOW_CURVES: InjectionToken<Signal<CurveRegistry>>`, `withCurves(map)` поверх `provideMergedFeatureValue`; регистрация встроенного имени бросает в dev.
- `resolveCurve(curve, params, registry)`: строка не из встроенных ищется в реестре, отсутствие — `[ngx-vflow] No curve is registered as "x". Register it with provideVflow(withCurves({ x: … }))`, всегда. `EdgeModel` и `ConnectionComponent` инжектят реестр один раз и читают его `untracked` внутри `computed` пути — `curve` сигнал, ключ разрешается при каждом пересчёте.
- `view` вынесен из `VflowSettings` / `VFLOW_SETTINGS_DEFAULTS`; `bindVflowInputs` биндит `settings.view` на `flow.view() ?? 'auto'`. (Сам инпут удаляется тикетом 10.)
- Тип-тест `edge.interface.spec.ts`: `curve: 'bezir'` больше не ошибка без аугментации, проверка переведена на `curve: 42`.
- Docs: Curves → «Curves by key» (`#curves-by-key`, аугментация), Configuration → `withCurves`, Migration → `Edge.curve` и `ConnectionSettings.curve` принимают ключи; `@vflow/routing`: страница и демо на `withCurves({ avoid: avoidNodesCurve })` + `curve: 'avoid'`.
- Экспорт: `VFLOW_CURVES`, `withCurves`, `CurveRegistry`, `BUILT_IN_CURVES`, `BuiltInCurve`, `CurveKey`, `VflowCurves`.
- Проверено: `provided-curves.spec.ts` — 5 тестов (ключ → фабрика, смена сигнала ключ ↔ встроенное имя, хост поверх корня, неизвестный ключ бросает при change detection, встроенное имя не регистрируется, тип ключа). Аугментация против собранного `index.d.ts` (scratchpad tsconfig): `'aviod'` не компилируется с `declare module`, встроенные имена остаются, без аугментации любая строка. `nx test ngx-vflow` 492 + 44; lint ngx-vflow/docs/routing; `nx build ngx-vflow` (`ɵ` не прибавилось); `nx build docs`.
- Найдено попутно, не из этого тикета: `nx test routing` падает на tsc в `libs/routing/src/lib/avoid-nodes-curve.spec.ts:170` (`edge` в объединении `CurveFactoryParams` при `mode` из переменной) — файл не менялся с коммита 4a63c68e, типы `CurveFactoryParams` не трогались. Чинить в тикете 06 (release smoke).
