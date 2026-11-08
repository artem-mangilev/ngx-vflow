# 07. `withShortcuts`, инпут `keyboardShortcuts` удаляется

Status: resolved
Type: task
Blocked by: 02

Решение пользователя 2026-11-08: шорткаты — каталог, как метки; своя фича `withShortcuts`, инпут `[keyboardShortcuts]` больше не нужен.

## Что сделать

- `features/with-shortcuts.ts`: токен `VFLOW_SHORTCUTS: InjectionToken<Signal<KeyboardShortcuts>>`, `withShortcuts(value: FeatureValue<KeyboardShortcuts>)`. Слияние по уровням — по секциям `modifiers` / `commands` (как сейчас в резолвере), а не по верхним ключам: `provideMergedFeatureValue` получает необязательный `merge`.
- Удалить инпут `keyboardShortcuts` из `VflowComponent` и ключ из `VflowSettings` / `VFLOW_SETTINGS_DEFAULTS`; резолвер больше не знает о шорткатах. `bindVflowInputs`: `keyboard.bindShortcuts(inject(VFLOW_SHORTCUTS, { optional: true }) ?? signal({}))`.
- Спеки: `keyboard-navigation.spec.ts` (сигнал на хосте через фабрику), `settings-inputs.spec.ts` и `provided-settings.spec.ts` (тесты шорткатов переезжают в новый `provided-shortcuts.spec.ts`).
- Docs: демо `shortcuts-configuration-demo` (сигнал с формы через фабрику), страница Keyboard shortcuts (раздел конфигурации), Configuration (фича), Migration (инпут удалён), ADR-0011 (абзац про каталоги), Accessibility если упоминает инпут.
- Экспорт: `VFLOW_SHORTCUTS`, `withShortcuts`.

## Готово, когда

- Спек: корень меняет команду; хост дополняет корень по секциям (модификатор с корня + команда с хоста); фабрика с `inject()` и сигнал меняют привязку на лету; без провайдера — дефолты.
- `grep keyboardShortcuts` по `libs` и `apps` пуст, кроме имени типа `KeyboardShortcuts` и страницы миграции.
- `nx test ngx-vflow`, lint, `nx build ngx-vflow`, `nx build docs` зелёные.

## Comments

2026-11-08, сделано:

- `features/with-shortcuts.ts`: токен `VFLOW_SHORTCUTS: InjectionToken<Signal<KeyboardShortcuts>>`, `mergeShortcuts` (по секциям `modifiers` / `commands`), `withShortcuts(value: FeatureValue<KeyboardShortcuts>)`. `provideMergedFeatureValue` принимает необязательный `merge` (по умолчанию `withDefaults`).
- Инпут `keyboardShortcuts` удалён из `VflowComponent`, ключ — из `VflowSettings` и дефолтов; резолвер больше не знает о шорткатах. `bindVflowInputs` биндит `KeyboardService` на `computed(() => shortcuts?.() ?? {})`; дефолты применяет сам сервис, как и раньше.
- Спеки: `keyboard-navigation` и `minimap-navigation` отдают сигнал хоста через фабрику; `viewport-gestures` держит один модульный сигнал, провайдится в `TestBed` и сбрасывается в `beforeEach`; тесты шорткатов из `settings-inputs` / `provided-settings` переехали в новый `provided-shortcuts.spec.ts` (4 теста: дефолты; корень с дефолтами для пропущенных записей; хост поверх корня по секциям; фабрика и сигнал на лету).
- Docs: оба демо Keyboard shortcuts на провайдере (второе — фабрика с сигналом формы), раздел Customization, Viewport gestures (три места), Selecting, Selection box, Configuration (фича `withShortcuts` и оговорка про каталоги), Migration (пункт и строка Removed APIs), ADR-0011 («четыре фичи», правило про каталоги), spec.md (решение 3a).
- Проверено: `nx test ngx-vflow` 487 + 44; `nx lint ngx-vflow`, `nx lint docs`; `nx build ngx-vflow` (`keyboardShortcuts` в `index.d.ts` нет, `withShortcuts` / `VFLOW_SHORTCUTS` есть, `ɵ` не прибавилось); `nx build docs`. e2e Keyboard shortcuts — в тикете 06.
