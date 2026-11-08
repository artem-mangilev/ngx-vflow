# 08. `withCurves`: кривые по ключу

Status: ready-for-agent
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
