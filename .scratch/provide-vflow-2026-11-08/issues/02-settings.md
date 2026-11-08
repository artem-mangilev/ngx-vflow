# 02. `withSettings` и резолвер «инпут → провайдер → дефолт»

Status: resolved
Type: task
Blocked by: 01

Спецификация: [spec.md](../spec.md), решение 2.

## Что сделать

- `interfaces/vflow-settings.interface.ts`: `VflowSettings` — ключи и типы всех инпутов настроек `VflowComponent` (всё из региона SETTINGS, кроме `ariaLabelConfig`, плюс `connection` и `keyboardShortcuts`), значения без `undefined`. `VFLOW_SETTINGS_DEFAULTS: Required<VflowSettings>` — текущие дефолты инпутов (`0.5`, `3`, `'auto'`, `DEFAULT_OPTIMIZATION`, `DEFAULT_SELECTION_BOX`, `{}` для `connection` и `keyboardShortcuts`, …).
- Токен `VFLOW_SETTINGS: InjectionToken<Signal<Partial<VflowSettings>>>`; `withSettings(value: Partial<VflowSettings> | (() => Partial<VflowSettings> | Signal<Partial<VflowSettings>>))` → `vflowFeature('settings', [provideMerged(VFLOW_SETTINGS, value)])`.
- Инпуты `VflowComponent`: `input<T | undefined>()` без значения, без `transform`; JSDoc «Default: …» остаётся. `nonNegative` и `withDefaults` переезжают в резолвер.
- `bindVflowInputs`: `const provided = inject(VFLOW_SETTINGS, { optional: true })`; для каждого ключа `computed(() => resolve(flow[key](), provided?.()[key], VFLOW_SETTINGS_DEFAULTS[key]))`. Скаляры — первый определённый; объектные (`optimization`, `selectionBox`, `connection`, `keyboardShortcuts`) — `withDefaults` в три слоя; `autoPan` и `alignmentHelper` — `boolean | объект`: объекты сливаются, `boolean` заменяет целиком. Санитизация расстояний (`paneClickDistance`, пороги) — на результате. `settings.bind()`, `entities.connectionSettings.bind()`, `keyboard.bindShortcuts()` получают резолвленные сигналы; `FlowSettingsSources` не меняется.
- Экспорт: `VflowSettings`, `VFLOW_SETTINGS_DEFAULTS`, `VFLOW_SETTINGS`, `withSettings`.
- Docs-демо не трогать (инпуты продолжают работать), кроме проверки, что ни одно демо не полагается на `undefined`-значение инпута.

## Готово, когда

- `settings-inputs.spec.ts` расширен: `provideVflow(withSettings(...))` в `TestBed` providers меняет `FlowSettingsService.minZoom()` и `KeyboardService`-шорткаты; `withSettings` в `providers` компонента-хоста поверх корневого — слияние по ключам; привязанный инпут побеждает провайдер; непривязанный инпут не затирает провайдер; объектные настройки сливаются в три слоя; `autoPan: false` в инпуте перекрывает объект из провайдера; фабрика с `inject()`; сигнал обновляет значение без пересоздания флоу.
- Существующие спеки настроек и e2e зелёные; `nx build ngx-vflow` собирается, в `index.d.ts` инпуты видны как `InputSignal<T | undefined>`.

## Comments

2026-11-08, сделано:

- `interfaces/vflow-settings.interface.ts`: `VflowSettings` (ключи и типы инпутов настроек, без `ariaLabelConfig`) и `VFLOW_SETTINGS_DEFAULTS: Readonly<VflowSettings>`.
- `features/with-settings.ts`: токен `VFLOW_SETTINGS: InjectionToken<Signal<Partial<VflowSettings>>>` и `withSettings(value: FeatureValue<VflowSettings>)` поверх `provideMergedFeatureValue`.
- `VflowComponent`: все инпуты региона SETTINGS, кроме `ariaLabelConfig`, стали `input<T>()` без значения и без `transform`; JSDoc «Default:» на месте; `nonNegative` и импорты дефолтов удалены из компонента.
- `components/vflow/resolve-settings.ts`: `resolveSettings(inputs, provided)` — по сигналу на настройку: скаляры `input ?? provided ?? default`; расстояния через `nonNegative` на результате; `optimization`/`selectionBox`/`connection` — `withDefaults` в три слоя; `autoPan`/`alignmentHelper` — объекты сливаются, boolean заменяет; `keyboardShortcuts` — слияние по секциям `modifiers`/`commands`. `bindVflowInputs` биндит сервисы к результату.
- Экспорт: `withSettings`, `VFLOW_SETTINGS`, `VFLOW_SETTINGS_DEFAULTS`, `VflowSettings`, тип `FeatureValue`.
- Тест `settings-inputs.spec.ts` «reads them back from the flow» скорректирован: `flow.optimization()` теперь отдаёт то, что привязано, слитое значение читается из `settings`.
- Проверено: новый `provided-settings.spec.ts` — 8 тестов (дефолты; корень; хост поверх корня по ключам, включая `connection`; инпут поверх провайдера и откат при `undefined`; трёхслойное слияние `optimization`; `autoPan` объект/boolean; санитизация расстояний; фабрика с `inject()` и живой сигнал). `nx test ngx-vflow --skip-nx-cache`: 475 + 44 (node-dom) зелёные; `nx lint ngx-vflow` чистый; `nx build ngx-vflow` — инпуты в `index.d.ts` как `InputSignal<T | undefined>`, новые символы экспортированы, `ɵ` не прибавилось. Docs e2e не гонялись (тикет 06).
